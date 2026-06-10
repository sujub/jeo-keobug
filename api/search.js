/**
 * api/search.js — Vercel 서버리스 함수
 * Kakao REST API 프록시: REST Key를 서버에서만 보관
 */
const ALLOWED_ORIGINS = [
  'https://jeo-keobug.vercel.app',
  'https://jeokeo-bug.apps.tossmini.com',
  'https://jeokeo-bug.private-apps.tossmini.com',
  '저커버그.kr',
];

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.tossmini.com')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const key = process.env.KAKAO_REST_KEY;
  if (!key) {
    return res.status(500).json({ error: 'KAKAO_REST_KEY 환경 변수가 설정되지 않았습니다.' });
  }

  const { query, x, y, radius } = req.query;
  if (!query || !x || !y) {
    return res.status(400).json({ error: 'query, x, y 파라미터가 필요합니다.' });
  }

  try {
    const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
    url.searchParams.set('query', query);
    url.searchParams.set('x', x);
    url.searchParams.set('y', y);
    url.searchParams.set('radius', radius || 1000);
    url.searchParams.set('size', 15);
    url.searchParams.set('sort', 'distance');
    url.searchParams.set('category_group_code', 'CE7');

    const kakaoRes = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${key}` },
    });

    if (!kakaoRes.ok) {
      const err = await kakaoRes.text();
      return res.status(kakaoRes.status).json({ error: err });
    }

    const data = await kakaoRes.json();

    // 5분 CDN 캐시 (동일 요청 중복 호출 방지)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
