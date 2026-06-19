(function () {
    function setSource(video, source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video.hlsController) {
                video.hlsController.destroy();
            }

            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            video.hlsController = hls;
            hls.loadSource(source);
            hls.attachMedia(video);

            return new Promise(function (resolve) {
                var done = false;

                function finish() {
                    if (!done) {
                        done = true;
                        resolve();
                    }
                }

                hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
                setTimeout(finish, 1800);
            });
        }

        video.src = source;
        return Promise.resolve();
    }

    window.initStaticPlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        var prepared = false;

        if (!video || !overlay || !button || !options.source) {
            return;
        }

        function startPlayback() {
            overlay.classList.add('is-hidden');

            var ready = prepared ? Promise.resolve() : setSource(video, options.source);
            prepared = true;

            ready.then(function () {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            });
        }

        overlay.addEventListener('click', startPlayback);
        button.addEventListener('click', startPlayback);

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                overlay.classList.remove('is-hidden');
            }
        });
    };
})();
