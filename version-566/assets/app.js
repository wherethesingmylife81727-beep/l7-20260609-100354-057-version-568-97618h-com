(function() {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function() {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');

        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function() {
                mobilePanel.classList.toggle('open');
            });
        }

        document.querySelectorAll('.js-search-form').forEach(function(form) {
            form.addEventListener('submit', function(event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });

        var carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
            var previous = carousel.querySelector('[data-hero-prev]');
            var next = carousel.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });

                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function() {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function(dot) {
                dot.addEventListener('click', function() {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

            if (previous) {
                previous.addEventListener('click', function() {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function() {
                    show(current + 1);
                    start();
                });
            }

            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        document.querySelectorAll('[data-filter-form]').forEach(function(form) {
            var input = form.querySelector('[data-filter-input]');
            var list = document.querySelector('[data-filter-list]');

            if (!input || !list) {
                return;
            }

            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            if (query) {
                input.value = query;
            }

            function applyFilter() {
                var value = input.value.trim().toLowerCase();
                var cards = list.querySelectorAll('.movie-card');

                cards.forEach(function(card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();

                    card.classList.toggle('is-filtered-out', value && haystack.indexOf(value) === -1);
                });
            }

            form.addEventListener('submit', function(event) {
                event.preventDefault();
                applyFilter();
            });

            input.addEventListener('input', applyFilter);
            applyFilter();
        });
    });
})();
