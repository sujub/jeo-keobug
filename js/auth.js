/**
 * auth.js — 토스 로그인 + 즐겨찾기 서버 동기화
 *
 * - 토스 앱 안에서 appLogin() 호출 → authorizationCode 획득
 * - /api/login 에서 userKey 교환 (서버사이드)
 * - userKey를 localStorage에 저장해 세션 유지
 * - 즐겨찾기 추가/제거 시 /api/favorites 에 자동 동기화
 */
const Auth = (() => {
  const KEY_USER   = 'jkb_userKey';
  const KEY_SYNCED = 'jkb_synced';   // 최초 동기화 완료 여부

  // ── 상태 접근 ──────────────────────────────────────────────
  function getUserKey()  { return localStorage.getItem(KEY_USER) || null; }
  function isLoggedIn()  { return !!getUserKey(); }
  function clearSession() {
    localStorage.removeItem(KEY_USER);
    localStorage.removeItem(KEY_SYNCED);
  }

  // ── SDK 준비 대기 ─────────────────────────────────────────
  function waitForSdk(timeoutMs = 3000) {
    return new Promise((resolve) => {
      if (window.__tossSDK?.appLogin) { resolve(window.__tossSDK); return; }
      const onReady = () => resolve(window.__tossSDK);
      window.addEventListener('toss-sdk-ready', onReady, { once: true });
      setTimeout(() => {
        window.removeEventListener('toss-sdk-ready', onReady);
        resolve(null);   // SDK 없음 (일반 브라우저 환경)
      }, timeoutMs);
    });
  }

  // ── 로그인 ────────────────────────────────────────────────
  async function login() {
    const sdk = await waitForSdk();
    if (!sdk?.appLogin) {
      throw new Error('토스 앱에서만 로그인할 수 있어요 🐝');
    }

    // 1. 클라이언트: 인가 코드 획득
    const { authorizationCode, referrer } = await sdk.appLogin();

    // 2. 서버: 인가 코드 → userKey 교환
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationCode, referrer }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || '로그인에 실패했습니다');
    }

    const { userKey } = await res.json();
    localStorage.setItem(KEY_USER, String(userKey));
    return userKey;
  }

  // ── 서버에서 즐겨찾기 불러오기 ───────────────────────────
  async function fetchFavorites(userKey) {
    try {
      const res = await fetch(`/api/favorites?userKey=${userKey}`);
      if (!res.ok) return null;
      const { favorites } = await res.json();
      return favorites || {};
    } catch {
      return null;
    }
  }

  // ── 서버에 즐겨찾기 저장 (fire-and-forget) ──────────────
  function pushFavorites(favorites) {
    const userKey = getUserKey();
    if (!userKey) return;
    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey, favorites }),
    }).catch(e => console.warn('[auth] 즐겨찾기 동기화 실패:', e.message));
  }

  // ── 로그인 후 초기 동기화 (서버 → 로컬) ─────────────────
  // 기존 localStorage 즐겨찾기를 서버와 병합해 반환
  async function syncOnLogin(localFavs) {
    const userKey = getUserKey();
    if (!userKey) return localFavs;

    const serverFavs = await fetchFavorites(userKey);
    if (!serverFavs) return localFavs;

    // 병합: 로컬 + 서버 (로컬 우선)
    const merged = { ...serverFavs, ...localFavs };

    // 병합 결과를 서버에 다시 저장
    pushFavorites(merged);
    localStorage.setItem(KEY_SYNCED, '1');

    return merged;
  }

  return {
    getUserKey,
    isLoggedIn,
    login,
    clearSession,
    fetchFavorites,
    pushFavorites,
    syncOnLogin,
  };
})();
