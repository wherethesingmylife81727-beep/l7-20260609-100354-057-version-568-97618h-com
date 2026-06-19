(function () {
  function setupPlayer(videoId, playId, overlayId, url) {
    var video = document.getElementById(videoId);
    var playButton = document.getElementById(playId);
    var overlay = document.getElementById(overlayId);
    if (!video || !url) {
      return;
    }
    var initialized = false;
    var hlsInstance = null;

    function attach() {
      if (initialized) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
      initialized = true;
    }

    function play() {
      attach();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener('click', play);
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
