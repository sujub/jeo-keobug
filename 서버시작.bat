@echo off
chcp 65001 > nul
title 저커버그 로컬 서버

echo.
echo  ☕  저커버그 로컬 서버를 시작합니다...
echo.

:: Node.js 설치 여부 확인
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo  ❌  Node.js 가 설치되어 있지 않습니다.
  echo      https://nodejs.org 에서 설치 후 다시 실행해 주세요.
  echo.
  pause
  exit /b 1
)

:: 이 배치 파일이 있는 폴더로 이동
cd /d "%~dp0"

:: 서버 실행
node serve.js

pause
