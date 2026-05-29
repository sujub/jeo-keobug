/**
 * api/config.js — Vercel 서버리스 함수
 * 카카오 JS Key를 안전하게 클라이언트에 전달
 * (JS Key는 도메인 등록으로 보호됨 — 노출 자체는 Kakao 정책상 허용)
 */
export default function handler(req, res) {
  const jsKey = process.env.KAKAO_JS_KEY || '';
  if (!jsKey) {
    return res.status(500).json({ error: 'KAKAO_JS_KEY 환경 변수가 설정되지 않았습니다.' });
  }
  // JS Key는 짧게 캐시 (변경 가능성 대비)
  res.setHeader('Cache-Control', 's-maxage=3600');
  return res.status(200).json({ jsKey });
}
