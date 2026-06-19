(function () {
  var form = document.querySelector('[data-search-form]');
  var resultBox = document.querySelector('[data-search-results]');
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';

  if (!form || !resultBox || !window.siteMovies) {
    return;
  }

  var input = form.querySelector('input[name="q"]');

  if (input) {
    input.value = q;
  }

  function match(movie, keyword) {
    if (!keyword) {
      return true;
    }

    var haystack = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();

    return haystack.indexOf(keyword.toLowerCase()) !== -1;
  }

  function card(movie) {
    var tags = [movie.region, movie.type].concat(movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeText(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeAttribute(movie.url) + '">' +
      '<img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-chip">立即观看</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta"><span>' + escapeText(movie.year) + '</span><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.type) + '</span></div>' +
      '<h2><a href="' + escapeAttribute(movie.url) + '">' + escapeText(movie.title) + '</a></h2>' +
      '<p>' + escapeText(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeText(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function escapeAttribute(value) {
    return escapeText(value).replace(/'/g, '&#39;');
  }

  function render(keyword) {
    var list = window.siteMovies.filter(function (movie) {
      return match(movie, keyword);
    }).slice(0, 120);

    if (!list.length) {
      resultBox.innerHTML = '<div class="movie-detail-card"><h2>未找到相关影片</h2><p>可以更换片名、地区、年份或标签继续搜索。</p></div>';
      return;
    }

    resultBox.innerHTML = list.map(card).join('');
  }

  render(q.trim());
})();
