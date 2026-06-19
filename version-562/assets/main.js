(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length) {
      var current = 0;
      var show = function (index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
        });
      });
      window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5000);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(function (root) {
      var search = root.querySelector('[data-filter-search]');
      var type = root.querySelector('[data-filter-type]');
      var year = root.querySelector('[data-filter-year]');
      var toggleView = root.querySelector('[data-view-toggle]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
      var normalize = function (value) {
        return String(value || '').toLowerCase().trim();
      };
      var apply = function () {
        var q = normalize(search && search.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var typeValue = normalize(card.dataset.type);
          var yearValue = normalize(card.dataset.year);
          var matched = (!q || text.indexOf(q) !== -1) &&
            (!selectedType || typeValue.indexOf(selectedType) !== -1) &&
            (!selectedYear || yearValue === selectedYear);
          card.hidden = !matched;
        });
      };
      [search, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      if (toggleView) {
        toggleView.addEventListener('click', function () {
          root.classList.toggle('list-mode');
        });
      }
    });
  });
})();
