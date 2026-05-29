/**
 * search.js - 카카오 로컬 API로 주변 저가 커피 매장 검색
 * ✅ 카카오는 위도/경도 + 반경 검색 지원! 프록시 서버 불필요!
 */
const SearchManager = (() => {
  let currentLat = null;
  let currentLng = null;
  let allStores = [];
  let filteredStores = [];
  let activeFilter = 'all';
  let activeSort = 'distance';
  let searchRadius = CONFIG.DEFAULT_RADIUS;

  // ── 5분 캐시 ────────────────────────────────────────────
  // key: "lat,lng,radius" (소수점 4자리 반올림)  value: { ts, stores }
  const cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000; // 5분 (ms)

  function cacheKey(lat, lng, radius) {
    return `${lat.toFixed(4)},${lng.toFixed(4)},${radius}`;
  }
  function getCached(lat, lng, radius) {
    const k = cacheKey(lat, lng, radius);
    const entry = cache.get(k);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(k); return null; }
    return entry.stores;
  }
  function setCached(lat, lng, radius, stores) {
    cache.set(cacheKey(lat, lng, radius), { ts: Date.now(), stores });
  }

  // ── 두 좌표 간 거리 계산 (Haversine) ────────────────────
  function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ── 단일 브랜드 검색 (카카오 키워드 검색 API) ───────────
  // 로컬 개발: REST Key 직접 사용 / 프로덕션: /api/search 프록시 경유
  function searchBrand(brand, lat, lng, radius) {
    return new Promise((resolve, reject) => {
      const restKey = CONFIG.KAKAO_REST_API_KEY;
      let url, fetchOptions;

      if (restKey) {
        // 로컬 개발 — Kakao REST API 직접 호출
        url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
        url.searchParams.set('query', brand.query);
        url.searchParams.set('x', lng);
        url.searchParams.set('y', lat);
        url.searchParams.set('radius', radius);
        url.searchParams.set('size', 15);
        url.searchParams.set('sort', 'distance');
        url.searchParams.set('category_group_code', 'CE7');
        fetchOptions = { headers: { 'Authorization': `KakaoAK ${restKey}` } };
      } else {
        // 프로덕션 — 서버리스 프록시 경유 (REST Key 서버에서만 보관)
        url = new URL('/api/search', location.origin);
        url.searchParams.set('query', brand.query);
        url.searchParams.set('x', lng);
        url.searchParams.set('y', lat);
        url.searchParams.set('radius', radius);
        fetchOptions = {};
      }

      // ── 5초 타임아웃 ────────────────────────────────────────
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      fetch(url.toString(), { ...fetchOptions, signal: controller.signal })
        .then(res => {
          clearTimeout(timeoutId);
          // ── [FIX RULE-06-B] HTTP 에러 코드 보존 후 reject ──
          if (!res.ok) {
            const err = new Error(`HTTP ${res.status}`);
            err.httpStatus = res.status;
            throw err;
          }
          return res.json();
        })
        .then(data => {
          if (!data.documents || data.documents.length === 0) {
            resolve([]);
            return;
          }

          const stores = data.documents.map(item => ({
            id: item.id,
            name: item.place_name,
            address: item.road_address_name || item.address_name,
            phone: item.phone,
            lat: parseFloat(item.y),
            lng: parseFloat(item.x),
            distance: parseFloat(item.distance) || calcDistance(lat, lng, parseFloat(item.y), parseFloat(item.x)),
            brandKey: brand.key,
            kakaoUrl: item.place_url,
          }));

          resolve(stores);
        })
        .catch(err => {
          clearTimeout(timeoutId);
          console.error(`[저커버그] ${brand.label} 검색 실패:`, err.message);
          // AbortError → 타임아웃 코드 부착
          if (err.name === 'AbortError') err.code = 'TIMEOUT';
          reject(err); // ← 이전: resolve([]) 로 삼켰음 → 이제 reject 전파
        });
    });
  }

  // ── 전체 브랜드 동시 검색 ───────────────────────────────
  async function searchAllBrands(lat, lng) {
    currentLat = lat;
    currentLng = lng;

    // 캐시 확인 (전체 브랜드 검색일 때만 캐시 적용)
    if (activeFilter === 'all') {
      const cached = getCached(lat, lng, searchRadius);
      if (cached) {
        console.log('[저커버그] 캐시 적중 — API 호출 생략');
        allStores = cached;
        applyFilterAndSort();
        return filteredStores;
      }
    }

    const brandsToSearch = activeFilter === 'all'
      ? CONFIG.BRANDS
      : CONFIG.BRANDS.filter(b => b.key === activeFilter);

    // ── [FIX RULE-06-A] 오프라인 선체크 ────────────────────
    if (!navigator.onLine) {
      throw Object.assign(
        new Error('인터넷 연결이 없어요. 네트워크를 확인해 주세요. 📵'),
        { code: 'OFFLINE' }
      );
    }

    // 모든 브랜드 병렬 검색
    const results = await Promise.allSettled(
      brandsToSearch.map(b => searchBrand(b, lat, lng, searchRadius))
    );

    // ── [FIX RULE-06-B/E] 에러 집계 → 전체 실패 시 의미있는 에러 throw ──
    const errors = results.filter(r => r.status === 'rejected').map(r => r.reason);

    // 중복 제거 후 합치기
    const seen = new Set();
    allStores = results
      .flatMap(r => r.status === 'fulfilled' ? r.value : [])
      .filter(s => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });

    // 모든 브랜드가 실패하고 결과도 없으면 에러 전파 (부분 실패는 결과 표시)
    if (allStores.length === 0 && errors.length === brandsToSearch.length && errors.length > 0) {
      const e = errors[0];
      if (!navigator.onLine || e?.code === 'OFFLINE') {
        throw Object.assign(new Error('인터넷 연결이 없어요. 네트워크를 확인해 주세요. 📵'), { code: 'OFFLINE' });
      } else if (e?.httpStatus === 401) {
        throw Object.assign(new Error('API 키가 유효하지 않아요. (401 인증 오류)'), { code: 'AUTH' });
      } else if (e?.httpStatus === 429) {
        throw Object.assign(new Error('API 요청 한도를 초과했어요. 잠시 후 다시 시도해 주세요. (429)'), { code: 'RATE_LIMIT' });
      } else if (e?.code === 'TIMEOUT') {
        throw Object.assign(new Error('서버 응답이 너무 느려요 (5초 초과). 잠시 후 다시 시도해 주세요.'), { code: 'TIMEOUT' });
      } else {
        throw new Error('매장 정보를 불러오는 중 오류가 발생했어요.');
      }
    }

    // 전체 검색 결과는 캐시에 저장
    if (activeFilter === 'all') setCached(lat, lng, searchRadius, allStores);

    applyFilterAndSort();
    return filteredStores;
  }

  // ── 필터 + 정렬 적용 ────────────────────────────────────
  function applyFilterAndSort() {
    filteredStores = activeFilter === 'all'
      ? [...allStores]
      : allStores.filter(s => s.brandKey === activeFilter);

    if (activeSort === 'distance') {
      filteredStores.sort((a, b) => a.distance - b.distance);
    } else {
      filteredStores.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // ── 텍스트 검색 ─────────────────────────────────────────
  async function searchByText(query) {
    if (!currentLat) {
      UIManager.showToast('위치 정보가 필요합니다!', 'error');
      return [];
    }
    // 브랜드 매칭
    const matched = CONFIG.BRANDS.find(b =>
      query.includes(b.label) || query.includes(b.key) || query.includes(b.short)
    );
    const brand = matched || {
      key: 'custom', label: '검색결과',
      query, short: '?', color: '#555', bg: '#f5f5f5', pin: '?',
    };

    const stores = await searchBrand(brand, currentLat, currentLng, searchRadius);
    allStores = stores;
    applyFilterAndSort();
    return filteredStores;
  }

  function setFilter(key) { activeFilter = key; applyFilterAndSort(); return filteredStores; }
  function setSort(key)   { activeSort = key;   applyFilterAndSort(); return filteredStores; }
  function setRadius(m)   { searchRadius = m; }
  function getBrand(key)  { return CONFIG.BRANDS.find(b => b.key === key); }
  function getFilteredStores() { return filteredStores; }
  function getCurrentLocation() { return { lat: currentLat, lng: currentLng }; }

  return {
    searchAllBrands, searchByText,
    setFilter, setSort, setRadius,
    getBrand, getFilteredStores, getCurrentLocation,
  };
})();
