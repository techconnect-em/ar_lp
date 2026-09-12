// Keep the poster local. YouTube is contacted only after the play button is used.
document.querySelectorAll('[data-stamp-video]').forEach((player) => {
    const videoId = player.dataset.youtubeId || '';
    const screen = player.querySelector('.stamp-video__screen');
    const playButton = player.querySelector('[data-stamp-play]');
    const fallback = player.querySelector('[data-stamp-fallback]');

    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId) || !screen || !playButton || !fallback) return;

    fallback.href = `https://www.youtube.com/watch?v=${videoId}`;
    fallback.textContent = 'YouTubeで見る';
    playButton.hidden = false;

    playButton.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&controls=1&rel=0`;
        iframe.title = 'デジタルスタンプカード制作の紹介動画（YouTube・53秒）';
        iframe.width = '960';
        iframe.height = '540';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        screen.replaceChildren(iframe);
        iframe.focus({ preventScroll: true });
    }, { once: true });
});
