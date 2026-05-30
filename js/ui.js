/**
 * ui.js — UI 렌더링 (매장 목록, 바텀시트, 토스트, 즐겨찾기)
 */
const UIManager = (() => {
  const FAV_KEY = 'jkb_favorites';

  function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '{}'); } catch { return {}; }
  }
  function saveFavs(obj) { localStorage.setItem(FAV_KEY, JSON.stringify(obj)); }
  function isFav(id) { return !!getFavs()[id]; }
  function toggleFav(store) {
    const favs = getFavs();
    if (favs[store.id]) { delete favs[store.id]; saveFavs(favs); return false; }
    favs[store.id] = store;
    saveFavs(favs);
    return true;
  }

  function fmtDist(m) {
    return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
  }

  // ── 매장 목록 렌더링 ─────────────────────────────────────
  function renderStoreList(stores, onClickCb) {
    const list   = document.getElementById('storeList');
    const empty  = document.getElementById('emptyState');
    const result = document.getElementById('resultText');
    const badge  = document.getElementById('countBadge');
    const r      = CONFIG.DEFAULT_RADIUS >= 1000
      ? `${CONFIG.DEFAULT_RADIUS / 1000}km` : `${CONFIG.DEFAULT_RADIUS}m`;

    badge.textContent = `매장 ${stores.length}개`;

    if (stores.length === 0) {
      list.innerHTML = '';
      list.appendChild(empty);
      empty.style.display = 'flex';
      empty.querySelector('p').textContent = '주변에 매장이 없어요 😅';
      empty.querySelector('small').textContent = '반경을 늘리거나 다른 브랜드를 선택해 보세요';
      result.textContent = '검색된 매장이 없습니다';
      return;
    }

    result.innerHTML = `반경 ${r} · <strong>${stores.length}개</strong> 매장 발견`;
    list.innerHTML = '';
    empty.style.display = 'none';
    list.appendChild(empty);

    const frag = document.createDocumentFragment();
    stores.forEach((store, idx) => {
      const brand = SearchManager.getBrand(store.brandKey)
        || { color: '#555', bg: '#f5f5f5', short: '?', label: store.brandKey };

      const el = document.createElement('div');
      el.className = 'store-item';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.dataset.idx = idx;
      el.innerHTML =
        `<div class="store-badge" style="background:${brand.bg};color:${brand.color};">${brand.short}</div>` +
        `<div class="store-info">` +
        `<div class="store-name">${store.name}</div>` +
        `<div class="store-addr">${store.address}</div>` +
        `<div class="store-meta">` +
        `<span class="dist" style="color:${brand.color}">📍 ${fmtDist(store.distance)}</span>` +
        (store.phone ? `<span class="phone">📞 ${store.phone}</span>` : '') +
        `</div></div><span class="arrow">›</span>`;

      const handler = () => onClickCb(stores[idx]);
      el.addEventListener('click', handler);
      el.addEventListener('keydown', e => { if (e.key === 'Enter') handler(); });
      frag.appendChild(el);
    });
    list.appendChild(frag);
  }

  // ── 바텀시트 열기 ────────────────────────────────────────
  function openSheet(store) {
    const brand = SearchManager.getBrand(store.brandKey)
      || { color: '#555', bg: '#f5f5f5', label: store.brandKey };
    const faved = isFav(store.id);
    const body  = document.getElementById('sheetBody');

    const header = document.createElement('div');
    header.className = 'sheet-header';

    const badge = document.createElement('div');
    badge.className = 'sheet-badge';
    badge.style.cssText = `background:${brand.bg};color:${brand.color};`;
    badge.textContent = brand.label;

    const nameBlock = document.createElement('div');
    nameBlock.style.flex = '1';
    const nameEl = document.createElement('div');
    nameEl.className = 'sheet-name';
    nameEl.textContent = store.name;
    const distEl = document.createElement('div');
    distEl.className = 'sheet-dist';
    distEl.style.color = brand.color;
    distEl.textContent = `📍 ${fmtDist(store.distance)}`;
    nameBlock.appendChild(nameEl);
    nameBlock.appendChild(distEl);

    const favBtn = document.createElement('button');
    favBtn.className = 'btn-fav';
    favBtn.setAttribute('aria-label', '즐겨찾기');
    favBtn.textContent = faved ? '❤️' : '🤍';
    favBtn.addEventListener('click', () => {
      const added = toggleFav(store);
      favBtn.textContent = added ? '❤️' : '🤍';
      showToast(added ? '즐겨찾기에 추가했어요 ❤️' : '즐겨찾기에서 제거했어요');
    });

    header.appendChild(badge);
    header.appendChild(nameBlock);
    header.appendChild(favBtn);

    const rows = document.createElement('div');
    rows.className = 'sheet-rows';

    const addrRow = document.createElement('div');
    addrRow.className = 'sheet-row';
    const addrIcon = document.createElement('span');
    addrIcon.textContent = '📌';
    const addrText = document.createElement('span');
    addrText.textContent = store.address;
    addrRow.appendChild(addrIcon);
    addrRow.appendChild(addrText);
    rows.appendChild(addrRow);

    if (store.phone) {
      const phoneRow = document.createElement('div');
      phoneRow.className = 'sheet-row';
      const phoneIcon = document.createElement('span');
      phoneIcon.textContent = '📞';
      const phoneLink = document.createElement('a');
      phoneLink.href = `tel:${store.phone}`;
      phoneLink.style.cssText = `color:${brand.color};font-weight:500;`;
      phoneLink.textContent = store.phone;
      phoneRow.appendChild(phoneIcon);
      phoneRow.appendChild(phoneLink);

      // 영업시간 뱃지
      const brandHours = SearchManager.getBrand(store.brandKey)?.hours;
      if (brandHours) {
        const h = new Date().getHours();
        const isOpen = h >= brandHours.open && h < brandHours.close;
        const badge = document.createElement('span');
        badge.className = isOpen ? 'hours-badge open' : 'hours-badge closed';
        badge.textContent = isOpen
          ? `영업중 (~${brandHours.close}시)`
          : `영업종료 (${brandHours.open}시~)`;
        phoneRow.appendChild(badge);
      }

      rows.appendChild(phoneRow);
    }

    const actions = document.createElement('div');
    actions.className = 'sheet-actions';

    const navBtn = document.createElement('button');
    navBtn.className = 'btn-primary';
    navBtn.textContent = '🗺️ 카카오맵으로 길찾기';
    navBtn.addEventListener('click', () => {
      const loc = SearchManager.getCurrentLocation();
      const dest = `${encodeURIComponent(store.name)},${store.lat},${store.lng}`;
      const url = (loc.lat && loc.lng)
        ? `https://map.kakao.com/link/from/${encodeURIComponent('내 위치')},${loc.lat},${loc.lng}/to/${dest}`
        : `https://map.kakao.com/link/to/${dest}`;
      window.open(url, '_blank');
    });
    actions.appendChild(navBtn);

    if (store.kakaoUrl) {
      const detailBtn = document.createElement('button');
      detailBtn.className = 'btn-secondary';
      detailBtn.textContent = '🔍 카카오맵 상세보기';
      detailBtn.addEventListener('click', () => window.open(store.kakaoUrl, '_blank'));
      actions.appendChild(detailBtn);
    }

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-secondary';
    copyBtn.textContent = '📋 주소 복사';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(store.address)
        .then(() => showToast('주소 복사됐어요! 📋'))
        .catch(() => showToast('복사 실패 — 직접 복사해 주세요', 'error'));
    });
    actions.appendChild(copyBtn);

    body.innerHTML = '';
    body.appendChild(header);
    body.appendChild(rows);
    body.appendChild(actions);

    document.getElementById('sheet').classList.add('open');
    document.getElementById('backdrop').classList.add('show');
  }

  function closeSheet() {
    document.getElementById('sheet').classList.remove('open');
    document.getElementById('backdrop').classList.remove('show');
  }

  function setLoading(on) {
    document.getElementById('mapLoading').style.display = on ? 'flex' : 'none';
    if (on) document.getElementById('resultText').textContent = '매장 탐색 중...';
  }

  function setLocLabel(text) {
    document.getElementById('locText').textContent = text;
  }

  function startClock() {
    const el = document.getElementById('clock');
    const tick = () => {
      if (!el) return;
      const n = new Date();
      el.textContent =
        `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
    };
    tick();
    setInterval(tick, 30000);
  }

  // ── 즐겨찾기 목록 렌더링 ────────────────────────────────
  function renderFavList(onClickCb) {
    const list   = document.getElementById('storeList');
    const empty  = document.getElementById('emptyState');
    const result = document.getElementById('resultText');
    const badge  = document.getElementById('countBadge');
    const stores = Object.values(getFavs());

    badge.textContent  = `즐겨찾기 ${stores.length}개`;
    result.textContent = `즐겨찾기 ${stores.length}개 매장`;

    if (stores.length === 0) {
      list.innerHTML = '';
      list.appendChild(empty);
      empty.style.display = 'flex';
      empty.querySelector('p').textContent = '즐겨찾기한 매장이 없어요 🤍';
      empty.querySelector('small').textContent = '매장 상세에서 ❤️ 버튼으로 추가하세요';
      return;
    }

    list.innerHTML = '';
    empty.style.display = 'none';
    list.appendChild(empty);

    const frag = document.createDocumentFragment();
    stores.forEach(store => {
      const brand = SearchManager.getBrand(store.brandKey)
        || { color: '#555', bg: '#f5f5f5', short: '?', label: store.brandKey };

      const item = document.createElement('div');
      item.className = 'store-item';
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.innerHTML =
        `<div class="store-badge" style="background:${brand.bg};color:${brand.color};">${brand.short}</div>` +
        `<div class="store-info">` +
        `<div class="store-name">${store.name}</div>` +
        `<div class="store-addr">${store.address}</div>` +
        `<div class="store-meta"><span class="dist" style="color:${brand.color}">❤️ 즐겨찾기</span>` +
        (store.phone ? `<span class="phone">📞 ${store.phone}</span>` : '') +
        `</div></div><span class="arrow">›</span>`;

      const handler = () => onClickCb(store);
      item.addEventListener('click', handler);
      item.addEventListener('keydown', e => { if (e.key === 'Enter') handler(); });
      frag.appendChild(item);
    });
    list.appendChild(frag);
  }

  // ── 토스트 ───────────────────────────────────────────────
  function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
  }

  // ── 오류 + 재시도 버튼 ───────────────────────────────────
  function renderError(msg, retryCb) {
    const list   = document.getElementById('storeList');
    const empty  = document.getElementById('emptyState');
    const result = document.getElementById('resultText');
    const badge  = document.getElementById('countBadge');

    badge.textContent  = '매장 0개';
    result.textContent = '검색 실패';

    list.innerHTML = '';
    empty.style.display = 'flex';
    empty.querySelector('p').textContent = msg || '오류가 발생했어요 😥';
    empty.querySelector('small').textContent = '아래 버튼을 눌러 다시 시도해 보세요';
    list.appendChild(empty);

    let retryBtn = empty.querySelector('.retry-btn');
    if (!retryBtn) {
      retryBtn = document.createElement('button');
      retryBtn.className = 'retry-btn';
      empty.appendChild(retryBtn);
    }
    retryBtn.textContent = '🔄 다시 시도';
    retryBtn.onclick = retryCb;
  }

  return {
    renderStoreList, renderFavList, openSheet, closeSheet,
    setLoading, setLocLabel, startClock, showToast, renderError,
  };
})();
