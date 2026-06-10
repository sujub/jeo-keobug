/**
 * api/login.js — 토스 로그인 서버사이드 처리
 *
 * 클라이언트에서 받은 authorizationCode를 서버에서 안전하게 교환해
 * userKey(앱 단위 고유 식별자)를 반환합니다.
 *
 * 흐름: appLogin() → authorizationCode → (서버) → userKey
 */

const ALLOWED_ORIGINS = [
  'https://jeo-keobug.vercel.app',
  'https://jeokeo-bug.apps.tossmini.com',
  'https://jeokeo-bug.private-apps.tossmini.com',
];

const TOSS_BASE = 'https://apps-in-toss-api.toss.im';

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.tossmini.com')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { authorizationCode, referrer } = req.body || {};
  if (!authorizationCode) {
    return res.status(400).json({ error: '인가 코드가 없습니다' });
  }

  try {
    // 1단계: authorizationCode → accessToken
    const tokenRes = await fetch(
      `${TOSS_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizationCode,
          referrer: referrer || 'DEFAULT',
        }),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      console.error('[login] 토큰 발급 실패:', tokenData);
      return res.status(400).json({ error: '토큰 발급에 실패했습니다', detail: tokenData });
    }

    const accessToken = tokenData.success?.accessToken;
    if (!accessToken) {
      return res.status(400).json({ error: 'accessToken을 받지 못했습니다' });
    }

    // 2단계: accessToken → userKey
    const userRes = await fetch(
      `${TOSS_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const userData = await userRes.json();
    const userKey = userData.success?.userKey;
    if (!userKey) {
      console.error('[login] userKey 없음:', userData);
      return res.status(400).json({ error: '사용자 정보를 가져오지 못했습니다' });
    }

    return res.status(200).json({ userKey });
  } catch (err) {
    console.error('[login] 서버 오류:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}
