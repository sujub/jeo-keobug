/**
 * map.js — 카카오맵 초기화 및 마커 관리
 *
 * 핀 위치 버그 수정:
 *   기존: CSS transform:translate(-50%,-100%) 로 보정 → 줌 시 기준점 불안정
 *   수정: CustomOverlay에 xAnchor/yAnchor 명시 → CSS transform 제거
 */
const MapManager = (() => {
  let map = null;
  let myMarker = null;
  let markers = [];
  let overlays = [];
  let openOverlay = null;
  let boundSet = false;

  // ── 지도 초기화 ─────────────────────────────────────────
  function init() {
    const container = document.getElementById('map');
    map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(CONFIG.DEFAULT_CENTER.lat, CONFIG.DEFAULT_CENTER.lng),
      level: CONFIG.DEFAULT_ZOOM,
    });

    // 줌 컨트롤 (+/-) 추가
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

    // 지도 클릭 시 열린 말풍선 닫기
    kakao.maps.event.addListener(map, 'click', closeOverlay);

    return map;
  }

  // ── 내 위치 마커 ─────────────────────────────────────────
  function setMyLocation(lat, lng) {
    const pos = new kakao.maps.LatLng(lat, lng);
    if (myMarker) myMarker.setMap(null);

    const el = document.createElement('div');
    el.style.cssText = [
      'width:18px', 'height:18px',
      'background:#4285f4',
      'border:3px solid #fff',
      'border-radius:50%',
      'box-shadow:0 0 0 5px rgba(66,133,244,0.25)',
    ].join(';');

    myMarker = new kakao.maps.CustomOverlay({
      position: pos,
      content: el,
      xAnchor: 0.5, // 원의 가로 중앙
      yAnchor: 0.5, // 원의 세로 중앙
      zIndex: 10,
    });
    myMarker.setMap(map);
    map.setCenter(pos);
    map.setLevel(4);
  }

  // ── 매장 핀 마커 추가 ────────────────────────────────────
  function addStoreMarker(store, brand, onClickCb) {
    // 카카오 API: x=경도(lng), y=위도(lat) → LatLng(위도, 경도)
    const pos = new kakao.maps.LatLng(store.lat, store.lng);

    // ── 핀 DOM ──────────────────────────────────────────────
    const wrap = document.createElement('div');
    // transform 없음 — xAnchor/yAnchor로 위치 결정
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';

    const pin = document.createElement('div');
    pin.style.cssText = [
      'width:30px', 'height:30px',
      `background:${brand.color}`,
      'border-radius:50% 50% 50% 0',
      'transform:rotate(-45deg)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'font-size:10px', 'font-weight:700', 'color:#fff',
      'box-shadow:0 2px 6px rgba(0,0,0,0.3)',
      "font-family:'Noto Sans KR',sans-serif",
      'border:2px solid rgba(255,255,255,0.4)',
    ].join(';');
    const pinText = document.createElement('span');
    pinText.style.transform = 'rotate(45deg)';
    pinText.textContent = brand.pin;
    pin.appendChild(pinText);

    const tail = document.createElement('div');
    tail.style.cssText = `width:2px;height:4px;background:${brand.color};opacity:0.7;`;

    const label = document.createElement('div');
    label.style.cssText = [
      'background:#fff', 'border:0.5px solid #ddd', 'border-radius:4px',
      'padding:2px 5px', "font-size:9px;font-family:'Noto Sans KR',sans-serif",
      'white-space:nowrap', 'max-width:80px', 'overflow:hidden',
      'text-overflow:ellipsis', 'box-shadow:0 1px 3px rgba(0,0,0,0.1)',
      'margin-top:1px',
    ].join(';');
    label.textContent = store.name;

    wrap.appendChild(pin);
    wrap.appendChild(tail);
    wrap.appendChild(label);

    // ── 말풍선 DOM ───────────────────────────────────────────
    const bubble = document.createElement('div');
    bubble.style.cssText = [
      'background:#fff', 'border-radius:10px', 'padding:10px 14px',
      'min-width:150px', 'box-shadow:0 3px 14px rgba(0,0,0,0.18)',
      "font-family:'Noto Sans KR',sans-serif", 'border:0.5px solid #eee',
    ].join(';');
    bubble.innerHTML =
      `<div style="font-size:10px;font-weight:700;color:${brand.color};margin-bottom:3px;">${brand.label}</div>` +
      `<div style="font-size:12px;font-weight:600;color:#1a1a1a;margin-bottom:4px;">${store.name}</div>` +
      `<div style="font-size:10px;color:#888;">${store.address}</div>` +
      `<div style="font-size:11px;font-weight:600;color:${brand.color};margin-top:5px;">${fmtDist(store.distance)}</div>`;

    // ✅ xAnchor/yAnchor 명시 — 줌인/줌아웃 시 핀 위치 고정
    const marker = new kakao.maps.CustomOverlay({
      position: pos,
      content: wrap,
      xAnchor: 0.5, // 가로 중앙
      yAnchor: 1.0, // 콘텐츠 하단이 좌표에 닿음 (핀 꼬리 끝)
      zIndex: 5,
    });

    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content: bubble,
      xAnchor: 0.5,
      yAnchor: 1.5, // 핀보다 위로 띄움
      zIndex: 20,
    });

    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      closeOverlay();
      overlay.setMap(map);
      openOverlay = overlay;
      if (onClickCb) onClickCb(store, brand);
    });

    marker.setMap(map);
    markers.push(marker);
    overlays.push(overlay);
    return marker;
  }

  // ── 말풍선 닫기 ──────────────────────────────────────────
  function closeOverlay() {
    if (openOverlay) {
      openOverlay.setMap(null);
      openOverlay = null;
    }
  }

  // ── 전체 마커 제거 ───────────────────────────────────────
  function clearMarkers() {
    markers.forEach(m => m.setMap(null));
    overlays.forEach(o => o.setMap(null));
    markers = [];
    overlays = [];
    openOverlay = null;
  }

  // ── 마커 전체 보이도록 범위 조정 ─────────────────────────
  function fitBounds(stores) {
    if (stores.length === 0) return;
    const bounds = new kakao.maps.LatLngBounds();
    stores.forEach(s => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)));
    map.setBounds(bounds, 60, 30, 80, 30);
  }

  // ── 특정 위치로 이동 ─────────────────────────────────────
  function panTo(lat, lng) {
    map.setCenter(new kakao.maps.LatLng(lat, lng));
    map.setLevel(3);
  }

  function fmtDist(m) {
    return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
  }

  function getMap()         { return map; }
  function isBoundSet()     { return boundSet; }
  function setBoundSet(v)   { boundSet = v; }
  // 컨테이너 크기 변경 후 지도 재렌더링
  function relayout()       { if (map) map.relayout(); }

  return { init, setMyLocation, addStoreMarker, clearMarkers, fitBounds, panTo, getMap, closeOverlay, isBoundSet, setBoundSet, relayout };
})();
