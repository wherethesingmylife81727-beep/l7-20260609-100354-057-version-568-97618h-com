(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var filterPanels = document.querySelectorAll('[data-filter-panel]');

  filterPanels.forEach(function (panelNode) {
    var list = document.querySelector('[data-filter-list]');
    var keyword = panelNode.querySelector('[data-filter-input]');
    var year = panelNode.querySelector('[data-filter-year]');
    var sort = panelNode.querySelector('[data-sort-select]');

    if (!list || !keyword || !year || !sort) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function apply() {
      var q = keyword.value.trim().toLowerCase();
      var y = year.value;

      cards.forEach(function (card) {
        var matchedKeyword = !q || cardText(card).indexOf(q) !== -1;
        var matchedYear = !y || card.getAttribute('data-year') === y;
        card.classList.toggle('hidden-by-filter', !(matchedKeyword && matchedYear));
      });
    }

    function sortCards() {
      var value = sort.value;
      var sorted = cards.slice();

      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      } else if (value === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      } else if (value === 'title-asc') {
        sorted.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      } else {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    keyword.addEventListener('input', apply);
    year.addEventListener('change', apply);
    sort.addEventListener('change', function () {
      sortCards();
      apply();
    });
  });
})();
