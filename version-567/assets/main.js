(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate(current + 1);
      }, 6500);
    }
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const sortSelect = document.querySelector('[data-sort-select]');
  const cardList = document.querySelector('[data-card-list]');
  const emptyMessage = document.querySelector('[data-empty-message]');

  function allCards() {
    return cardList ? Array.from(cardList.querySelectorAll('[data-movie-card]')) : [];
  }

  function cardText(card) {
    return [
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.tags,
      card.dataset.category,
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilter() {
    const value = filterInput ? filterInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    allCards().forEach(function (card) {
      const matched = !value || cardText(card).includes(value);
      card.hidden = !matched;
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.classList.toggle('visible', visibleCount === 0);
    }
  }

  function applySort() {
    if (!cardList || !sortSelect) {
      return;
    }

    const cards = allCards();
    const mode = sortSelect.value;

    cards.sort(function (a, b) {
      if (mode === 'year-desc') {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      if (mode === 'year-asc') {
        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
      }
      if (mode === 'title-asc') {
        return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
      }
      return 0;
    });

    cards.forEach(function (card) {
      cardList.appendChild(card);
    });

    applyFilter();
  }

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q');
    if (initial) {
      filterInput.value = initial;
    }
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    const streamUrl = video.getAttribute('src');

    if (streamUrl && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (streamUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }

    function startPlayback() {
      button.classList.add('hidden');
      video.play().catch(function () {
        button.classList.remove('hidden');
      });
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      button.classList.remove('hidden');
    });
  });
})();
