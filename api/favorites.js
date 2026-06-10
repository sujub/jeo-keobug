/**
 * api/favorites.js — 즐겨찾기 클라우드 저장소
 *
 * GET  /api/favorites?userKey=123  → 즐겨찾기 목록 반환
 * POST /api/favorites               → 즐겨찾기 저장 { userKey, favorites }
 *
 * 저장소: Vercel KV (Redis)
 * 키 형식: favs:{userKey}
 */

import { kv } from '@vercel/kv';

const ALLOWED_ORIGINS = [
  'https://jeo-keobug.vercel.app',
  'https://jeokeo-bug.apps.tossmini.com',
  'https://jeokeo-bug.private-apps.tossmini.com',
];

const FAV_TTL = 60 * 60 * 24 * 365; // 1년

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
      const favorites = (await kv.get(`favs:${userKey}`)) || {};
      return res.status(200).json({ favorites });
    } catch (err) {
      console.error('[favorites GET] 오류:', err);
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
      await kv.set(`favs:${userKey}`, favorites, { ex: FAV_TTL });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[favorites POST] 오류:', err);
      return res.status(500).json({ error: '즐겨찾기를 저장하지 못했습니다' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
