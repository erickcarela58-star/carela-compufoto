(function () {
  'use strict';

  const BUILD = '2026-08-24-catalog-v33';
  const categories = [
    ['all', 'Todos'],
    ['xv', 'XV'],
    ['infantil', 'Infantil'],
    ['graduacion', 'Graduación'],
    ['cumpleanos', 'Cumpleaños'],
    ['embarazadas', 'Embarazadas']
  ];
  const categoryIds = categories.slice(1).map(([id]) => id);

  function clean(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function currentCategory() {
    const fromQuery = clean(new URLSearchParams(location.search).get('cat')).replace(/\s/g, '');
    if (categoryIds.includes(fromQuery)) return fromQuery;
    const visible = categoryIds.filter(id => {
      const section = document.getElementById(id);
      return section && !section.hidden;
    });
    return visible.length === 1 ? visible[0] : 'all';
  }

  function setupCards() {
    document.querySelectorAll('section.sec[id] article.combo').forEach(card => {
      const section = card.closest('section.sec[id]');
      const category = section && categoryIds.includes(section.id) ? section.id : '';
      const name = card.querySelector('.cname')?.textContent?.trim() || 'Combo fotográfico';
      card.dataset.catalogCategory = category;
      card.dataset.catalogSearch = clean(card.textContent);
      card.setAttribute('aria-label', `${name}, ${categories.find(([id]) => id === category)?.[1] || ''}`);

      const photo = card.querySelector('.ph');
      if (photo) {
        const inline = String(photo.style.backgroundImage || '').match(/url\(["']?([^"')]+)["']?\)/)?.[1];
        const original = photo.dataset.bg || inline || '';
        const match = original.match(/^img\/([^/]+)\.webp$/i);
        if (match) {
          const reduced = matchMedia('(max-width: 520px)').matches || navigator.connection?.saveData;
          const responsive = `img/optimized-v33/${match[1]}-${reduced ? 480 : 960}.webp`;
          if (photo.dataset.bg) photo.dataset.bg = responsive;
          else {
            const preload = new Image();
            preload.onload = () => { photo.style.backgroundImage = `url('${responsive}')`; };
            preload.src = responsive;
          }
        }
      }
      if (photo && !photo.querySelector('.combo-category-chip')) {
        const chip = document.createElement('span');
        chip.className = 'combo-category-chip';
        chip.textContent = categories.find(([id]) => id === category)?.[1] || 'Combo';
        photo.appendChild(chip);
      }
    });
  }

  function createToolbar() {
    const toolbar = document.createElement('section');
    toolbar.className = 'catalog-toolbar';
    toolbar.setAttribute('aria-label', 'Buscar y filtrar combos');
    toolbar.innerHTML = `
      <div class="catalog-toolbar-top">
        <label class="catalog-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"/></svg>
          <input id="catalogSearch" type="search" autocomplete="off" placeholder="Busca por nombre, precio o lo que incluye" aria-label="Buscar combos">
          <button class="catalog-search-clear" type="button" aria-label="Limpiar búsqueda" hidden>×</button>
        </label>
        <div class="catalog-summary" aria-live="polite"><b id="catalogResultCount">39</b> combos disponibles</div>
      </div>
      <div class="catalog-filters" role="group" aria-label="Categorías">
        ${categories.map(([id, label]) => `<button class="catalog-filter" type="button" data-category="${id}">${label}</button>`).join('')}
      </div>`;
    document.querySelector('.hero')?.insertAdjacentElement('afterend', toolbar);
    return toolbar;
  }

  function setupCatalog() {
    document.documentElement.dataset.catalogBuild = BUILD;
    document.body.dataset.catalogBuild = BUILD;
    const portfolioNav = document.querySelector('.nav a[href="#portafolio"]');
    if (portfolioNav) portfolioNav.textContent = 'Galería real';

    setupCards();
    const toolbar = createToolbar();
    if (!toolbar) return;

    const input = toolbar.querySelector('#catalogSearch');
    const clearButton = toolbar.querySelector('.catalog-search-clear');
    const resultCount = toolbar.querySelector('#catalogResultCount');
    const filterButtons = Array.from(toolbar.querySelectorAll('.catalog-filter'));
    const cards = Array.from(document.querySelectorAll('section.sec[id] article.combo'));
    let selectedCategory = currentCategory();

    function setSections(category) {
      if (category === 'all') {
        categoryIds.forEach(id => {
          const section = document.getElementById(id);
          if (section) section.hidden = false;
        });
        document.querySelectorAll('.nav a').forEach(link => link.classList.remove('on'));
        try { history.replaceState({}, '', location.pathname + location.hash); } catch (_) {}
        return;
      }
      const matchingNav = document.querySelector(`.nav a[href="#${category}"]`);
      if (matchingNav) matchingNav.click();
      else categoryIds.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.hidden = id !== category;
      });
    }

    function applyFilters() {
      const query = clean(input.value);
      let count = 0;
      cards.forEach(card => {
        const categoryMatch = selectedCategory === 'all' || card.dataset.catalogCategory === selectedCategory;
        const textMatch = !query || card.dataset.catalogSearch.includes(query);
        card.hidden = !(categoryMatch && textMatch);
        if (!card.hidden) count += 1;
      });

      document.querySelectorAll('.sldr-wrap').forEach(wrapper => {
        const groupCards = Array.from(wrapper.querySelectorAll('article.combo'));
        wrapper.hidden = groupCards.length > 0 && groupCards.every(card => card.hidden);
        const heading = wrapper.previousElementSibling;
        if (heading?.classList.contains('grp-h')) heading.hidden = wrapper.hidden;
      });

      resultCount.textContent = String(count);
      clearButton.hidden = !query;
      filterButtons.forEach(button => {
        const active = button.dataset.category === selectedCategory;
        button.classList.toggle('on', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      toolbar.querySelector('.catalog-empty')?.remove();
      if (!count) {
        const empty = document.createElement('div');
        empty.className = 'catalog-empty';
        empty.textContent = 'No encontramos un combo con esa búsqueda. Prueba con “digital”, “enmarcada” o una categoría.';
        toolbar.insertAdjacentElement('afterend', empty);
      }
    }

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectedCategory = button.dataset.category;
        setSections(selectedCategory);
        applyFilters();
        document.querySelector(`section.sec#${selectedCategory}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.querySelectorAll('.nav a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const id = link.getAttribute('href').slice(1);
        selectedCategory = categoryIds.includes(id) ? id : 'all';
        setTimeout(applyFilters, 0);
      });
    });
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        selectedCategory = currentCategory();
        applyFilters();
      }, 0);
    });
    input.addEventListener('input', applyFilters);
    clearButton.addEventListener('click', () => {
      input.value = '';
      input.focus();
      applyFilters();
    });

    applyFilters();
    window.__DCARELA_CATALOG_V33__ = Object.freeze({ build: BUILD, comboCount: cards.length });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupCatalog, { once: true });
  else setupCatalog();
})();
