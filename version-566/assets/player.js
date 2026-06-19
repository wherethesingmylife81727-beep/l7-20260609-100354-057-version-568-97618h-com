(function() {
    function setupMoviePlayer(config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var loaded = false;
        var hls = null;

        if (!video || !button || !config.source) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = config.source;
            } else {
                video.src = config.source;
            }
        }

        function play() {
            attach();
            button.classList.add('is-hidden');
            video.controls = true;

            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function() {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function() {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function() {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function() {
            if (video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function() {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
