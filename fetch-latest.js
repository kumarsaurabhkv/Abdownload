// fetch-latest.js - Updated to use your Cloudflare Worker proxy

(async function() {
    try {
        // Use your own proxy URL here
        const proxyUrl = 'https://abproxy.cmpxor.workers.dev/proxy';  // <-- CHANGE THIS TO YOUR ACTUAL DOMAIN
        const targetUrl = 'https://www.ableton.com/en/release-notes/live-12/';
        const fetchUrl = `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Proxy fetch failed');

        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const headings = doc.querySelectorAll('h2, h3');
        let latestVersion = null;

        for (let heading of headings) {
            const match = heading.textContent.trim().match(/(\d+\.\d+(\.\d+)?)/);
            if (match) {
                latestVersion = match[1];
                break; // First match is the latest
            }
        }

        if (latestVersion) {
            console.log('Latest Ableton Live version detected:', latestVersion);

            let found = false;
            document.querySelectorAll('.version-item').forEach(item => {
                if (item.dataset.version === latestVersion) {
                    item.classList.add('selected');
                    found = true;
                } else {
                    item.classList.remove('selected');
                }
            });

            if (!found) {
                document.getElementById('custom-version-input').value = latestVersion;
                document.getElementById('custom-version-input').style.borderColor = '#6bb1ff';
                document.getElementById('custom-version-input').style.boxShadow = '0 0 0 3px rgba(107, 177, 255, 0.3)';
            }

            const notice = document.createElement('div');
            notice.className = 'info-text';
            notice.innerHTML = `<strong>Latest version auto-selected:</strong> ${latestVersion} (fetched live)`;
            document.querySelector('.content-area').insertBefore(notice, document.getElementById('version-sections'));
        }
    } catch (err) {
        console.warn('Failed to fetch latest version via proxy:', err);
        // Fallback: keep the default selection
    }
})();
