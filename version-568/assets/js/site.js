(function () {
    function initMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-thumb" href="' + item.detail_url + '">',
            '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '        <span class="duration-badge">' + escapeHtml(item.duration) + '</span>',
            '        <span class="play-mask"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <a class="movie-title" href="' + item.detail_url + '">' + escapeHtml(item.title) + '</a>',
            '        <p class="movie-desc">' + escapeHtml(item.one_line) + '</p>',
            '        <div class="movie-info-line">',
            '            <span>' + escapeHtml(item.region) + '</span>',
            '            <span>' + escapeHtml(item.year) + '</span>',
            '            <span>' + escapeHtml(item.category_name) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var output = document.querySelector('[data-search-output]');
        var title = document.querySelector('[data-search-title]');
        var kicker = document.querySelector('[data-search-kicker]');

        if (!form || !input || !output || !window.SITE_SEARCH_DATA) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function search(query) {
            var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

            if (words.length === 0) {
                return [];
            }

            return window.SITE_SEARCH_DATA.filter(function (item) {
                var haystack = [
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.one_line,
                    item.summary,
                    item.review,
                    item.category_name,
                    (item.tags || []).join(' ')
                ].join(' ').toLowerCase();

                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 120);
        }

        function render(query) {
            var results = search(query);

            if (!query.trim()) {
                return;
            }

            title.textContent = '搜索结果';
            kicker.textContent = 'Results';

            if (results.length === 0) {
                output.innerHTML = '<div class="prose-panel"><h2>未找到相关视频</h2><p>可以尝试更短的关键词，或返回分类页继续浏览。</p></div>';
                return;
            }

            output.innerHTML = results.map(cardTemplate).join('\n');
            var count = document.createElement('p');
            count.className = 'movie-desc';
            count.textContent = '关键词“' + query + '”找到 ' + results.length + ' 个结果';
            output.parentNode.insertBefore(count, output);
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            if (query) {
                var url = new URL(window.location.href);
                url.searchParams.set('q', query);
                window.history.replaceState({}, '', url.toString());
                render(query);
            }
        });

        if (initialQuery) {
            input.value = initialQuery;
            render(initialQuery);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroSlider();
        initSearchPage();
    });
}());
