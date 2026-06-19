import { H as Hls } from '../vendor/video-player-dru42stk.js';

function setStatus(element, message) {
    if (element) {
        element.textContent = message;
    }
}

function hideStartButton(button) {
    if (button) {
        button.classList.add('is-hidden');
    }
}

function initPlayer() {
    const video = document.querySelector('[data-hls-src]');
    const startButton = document.querySelector('[data-video-start]');
    const status = document.querySelector('[data-video-status]');

    if (!video) {
        return;
    }

    const source = video.getAttribute('data-hls-src');

    if (!source) {
        setStatus(status, '当前页面没有可用播放源');
        return;
    }

    video.src = source;

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus(status, '播放源已就绪');
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setStatus(status, '网络波动，正在重新加载播放源');
                hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                setStatus(status, '媒体解码恢复中');
                hls.recoverMediaError();
            } else {
                setStatus(status, '播放源暂时无法加载');
                hls.destroy();
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
            setStatus(status, '播放源已就绪');
        });
    } else {
        setStatus(status, '当前浏览器需要 HLS 支持才能播放');
    }

    if (startButton) {
        startButton.addEventListener('click', function () {
            video.play().then(function () {
                hideStartButton(startButton);
                setStatus(status, '正在播放');
            }).catch(function () {
                setStatus(status, '浏览器阻止自动播放，请使用播放器控制栏播放');
            });
        });
    }

    video.addEventListener('play', function () {
        hideStartButton(startButton);
        setStatus(status, '正在播放');
    });
}

document.addEventListener('DOMContentLoaded', initPlayer);
