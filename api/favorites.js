/**
 * api/favorites.js — 즐겨찾기 클라우드 저장소
 *
 * GET  /api/favorites?userKey=123  → 즐겨찾기 목록 반환
 * POST /api/favorites               → 즐겨찾기 저장 { userKey, favorites }
 *
 * 저장소: Upstash Redis REST API (npm 패키지 없이 직접 fetch 호출)
 * 환경변수: KV_REST_API_URL, KV_REST_API_TOKEN (Vercel-Upstash 연동 시 자동 주입)
 */

const ALLOWED_ORIGINS = [
  'https://jeo-keobug.vercel.app',
  'https://jeokeo-bug.apps.tossmini.com',
  'https://jeokeo-bug.private-apps.tossmini.com',
];

const FAV_TTL = 31536000; // 1년(초)

function getUpstash() {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Upstash 환경변수(KV_REST_API_URL, KV_REST_API_TOKEN)가 없습니다');
  return { url, token };
}

async function kvGet(key) {
  const { url, token } = getUpstash();
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.result) return null;
  try { return JSON.parse(data.result); } catch { return data.result; }
}

async function kvSet(key, value) {
  const { url, token } = getUpstash();
  // pipeline 방식으로 JSON + TTL 안전하게 저장
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['SET', key, JSON.stringify(value), 'EX', FAV_TTL],
    ]),
  });
  return res.ok;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.tossmini.com')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── GET: 즐겨찾기 불러오기 ─────────────────────────────────
  if (req.method === 'GET') {
    const userKey = req.query?.userKey;
    if (!userKey) return res.status(400).json({ error: 'userKey가 없습니다' });

    try {
      const favorites = (await kvGet(`favs:${userKey}`)) || {};
      return res.status(200).json({ favorites });
    } catch (err) {
      console.error('[favorites GET]', err.message);
      return res.status(500).json({ error: '즐겨찾기를 불러오지 못했습니다' });
    }
  }

  // ── POST: 즐겨찾기 저장 ────────────────────────────────────
  if (req.method === 'POST') {
    const { userKey, favorites } = req.body || {};
    if (!userKey || favorites === undefined) {
      return res.status(400).json({ error: 'userKey와 favorites가 필요합니다' });
    }

    try {
      await kvSet(`favs:${userKey}`, favorites);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[favorites POST]', err.message);
      return res.status(500).json({ error: '즐겨찾기를 저장하지 못했습니다' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
