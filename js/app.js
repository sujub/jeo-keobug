/**
 * app.js — 저커버그 메인 컨트롤러
 */
const App = (() => {

  // ── GPS 위치 가져오기 ────────────────────────────────────
  function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('이 브라우저는 위치 기능을 지원하지 않아요.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        err => {
          const msg = {
            1: '위치 권한이 거부됐어요. 브라우저 설정에서 허용해 주세요.',
            2: '현재 위치를 가져올 수 없어요.',
            3: '위치 요청 시간이 초과됐어요.',
          };
          reject(new Error(msg[err.code] || '위치 오류'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // ── 좌표 → 행정동 주소 변환 ─────────────────────────────
  function getAddress(lat, lng) {
    return new Promise(resolve => {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(lng, lat, (result, status) => {
        if (status !== kakao.maps.services.Status.OK) { resolve('현재 위치'); return; }
        const region = result.find(r => r.region_type === 'H') || result[0];
        const label  = [region.region_2depth_name, region.region_3depth_name]
          .filter(Boolean).join(' ');
        resolve(label || '현재 위치');
      });
    });
  }

  // ── 지도에 마커 렌더링 ──────────────────────────────────
  function renderMarkers(stores) {
    MapManager.clearMarkers();
    stores.forEach(store => {
      const brand = SearchManager.getBrand(store.brandKey);
      if (!brand) return;
      MapManager.addStoreMarker(store, brand, s => UIManager.openSheet(s));
    });
    // fitBounds는 첫 탐색 시에만 (필터·정렬 변경 시 지도 위치 유지)
    if (stores.length > 0 && !MapManager.isBoundSet()) {
      MapManager.fitBounds(stores);
      MapManager.setBoundSet(true);
    }
  }

  // ── 검색 실행 ───────────────────────────────────────────
  async function runSearch(lat, lng) {
    UIManager.setLoading(true);
    MapManager.setBoundSet(false);
    try {
      const stores = await SearchManager.searchAllBrands(lat, lng);
      renderMarkers(stores);
      UIManager.renderStoreList(stores, store => {
        MapManager.panTo(store.lat, store.lng);
        UIManager.openSheet(store);
      });
      updateMapPanel(stores); // 슬라이드 패널 카운트 갱신
    } catch (err) {
      console.error('[저커버그]', err);
      const msg = err.message || '검색 중 오류가 발생했어요.';
      UIManager.showToast(msg, 'error');
      UIManager.renderError(msg, () => runSearch(lat, lng));
    } finally {
      UIManager.setLoading(false);
    }
  }

  // ── 슬라이드업 패널 ─────────────────────────────────────
  function updateMapPanel(stores) {
    const label = document.getElementById('mapPanelLabel');
    if (!label) return;
    label.textContent = stores.length > 0
      ? `매장 ${stores.length}개 · 위로 밀어 목록 보기 ↑`
      : '주변 매장이 없어요 😅';
  }

  function renderMapPanelList() {
    const body = document.getElementById('mapPanelList');
    if (!body) return;
    const stores = SearchManager.getFilteredStores();
    body.innerHTML = '';
    if (stores.length === 0) {
      body.innerHTML = '<div style="padding:24px;text-align:center;color:#aaa;font-size:13px;">주변 매장이 없어요 😅</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    stores.forEach(store => {
      const brand = SearchManager.getBrand(store.brandKey)
        || { color: '#555', bg: '#f5f5f5', short: '?', label: store.brandKey };
      const el = document.createElement('div');
      el.className = 'store-item';
      el.tabIndex = 0;
      const distM = store.distance;
      const dist  = distM < 1000 ? `${Math.round(distM)}m` : `${(distM/1000).toFixed(1)}km`;
      el.innerHTML =
        `<div class="store-badge" style="background:${brand.bg};color:${brand.color};">${brand.short}</div>` +
        `<div class="store-info">` +
        `<div class="store-name">${store.name}</div>` +
        `<div class="store-addr">${store.address}</div>` +
        `<div class="store-meta"><span class="dist" style="color:${brand.color}">📍 ${dist}</span>` +
        (store.phone ? `<span class="phone">📞 ${store.phone}</span>` : '') +
        `</div></div><span class="arrow">›</span>`;
      el.addEventListener('click', () => {
        MapManager.panTo(store.lat, store.lng);
        UIManager.openSheet(store);
        collapseMapPanel();
      });
      frag.appendChild(el);
    });
    body.appendChild(frag);
  }

  function expandMapPanel() {
    const panel = document.getElementById('mapPanel');
    if (!panel) return;
    renderMapPanelList();
    panel.classList.add('expanded');
  }

  function collapseMapPanel() {
    const panel = document.getElementById('mapPanel');
    if (panel) panel.classList.remove('expanded');
  }

  function initMapPanel() {
    const panel  = document.getElementById('mapPanel');
    const handle = document.getElementById('mapPanelHandle');
    const mapEl  = document.getElementById('map');
    if (!panel || !handle) return;

    // bottom-nav 높이만큼 패널 위치 조정
    const navH = document.querySelector('.bottom-nav')?.offsetHeight || 60;
    panel.style.bottom = navH + 'px';

    // 핸들 탭 → 토글
    handle.addEventListener('click', () => {
      panel.classList.contains('expanded') ? collapseMapPanel() : expandMapPanel();
    });

    // 패널 위에서 아래로 스와이프 → 접기
    let startY = 0;
    panel.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener('touchend', e => {
      if (e.changedTouches[0].clientY - startY > 50) collapseMapPanel();
    }, { passive: true });

    // 지도 위에서 위로 스와이프 → 펼치기
    mapEl.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    mapEl.addEventListener('touchend', e => {
      if (!document.body.classList.contains('map-mode')) return;
      if (startY - e.changedTouches[0].clientY > 50) expandMapPanel();
    }, { passive: true });
  }

  // ── 수동 주소 입력 모달 ─────────────────────────────────
  function openAddrModal() {
    document.getElementById('addrModal').classList.add('show');
    document.getElementById('addrInput').focus();
  }

  function closeAddrModal() {
    document.getElementById('addrModal').classList.remove('show');
    document.getElementById('addrResults').innerHTML = '';
    document.getElementById('addrInput').value = '';
  }

  function searchAddress(query) {
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(query, (data, status) => {
      const ul = document.getElementById('addrResults');
      ul.innerHTML = '';
      if (status !== kakao.maps.services.Status.OK || data.length === 0) {
        ul.innerHTML = '<li style="color:#aaa;cursor:default;">검색 결과가 없어요</li>';
        return;
      }
      data.slice(0, 6).forEach(place => {
        const li = document.createElement('li');
        li.innerHTML =
          `<div>${place.place_name}</div>` +
          `<div class="addr-sub">${place.road_address_name || place.address_name}</div>`;
        li.addEventListener('click', async () => {
          const lat = parseFloat(place.y);
          const lng = parseFloat(place.x);
          closeAddrModal();
          MapManager.setMyLocation(lat, lng);
          UIManager.setLocLabel(place.place_name || place.address_name);
          await runSearch(lat, lng);
        });
        ul.appendChild(li);
      });
    });
  }

  function bindAddrModal() {
    document.getElementById('addrSearchBtn').addEventListener('click', () => {
      const q = document.getElementById('addrInput').value.trim();
      if (q) searchAddress(q);
    });
    document.getElementById('addrInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) searchAddress(q);
      }
    });
    document.getElementById('addrModal').addEventListener('click', e => {
      if (e.target === document.getElementById('addrModal')) closeAddrModal();
    });
  }

  // ── 이벤트 바인딩 ───────────────────────────────────────
  function bindEvents() {

    // 내 위치 버튼 (지도 위 ⊕)
    document.getElementById('myLocBtn').addEventListener('click', async () => {
      try {
        UIManager.setLoading(true);
        const { lat, lng } = await getLocation();
        MapManager.setMyLocation(lat, lng);
        const addr = await getAddress(lat, lng);
        UIManager.setLocLabel(addr);
        await runSearch(lat, lng);
      } catch (err) {
        UIManager.setLoading(false);
        openAddrModal();
      }
    });

    // 브랜드 필터 칩
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const stores = SearchManager.setFilter(chip.dataset.brand);
        renderMarkers(stores);
        UIManager.renderStoreList(stores, store => {
          MapManager.panTo(store.lat, store.lng);
          UIManager.openSheet(store);
        });
      });
    });

    // 정렬 버튼
    document.querySelectorAll('.sort').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sort').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const stores = SearchManager.setSort(btn.dataset.sort);
        UIManager.renderStoreList(stores, store => {
          MapManager.panTo(store.lat, store.lng);
          UIManager.openSheet(store);
        });
      });
    });

    // 반경 토글
    const opts = CONFIG.RADIUS_OPTIONS;
    let ridx = opts.indexOf(CONFIG.DEFAULT_RADIUS);
    document.getElementById('radiusBtn').addEventListener('click', async () => {
      ridx = (ridx + 1) % opts.length;
      CONFIG.DEFAULT_RADIUS = opts[ridx];
      document.getElementById('radiusLabel').textContent =
        opts[ridx] >= 1000 ? `${opts[ridx] / 1000}km` : `${opts[ridx]}m`;
      SearchManager.setRadius(opts[ridx]);
      const loc = SearchManager.getCurrentLocation();
      if (loc.lat) await runSearch(loc.lat, loc.lng);
    });

    // 검색창 입력 (디바운스 600ms)
    let timer;
    document.getElementById('searchInput').addEventListener('input', e => {
      clearTimeout(timer);
      const q = e.target.value.trim();
      if (q.length < 2) return;
      timer = setTimeout(async () => {
        UIManager.setLoading(true);
        const stores = await SearchManager.searchByText(q);
        renderMarkers(stores);
        UIManager.renderStoreList(stores, store => {
          MapManager.panTo(store.lat, store.lng);
          UIManager.openSheet(store);
        });
        UIManager.setLoading(false);
      }, 600);
    });

    // 바텀시트 닫기
    document.getElementById('backdrop').addEventListener('click', UIManager.closeSheet);
    document.getElementById('sheetHandle').addEventListener('click', UIManager.closeSheet);

    // 하단 탭
    document.querySelectorAll('.nav').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;

        // 지도 탭: 목록 숨기고 지도 확장 / 나머지: 원래 레이아웃
        const isMapMode = tab === 'map';
        document.body.classList.toggle('map-mode', isMapMode);
        collapseMapPanel(); // 탭 전환 시 패널 닫기
        // CSS 전환(300ms) 후 지도 캔버스 크기 재계산
        setTimeout(() => MapManager.relayout(), 320);

        if (tab === 'fav') {
          UIManager.renderFavList(store => {
            MapManager.panTo(store.lat, store.lng);
            UIManager.openSheet(store);
          });
        }
        if (tab === 'list') {
          const stores = SearchManager.getFilteredStores();
          UIManager.renderStoreList(stores, store => {
            MapManager.panTo(store.lat, store.lng);
            UIManager.openSheet(store);
          });
        }
        if (tab === 'me') UIManager.showToast('내 정보는 곧 추가돼요! 🐛');
      });
    });
  }

  // ── 앱 시작 ─────────────────────────────────────────────
  async function init() {
    UIManager.startClock();
    MapManager.init();
    bindEvents();
    bindAddrModal();
    initMapPanel();

    // 기본 탭이 '지도'이므로 초기에 map-mode 적용 후 재렌더링
    document.body.classList.add('map-mode');
    setTimeout(() => MapManager.relayout(), 100);

    // 오프라인/온라인 감지
    window.addEventListener('offline', () => {
      UIManager.showToast('인터넷 연결이 끊겼어요 📵', 'error');
    });
    window.addEventListener('online', () => {
      UIManager.showToast('인터넷이 다시 연결됐어요 ✅');
      const loc = SearchManager.getCurrentLocation();
      if (loc.lat) runSearch(loc.lat, loc.lng);
    });

    // 개인정보 동의 확인 후 위치 탐색 시작
    UIManager.showPrivacyModal(async () => {
      try {
        const { lat, lng } = await getLocation();
        MapManager.setMyLocation(lat, lng);
        const addr = await getAddress(lat, lng);
        UIManager.setLocLabel(addr);
        await runSearch(lat, lng);
      } catch (err) {
        UIManager.setLocLabel('위치 미설정');
        UIManager.setLoading(false);
        openAddrModal();
      }
    });
  }

  return { init };
})();
