/**
 * menu.js — 브랜드 메뉴판 모달 관리
 */
const MenuManager = (() => {
  let currentBrandKey = null;
  let currentTab = 'all';

  function fmt(price) {
    return price.toLocaleString('ko-KR') + '원~';
  }

  function renderAll(data) {
    const body = document.getElementById('menuModalBody');
    body.innerHTML = '';

    if (!data || !data.categories) {
      body.innerHTML = '<div style="padding:32px;text-align:center;color:#aaa;">메뉴 정보가 없습니다.</div>';
      return;
    }

    const frag = document.createDocumentFragment();
    data.categories.forEach(cat => {
      const sec = document.createElement('div');
      sec.className = 'menu-category';

      const title = document.createElement('div');
      title.className = 'menu-category-title';
      title.textContent = cat.name;
      sec.appendChild(title);

      cat.items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'menu-item';

        const left = document.createElement('div');
        left.className = 'menu-item-left';

        const name = document.createElement('span');
        name.className = 'menu-item-name';
        name.textContent = item.name;
        left.appendChild(name);

        if (item.tag) {
          const tag = document.createElement('span');
          tag.className = 'menu-tag';
          tag.textContent = item.tag;
          left.appendChild(tag);
        }

        const price = document.createElement('span');
        price.className = 'menu-item-price';
        price.textContent = fmt(item.price);

        row.appendChild(left);
        row.appendChild(price);
        sec.appendChild(row);
      });
      frag.appendChild(sec);
    });
    body.appendChild(frag);
  }

  function renderSeasonal(data) {
    const body = document.getElementById('menuModalBody');
    body.innerHTML = '';

    if (!data || !data.seasonal || data.seasonal.length === 0) {
      body.innerHTML = '<div class="seasonal-empty">🍃 현재 시즌 메뉴가 없습니다.</div>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'seasonal-list';

    data.seasonal.forEach(item => {
      const row = document.createElement('div');
      row.className = 'seasonal-item';

      const left = document.createElement('div');
      left.className = 'seasonal-left';

      const badge = document.createElement('span');
      badge.className = 'seasonal-badge';
      badge.textContent = item.badge || '시즌';

      const name = document.createElement('span');
      name.className = 'seasonal-name';
      name.textContent = item.name;

      left.appendChild(badge);
      left.appendChild(name);

      const price = document.createElement('span');
      price.className = 'seasonal-price';
      price.textContent = fmt(item.price);

      row.appendChild(left);
      row.appendChild(price);
      list.appendChild(row);
    });
    body.appendChild(list);
  }

  function open(brandKey, brandLabel, brandColor) {
    currentBrandKey = brandKey;
    currentTab = 'all';

    const data = MENU_DATA[brandKey];
    const modal = document.getElementById('menuModal');
    const brandEl = document.getElementById('menuModalBrand');
    const header = document.getElementById('menuModalHeader');
    const link = document.getElementById('menuOfficialLink');

    const updated = data?.updatedAt ? ` · ${data.updatedAt} 기준` : '';
    brandEl.innerHTML = `🍽️ ${brandLabel} 메뉴판<span style="font-size:10px;color:#aaa;font-weight:400;margin-left:6px;">${updated}</span>`;
    header.style.borderBottom = `2px solid ${brandColor}20`;
    link.href = data?.appUrl || '#';

    // 탭 초기화
    document.querySelectorAll('.menu-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === 'all')
    );
    renderAll(data);

    modal.classList.add('show');
  }

  function close() {
    document.getElementById('menuModal').classList.remove('show');
  }

  function bindEvents() {
    document.getElementById('menuModalClose').addEventListener('click', close);
    document.getElementById('menuModal').addEventListener('click', e => {
      if (e.target === document.getElementById('menuModal')) close();
    });

    document.querySelectorAll('.menu-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        const data = MENU_DATA[currentBrandKey];
        if (currentTab === 'all') renderAll(data);
        else renderSeasonal(data);
      });
    });
  }

  // DOM 준비되면 즉시 탭 이벤트 등록 (카카오맵 로드 대기 불필요)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }

  return { open, close, bindEvents };
})();
