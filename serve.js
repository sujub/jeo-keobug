/**
 * serve.js — 저커버그 로컬 개발 서버
 *
 * 사용법:
 *   node serve.js          → http://localhost:3000 에서 서버 시작
 *   node serve.js 8080     → 포트 지정
 *
 * ※ Geolocation API 는 localhost 에서는 HTTP 로도 정상 작동합니다.
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2]) || 3000;
const ROOT = __dirname;

const MIME = {
  '.html' : 'text/html; charset=utf-8',
  '.css'  : 'text/css; charset=utf-8',
  '.js'   : 'application/javascript; charset=utf-8',
  '.json' : 'application/json; charset=utf-8',
  '.png'  : 'image/png',
  '.jpg'  : 'image/jpeg',
  '.jpeg' : 'image/jpeg',
  '.gif'  : 'image/gif',
  '.svg'  : 'image/svg+xml',
  '.ico'  : 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff' : 'font/woff',
  '.ttf'  : 'font/ttf',
};

const server = http.createServer((req, res) => {
  // URL에서 쿼리스트링 제거
  let urlPath = req.url.split('?')[0];

  // 루트 → index.html
  if (urlPath === '/') urlPath = '/index.html';

  // 경로 순회 공격 방지
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Not Found: ${urlPath}`);
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type' : mime,
      // 개발 편의상 캐시 비활성화
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log('');
  console.log('  ☕  저커버그 로컬 서버 시작!');
  console.log(`  🌐  브라우저 주소: ${url}`);
  console.log('  ⏹   종료: Ctrl + C');
  console.log('');

  // Windows: start, macOS: open, Linux: xdg-open
  const { exec } = require('child_process');
  const cmd =
    process.platform === 'win32'  ? `start ${url}` :
    process.platform === 'darwin' ? `open ${url}`  :
    `xdg-open ${url}`;
  exec(cmd, err => { if (err) console.log(`  ℹ️   브라우저를 직접 열어주세요: ${url}`); });
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ❌  포트 ${PORT} 가 이미 사용 중입니다.`);
    console.error(`      다른 포트로 실행: node serve.js 3001\n`);
  } else {
    console.error('\n  ❌  서버 오류:', err.message, '\n');
  }
  process.exit(1);
});
