(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
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

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var scopeSelector = form.getAttribute('data-filter-scope');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-title]')) : [];
    var keyword = form.querySelector('[data-filter-keyword]');
    var year = form.querySelector('[data-filter-year]');
    var type = form.querySelector('[data-filter-type]');
    var reset = form.querySelector('[data-filter-reset]');
    var empty = document.querySelector(form.getAttribute('data-filter-empty') || '');

    function applyFilter() {
      var query = keyword ? keyword.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
        var shouldShow = matchQuery && matchYear && matchType;
        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (keyword) {
        keyword.addEventListener(eventName, applyFilter);
      }
      if (year) {
        year.addEventListener(eventName, applyFilter);
      }
      if (type) {
        type.addEventListener(eventName, applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilter();
      });
    }

    applyFilter();
  });

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var button = player.querySelector('[data-player-button]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (!video || !source || initialized) {
        return;
      }

      initialized = true;
      setStatus('正在加载');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('可以播放');
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放加载失败');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('可以播放');
          playVideo();
        }, { once: true });
      } else {
        initialized = false;
        loadHlsLibrary(function () {
          attachSource();
        });
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }

      var result = video.play();

      if (result && typeof result.then === 'function') {
        result.then(function () {
          if (overlay) {
            overlay.classList.add('hidden');
          }
          setStatus('播放中');
        }).catch(function () {
          setStatus('点击播放');
        });
      } else {
        if (overlay) {
          overlay.classList.add('hidden');
        }
        setStatus('播放中');
      }
    }

    function togglePlay() {
      attachSource();

      if (!video) {
        return;
      }

      if (!video.paused) {
        video.pause();
        if (overlay) {
          overlay.classList.remove('hidden');
        }
        setStatus('已暂停');
      } else if (initialized) {
        playVideo();
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        togglePlay();
      });
    }

    if (video) {
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
        setStatus('播放中');
      });
      video.addEventListener('pause', function () {
        if (!video.ended && overlay) {
          overlay.classList.remove('hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
        setStatus('播放结束');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
