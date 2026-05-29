/**
 * config.js — 저커버그 설정
 * API 키는 js/keys.js (KAKAO_KEYS 객체)에서 관리합니다.
 */
const CONFIG = {

  get KAKAO_REST_API_KEY() {
    if (typeof KAKAO_KEYS === 'undefined' || !KAKAO_KEYS.REST_KEY) {
      console.error('[저커버그] js/keys.js가 없거나 REST_KEY가 비어 있습니다. js/keys.example.js를 참고해 설정하세요.');
      return '';
    }
    return KAKAO_KEYS.REST_KEY;
  },

  get KAKAO_JS_KEY() {
    return (typeof KAKAO_KEYS !== 'undefined') ? KAKAO_KEYS.JS_KEY : '';
  },

  BRANDS: [
    { key: '메가MGC커피',  label: '메가커피', query: '메가MGC커피',  short: '메가',   color: '#bf360c', bg: '#fff3e0', pin: 'M' },
    { key: '컴포즈커피',   label: '컴포즈',   query: '컴포즈커피',   short: '컴포즈', color: '#1b5e20', bg: '#e8f5e9', pin: 'C' },
    { key: '빽다방',       label: '빽다방',   query: '빽다방',       short: '빽',     color: '#e65100', bg: '#fffde7', pin: 'P' },
    { key: '매머드커피',   label: '매머드',   query: '매머드커피',   short: '매머드', color: '#880e4f', bg: '#fce4ec', pin: 'E' },
    { key: '더벤티',       label: '더벤티',   query: '더벤티',       short: '벤티',   color: '#0d47a1', bg: '#e3f2fd', pin: 'V' },
    { key: '하삼동커피',   label: '하삼동',   query: '하삼동커피',   short: '하삼동', color: '#4e342e', bg: '#efebe9', pin: 'H' },
    { key: '우지커피',     label: '우지커피', query: '우지커피',     short: '우지',   color: '#00695c', bg: '#e0f2f1', pin: 'W' },
  ],

  RADIUS_OPTIONS: [500, 1000, 2000, 3000],
  DEFAULT_RADIUS: 1000,

  DEFAULT_CENTER: { lat: 37.5665, lng: 126.9780 }, // 서울 시청 (위치 권한 거부 시 폴백)
  DEFAULT_ZOOM: 5,
};
