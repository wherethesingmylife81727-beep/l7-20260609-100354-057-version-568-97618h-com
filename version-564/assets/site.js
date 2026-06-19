(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function initSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = './search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dots button'));
        var prev = root.querySelector('.hero-prev');
        var next = root.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
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
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function initFilters() {
        var page = document.querySelector('[data-filter-page]');
        if (!page) {
            return;
        }
        var keyword = page.querySelector('[data-local-search]');
        var year = page.querySelector('[data-year-filter]');
        var region = page.querySelector('[data-region-filter]');
        var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');

        if (initial && keyword) {
            keyword.value = initial;
        }

        function apply() {
            var q = normalize(keyword ? keyword.value : '');
            var y = year ? year.value : '';
            var r = region ? region.value : '';
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category
                ].join(' '));
                var matchKeyword = !q || haystack.indexOf(q) !== -1;
                var matchYear = !y || card.dataset.year === y;
                var matchRegion = !r || card.dataset.region === r;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchRegion));
            });
        }

        ['input', 'change'].forEach(function (eventName) {
            if (keyword) {
                keyword.addEventListener(eventName, apply);
            }
            if (year) {
                year.addEventListener(eventName, apply);
            }
            if (region) {
                region.addEventListener(eventName, apply);
            }
        });
        apply();
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-lib]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.setAttribute('data-hls-lib', '1');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (root) {
            var video = root.querySelector('video');
            var overlay = root.querySelector('.player-overlay');
            if (!video || !overlay) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var started = false;

            function playVideo() {
                if (!stream) {
                    return;
                }
                overlay.classList.add('is-hidden');
                video.controls = true;
                if (started) {
                    video.play().catch(function () {});
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.play().catch(function () {});
                    return;
                }
                loadHls(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.src = stream;
                        video.play().catch(function () {});
                    }
                });
            }

            overlay.addEventListener('click', playVideo);
            video.addEventListener('click', function () {
                if (!started) {
                    playVideo();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initPlayers();
    });
})();
