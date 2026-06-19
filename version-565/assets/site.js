(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                setSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var cardList = document.querySelector('[data-card-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterPanel && cardList) {
        var textInput = filterPanel.querySelector('[data-local-search]');
        var yearSelect = filterPanel.querySelector('[data-year-filter]');
        var regionInput = filterPanel.querySelector('[data-region-filter]');
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-search]'));
        var queryParams = new URLSearchParams(window.location.search);
        var pageQuery = queryParams.get('q') || '';

        if (textInput && pageQuery) {
            textInput.value = pageQuery;
        }

        function matchYear(card, selected) {
            if (!selected) {
                return true;
            }

            var year = card.getAttribute('data-year') || '';

            if (selected === 'classic') {
                var value = parseInt(year, 10);
                return value && value < 2020;
            }

            return year.indexOf(selected) !== -1;
        }

        function updateCards() {
            var query = textInput ? textInput.value.trim().toLowerCase() : '';
            var selectedYear = yearSelect ? yearSelect.value : '';
            var region = regionInput ? regionInput.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }

                if (!matchYear(card, selectedYear)) {
                    matched = false;
                }

                if (region && cardRegion.indexOf(region) === -1) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [textInput, yearSelect, regionInput].forEach(function (control) {
            if (control) {
                control.addEventListener('input', updateCards);
                control.addEventListener('change', updateCards);
            }
        });

        updateCards();
    }
})();
