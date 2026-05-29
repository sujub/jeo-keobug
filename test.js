// 저커버그 로직 단위 테스트
let pass = 0, fail = 0;
function ok(label, cond) {
  if (cond) { console.log('[PASS] ' + label); pass++; }
  else       { console.log('[FAIL] ' + label); fail++; }
}

// 1. Haversine 거리 계산
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
const d = calcDistance(37.5665, 126.9780, 37.5715, 126.9769); // 시청 -> 광화문 (약 580m)
ok('거리 계산 (시청->광화문) 400~700m', d > 400 && d < 700);

// 2. 캐시 키 (소수점 4자리 반올림으로 근접 좌표 동일 처리)
function cacheKey(lat, lng, r) { return lat.toFixed(4)+','+lng.toFixed(4)+','+r; }
// 소수점 4자리 안에서 미세하게 다른 좌표는 동일 키 → 같은 캐시 bucket
const k1 = cacheKey(37.56651, 126.97804, 1000); // toFixed(4) = 37.5665, 126.9780
const k2 = cacheKey(37.56653, 126.97802, 1000); // toFixed(4) = 37.5665, 126.9780
ok('캐시 키 근접 좌표 동일', k1 === k2);
ok('캐시 키 다른 반경 구분', cacheKey(37.5665, 126.9780, 500) !== cacheKey(37.5665, 126.9780, 1000));

// 3. 중복 제거
const stores = [
  {id:'a', name:'메가1'}, {id:'b', name:'컴포즈1'},
  {id:'a', name:'메가1(중복)'}, {id:'c', name:'빽다방1'}
];
const seen = new Set();
const deduped = stores.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
ok('중복 제거 (4개 -> 3개)', deduped.length === 3);
ok('중복 제거 원본 순서 유지', deduped[0].name === '메가1');

// 4. 즐겨찾기 CRUD (localStorage 모킹)
const _store = {};
const localStorage = { getItem: k => _store[k]||null, setItem: (k,v) => { _store[k]=v; } };
const FAV_KEY = 'jkb_favorites';
const getFavs = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)||'{}'); } catch { return {}; } };
const saveFavs = obj => localStorage.setItem(FAV_KEY, JSON.stringify(obj));
const isFav = id => !!getFavs()[id];
const toggleFav = s => { const f=getFavs(); if(f[s.id]){delete f[s.id];saveFavs(f);return false;} f[s.id]=s;saveFavs(f);return true; };

const s1 = {id:'111', name:'메가커피 강남점', brandKey:'메가MGC커피'};
const s2 = {id:'222', name:'컴포즈 종로점',   brandKey:'컴포즈커피'};
ok('초기 즐겨찾기 0개', Object.keys(getFavs()).length === 0);
toggleFav(s1); toggleFav(s2);
ok('2개 추가 후 즐겨찾기 2개', Object.keys(getFavs()).length === 2);
ok('s1 즐겨찾기 확인', isFav(s1.id));
toggleFav(s1);
ok('s1 제거 후 즐겨찾기 1개', Object.keys(getFavs()).length === 1);
ok('s1 제거 확인', !isFav(s1.id));
ok('s2 유지 확인', isFav(s2.id));

// 5. 거리 포맷
function fmtDist(m) { return m < 1000 ? Math.round(m)+'m' : (m/1000).toFixed(1)+'km'; }
ok('거리 포맷 350m', fmtDist(350) === '350m');
ok('거리 포맷 1.2km', fmtDist(1200) === '1.2km');
ok('거리 포맷 경계 999m', fmtDist(999) === '999m');
ok('거리 포맷 경계 1000m = 1.0km', fmtDist(1000) === '1.0km');

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail > 0 ? 1 : 0);
