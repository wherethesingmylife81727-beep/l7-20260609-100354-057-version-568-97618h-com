(function () {
    window.initializeMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var button = document.getElementById("playButton");
        var hls = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        function attachSource() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", streamUrl);
                }
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls();
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                }
                return;
            }

            if (!video.getAttribute("src")) {
                video.setAttribute("src", streamUrl);
            }
        }

        function play() {
            attachSource();
            button.classList.add("is-hidden");
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
    };
})();
