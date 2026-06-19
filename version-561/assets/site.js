(function () {
    var base = document.body.getAttribute("data-base") || "./";
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function prefixed(path) {
        if (!path || path.indexOf("http") === 0 || path.indexOf("/") === 0) {
            return path;
        }
        return base + path;
    }

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    function setupSearch(inputId, resultId) {
        var input = document.getElementById(inputId);
        var results = document.getElementById(resultId);
        var data = window.MOVIES_INDEX || [];
        if (!input || !results || !data.length) {
            return;
        }

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            if (!keyword) {
                results.classList.remove("open");
                results.innerHTML = "";
                return;
            }

            var matches = data.filter(function (item) {
                return item.searchText.indexOf(keyword) !== -1;
            }).slice(0, 12);

            if (!matches.length) {
                results.innerHTML = '<div class="search-empty">未找到相关影片</div>';
                results.classList.add("open");
                return;
            }

            results.innerHTML = matches.map(function (item) {
                return [
                    '<a class="search-result-item" href="' + prefixed(item.url) + '">',
                    '<img src="' + prefixed(item.cover) + '" alt="' + item.title + '">',
                    '<span><strong>' + item.title + '</strong><small>' + item.year + ' · ' + item.region + ' · ' + item.category + '</small></span>',
                    '</a>'
                ].join("");
            }).join("");
            results.classList.add("open");
        });

        document.addEventListener("click", function (event) {
            if (!results.contains(event.target) && event.target !== input) {
                results.classList.remove("open");
            }
        });
    }

    setupSearch("siteSearch", "searchResults");
    setupSearch("mobileSiteSearch", "mobileSearchResults");

    document.querySelectorAll("[data-hero-search]").forEach(function (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                var value = input.value.trim();
                if (value) {
                    window.location.href = prefixed("library.html") + "?q=" + encodeURIComponent(value) + "#all-movies";
                }
            }
        });
    });

    function setupLocalFilter(scope) {
        var input = scope.querySelector("[data-local-filter]");
        var list = scope.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }

        function apply(value) {
            var keyword = value.trim().toLowerCase();
            list.querySelectorAll(".movie-card, .library-item").forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();
                card.classList.toggle("hidden-by-filter", keyword && text.indexOf(keyword) === -1);
            });
        }

        input.addEventListener("input", function () {
            apply(input.value);
        });

        scope.querySelectorAll("[data-chip]").forEach(function (button) {
            button.addEventListener("click", function () {
                input.value = button.getAttribute("data-chip") || "";
                apply(input.value);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            input.value = query;
            apply(query);
        }
    }

    document.querySelectorAll(".page-section").forEach(setupLocalFilter);

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }
})();
