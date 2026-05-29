# 저가커피 매장탐색 서비스

## 프로젝트 개요

사용자의 현재 GPS 위치를 기반으로 반경 내 저가 커피 브랜드 매장을 실시간으로 탐색하는 웹/모바일 서비스.

- **지도 API**: 카카오맵 (1순위) / 네이버 지도 (대안)
- **주요 타겟**: 아메리카노 3,000원 이하 브랜드
- **스택**: React + TypeScript + Vite + Kakao Maps SDK + Tailwind CSS

## 대상 브랜드

```
메가커피 | 컴포즈커피 | 빽다방 | 더벤티 | 매머드커피 | 하삼동커피
```

## 환경 변수

```
VITE_KAKAO_MAP_API_KEY   — 지도 렌더링용 (JavaScript 키)
VITE_KAKAO_REST_API_KEY  — 장소 검색용 (REST API 키)
VITE_DEFAULT_RADIUS      — 기본 탐색 반경(m), 기본값 1000
```

절대 코드에 하드코딩 금지. 항상 import.meta.env.VITE_* 사용.

## 코드 규칙

- 컴포넌트: 함수형 + React Hooks만 사용 (클래스 컴포넌트 금지)
- API 호출: Promise.allSettled()로 병렬 처리, 5분 캐싱 적용
- 에러 처리: 모든 API 호출에 try-catch 필수, 사용자에게 안내 메시지 표시
- 타입: any 사용 금지, 모든 API 응답에 타입 정의 필수

## 검증 규칙 참조

서비스 오류 검증이 필요한 경우 자동으로 아래 규칙 파일을 로드:
@.claude/rules/service-validation.md

코드 수정 또는 기능 구현 후에는 반드시 해당 규칙에 따라 자가 검증을 실행하고
PASS / FAIL / WARNING 판정 결과를 응답에 포함할 것.
