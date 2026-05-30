/**
 * menu-data.js — 브랜드별 메뉴·가격 데이터
 *
 * ⚠️ 관리 안내:
 *   - 가격은 각 브랜드 공식 앱/사이트에서 직접 확인 후 수동 업데이트
 *   - updatedAt 날짜를 반드시 함께 갱신할 것
 *   - 시즌메뉴는 변동이 잦아 공식 앱 링크로 안내 (별도 관리 안 함)
 *   - 가격은 표준 매장 기준이며 지역·매장에 따라 다를 수 있음
 */
const MENU_DATA = {

  '메가MGC커피': {
    appUrl: 'https://www.mega-mgccoffee.com/menu/',
    updatedAt: '2026.05',
    hours: { open: 7, close: 22 },
    categories: [
      {
        name: '☕ 에스프레소',
        items: [
          { name: '아메리카노 (ICE)', price: 1500, tag: '인기' },
          { name: '아메리카노 (HOT)', price: 1700 },
          { name: '카페라떼',        price: 2000 },
          { name: '바닐라라떼',      price: 2500 },
          { name: '카라멜라떼',      price: 2500 },
          { name: '헤이즐넛라떼',    price: 2500 },
        ],
      },
      {
        name: '🧊 콜드브루',
        items: [
          { name: '콜드브루',           price: 2000 },
          { name: '콜드브루라떼',       price: 2500 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼',   price: 2000 },
          { name: '말차라떼',   price: 2500 },
          { name: '레몬에이드', price: 2000 },
        ],
      },
    ],
  },

  '컴포즈커피': {
    appUrl: 'https://composecoffee.com/menu',
    updatedAt: '2026.05',
    hours: { open: 7, close: 22 },
    categories: [
      {
        name: '☕ 에스프레소',
        items: [
          { name: '아메리카노',     price: 1500, tag: '인기' },
          { name: '카페라떼',       price: 2000 },
          { name: '바닐라라떼',     price: 2500 },
          { name: '헤이즐넛라떼',   price: 2500 },
          { name: '카라멜마끼아또', price: 2500 },
        ],
      },
      {
        name: '🧊 콜드브루',
        items: [
          { name: '콜드브루',     price: 2000 },
          { name: '콜드브루라떼', price: 2500 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼',   price: 2000 },
          { name: '말차라떼',   price: 2500 },
          { name: '레몬에이드', price: 2000 },
        ],
      },
    ],
  },

  '빽다방': {
    appUrl: 'https://paikdabang.com/menu/menu_drink/',
    updatedAt: '2026.05',
    hours: { open: 7, close: 22 },
    categories: [
      {
        name: '☕ 커피',
        items: [
          { name: "빽's아메리카노 (ICE)", price: 1500, tag: '인기' },
          { name: "빽's아메리카노 (HOT)", price: 1500 },
          { name: '카페라떼',             price: 2500 },
        ],
      },
      {
        name: '🥤 음료',
        items: [
          { name: '레몬에이드', price: 2000 },
          { name: '자몽에이드', price: 2500 },
          { name: '딸기라떼',   price: 3500 },
          { name: '초코라떼',   price: 3000 },
          { name: '말차라떼',   price: 3000 },
        ],
      },
    ],
  },

  '매머드커피': {
    appUrl: 'https://www.mmthcoffee.com/sub/menu/list_coffee_sub.php?menuType=C',
    updatedAt: '2026.05',
    hours: { open: 8, close: 22 },
    categories: [
      {
        name: '☕ 에스프레소',
        items: [
          { name: '아메리카노',   price: 2100, tag: '인기' },
          { name: '카페라떼',     price: 2600 },
          { name: '바닐라라떼',   price: 3100 },
          { name: '카라멜라떼',   price: 3100 },
          { name: '헤이즐넛라떼', price: 3100 },
        ],
      },
      {
        name: '🧊 콜드브루',
        items: [
          { name: '콜드브루',     price: 2600 },
          { name: '콜드브루라떼', price: 3100 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼',   price: 2600 },
          { name: '말차라떼',   price: 3100 },
        ],
      },
    ],
  },

  '더벤티': {
    appUrl: 'https://www.theventi.co.kr/new2022/menu/new.html',
    updatedAt: '2026.05',
    hours: { open: 8, close: 22 },
    categories: [
      {
        name: '☕ 커피',
        items: [
          { name: '아메리카노 R', price: 1500, tag: '인기' },
          { name: '아메리카노 L', price: 2000 },
          { name: '카페라떼 R',   price: 2000 },
          { name: '카페라떼 L',   price: 2500 },
          { name: '바닐라라떼 R', price: 2500 },
          { name: '카라멜라떼 R', price: 2500 },
        ],
      },
      {
        name: '🧊 더치커피',
        items: [
          { name: '더치커피 R',     price: 2000 },
          { name: '더치커피라떼 R', price: 2500 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼 R', price: 2000 },
          { name: '말차라떼 R', price: 2500 },
          { name: '레몬에이드',  price: 2000 },
        ],
      },
    ],
  },

  '하삼동커피': {
    appUrl: 'https://www.hasamdong.com/',
    updatedAt: '2026.05',
    hours: { open: 8, close: 21 },
    categories: [
      {
        name: '☕ 커피',
        items: [
          { name: '아메리카노',   price: 1500, tag: '인기' },
          { name: '카페라떼',     price: 2000 },
          { name: '바닐라라떼',   price: 2500 },
          { name: '헤이즐넛라떼', price: 2500 },
        ],
      },
      {
        name: '🧊 콜드브루',
        items: [
          { name: '콜드브루',     price: 2000 },
          { name: '콜드브루라떼', price: 2500 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼',   price: 2000 },
          { name: '레몬에이드', price: 2000 },
        ],
      },
    ],
  },

  '우지커피': {
    appUrl: 'https://wooji.co.kr/',
    updatedAt: '2026.05',
    hours: { open: 8, close: 21 },
    categories: [
      {
        name: '☕ 커피',
        items: [
          { name: '아메리카노', price: 1500, tag: '인기' },
          { name: '카페라떼',   price: 2000 },
          { name: '바닐라라떼', price: 2500 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼',   price: 2000 },
          { name: '레몬에이드', price: 2000 },
        ],
      },
    ],
  },

};
