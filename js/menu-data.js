/**
 * menu-data.js — 브랜드별 메뉴·가격 데이터
 *
 * ⚠️ 관리 안내:
 *   - 가격은 수동으로 분기마다 확인·업데이트 (각 브랜드 공식 앱 기준)
 *   - updatedAt 날짜를 반드시 함께 갱신할 것
 *   - seasonal 배열: 시즌 종료 후 제거, 신규 시즌 추가
 */
const MENU_DATA = {

  '메가MGC커피': {
    appUrl: 'https://www.mega-mgccoffee.com/',
    updatedAt: '2025.08',
    hours: { open: 7, close: 22 },
    categories: [
      {
        name: '☕ 에스프레소',
        items: [
          { name: '아메리카노', price: 1500, tag: '인기' },
          { name: '카페라떼',   price: 2000 },
          { name: '카푸치노',   price: 2000 },
          { name: '바닐라라떼', price: 2500 },
          { name: '헤이즐넛라떼', price: 2500 },
          { name: '카라멜라떼', price: 2500 },
        ],
      },
      {
        name: '🧊 콜드브루',
        items: [
          { name: '콜드브루',           price: 2000 },
          { name: '콜드브루라떼',       price: 2500 },
          { name: '바닐라콜드브루라떼', price: 3000 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼',   price: 2000 },
          { name: '딸기라떼',   price: 2500 },
          { name: '말차라떼',   price: 2500 },
          { name: '자몽에이드', price: 2000 },
          { name: '레몬에이드', price: 2000 },
        ],
      },
    ],
    seasonal: [
      { name: '복숭아아이스티',   price: 2000, badge: '여름' },
      { name: '청포도에이드',     price: 2500, badge: '여름' },
      { name: '수박라떼',         price: 2500, badge: '여름' },
    ],
  },

  '컴포즈커피': {
    appUrl: 'https://www.compose-coffee.com/',
    updatedAt: '2025.08',
    hours: { open: 7, close: 22 },
    categories: [
      {
        name: '☕ 에스프레소',
        items: [
          { name: '아메리카노',   price: 1500, tag: '인기' },
          { name: '카페라떼',     price: 2000 },
          { name: '바닐라라떼',   price: 2500 },
          { name: '카라멜마끼아또', price: 2500 },
          { name: '헤이즐넛라떼', price: 2500 },
        ],
      },
      {
        name: '🧊 콜드브루',
        items: [
          { name: '콜드브루',       price: 2000 },
          { name: '콜드브루라떼',   price: 2500 },
          { name: '질소콜드브루',   price: 2500 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼',   price: 2000 },
          { name: '말차라떼',   price: 2500 },
          { name: '딸기라떼',   price: 2500 },
          { name: '레몬에이드', price: 2000 },
        ],
      },
    ],
    seasonal: [
      { name: '망고라떼',     price: 2500, badge: '여름' },
      { name: '복숭아에이드', price: 2000, badge: '여름' },
      { name: '레드자몽에이드', price: 2500, badge: '여름' },
    ],
  },

  '빽다방': {
    appUrl: 'https://www.paik.co.kr/',
    updatedAt: '2025.08',
    hours: { open: 7, close: 22 },
    categories: [
      {
        name: '☕ 커피',
        items: [
          { name: "빽's아메리카노(아이스)", price: 1500, tag: '인기' },
          { name: "빽's아메리카노(핫)",     price: 1500 },
          { name: '카페라떼',               price: 2500 },
          { name: "빽's카페라떼(라지)",      price: 3000 },
          { name: '달달하고 진한 카페라떼', price: 3000 },
        ],
      },
      {
        name: '🧊 이색음료',
        items: [
          { name: '원조커피(라지)',     price: 2000 },
          { name: '바닐라라떼',         price: 3000 },
          { name: '초코라떼',           price: 3000 },
          { name: '딸기라떼',           price: 3500 },
        ],
      },
      {
        name: '🥤 에이드·차',
        items: [
          { name: '레몬에이드', price: 2000 },
          { name: '자몽에이드', price: 2500 },
          { name: '녹차라떼',   price: 2500 },
        ],
      },
    ],
    seasonal: [
      { name: '수박에이드',   price: 2500, badge: '여름' },
      { name: '복숭아아이스티', price: 2500, badge: '여름' },
    ],
  },

  '매머드커피': {
    appUrl: 'https://mammothcoffee.co.kr/',
    updatedAt: '2025.08',
    hours: { open: 8, close: 22 },
    categories: [
      {
        name: '☕ 에스프레소',
        items: [
          { name: '아메리카노',   price: 2000, tag: '인기' },
          { name: '카페라떼',     price: 2500 },
          { name: '바닐라라떼',   price: 3000 },
          { name: '카라멜라떼',   price: 3000 },
          { name: '헤이즐넛라떼', price: 3000 },
        ],
      },
      {
        name: '🧊 콜드브루',
        items: [
          { name: '콜드브루',     price: 2500 },
          { name: '콜드브루라떼', price: 3000 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼',   price: 2500 },
          { name: '말차라떼',   price: 3000 },
          { name: '자몽에이드', price: 2500 },
        ],
      },
    ],
    seasonal: [
      { name: '복숭아콜드브루', price: 3000, badge: '여름' },
      { name: '청포도에이드',   price: 3000, badge: '여름' },
    ],
  },

  '더벤티': {
    appUrl: 'https://theventi.co.kr/',
    updatedAt: '2025.08',
    hours: { open: 8, close: 22 },
    categories: [
      {
        name: '☕ 커피',
        items: [
          { name: '아메리카노(R)', price: 1500, tag: '인기' },
          { name: '아메리카노(L)', price: 2000 },
          { name: '카페라떼(R)',   price: 2000 },
          { name: '카페라떼(L)',   price: 2500 },
          { name: '바닐라라떼(R)', price: 2500 },
          { name: '카라멜라떼(R)', price: 2500 },
        ],
      },
      {
        name: '🧊 콜드브루',
        items: [
          { name: '더치커피(R)',     price: 2000 },
          { name: '더치커피라떼(R)', price: 2500 },
        ],
      },
      {
        name: '🥤 논커피',
        items: [
          { name: '초코라떼(R)', price: 2000 },
          { name: '말차라떼(R)', price: 2500 },
          { name: '딸기라떼(R)', price: 2500 },
          { name: '레몬에이드',  price: 2000 },
        ],
      },
    ],
    seasonal: [
      { name: '망고라떼',     price: 2500, badge: '여름' },
      { name: '수박에이드',   price: 2500, badge: '여름' },
    ],
  },

  '하삼동커피': {
    appUrl: 'https://www.hasamdong.com/',
    updatedAt: '2025.08',
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
          { name: '말차라떼',   price: 2500 },
          { name: '레몬에이드', price: 2000 },
        ],
      },
    ],
    seasonal: [
      { name: '딸기라떼',   price: 2500, badge: '시즌' },
      { name: '복숭아에이드', price: 2000, badge: '시즌' },
    ],
  },

  '우지커피': {
    appUrl: 'https://wooji.co.kr/',
    updatedAt: '2025.08',
    hours: { open: 8, close: 21 },
    categories: [
      {
        name: '☕ 커피',
        items: [
          { name: '아메리카노',   price: 1500, tag: '인기' },
          { name: '카페라떼',     price: 2000 },
          { name: '바닐라라떼',   price: 2500 },
          { name: '카라멜라떼',   price: 2500 },
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
    seasonal: [
      { name: '복숭아라떼', price: 2500, badge: '시즌' },
    ],
  },

};
