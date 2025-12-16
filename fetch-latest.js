// fetch-latest.js - Fetches latest version and auto-selects it

(async function() {
    try {
        const response = await fetch('https://www.ableton.com/en/release-notes/live-12/');
        if (!response.ok) throw new Error('Failed to fetch');

        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const headings = doc.querySelectorAll('h2, h3');
        let latestVersion = null;

        for (let heading of headings) {
            const match = heading.textContent.trim().match(/(\d+\.\d+(\.\d+)?)/);
            if (match) {
                latestVersion = match[1];
                break; // First match = latest stable
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

            // Optional notification
            const notice = document.createElement('div');
            notice.className = 'info-text';
            notice.innerHTML = `<strong>Latest version auto-selected:</strong> ${latestVersion}`;
            document.querySelector('.content-area').insertBefore(notice, document.getElementById('version-sections'));
        }
    } catch (err) {
        console.warn('Could not fetch latest version (CORS or network issue). Using default selection.', err);
    }
})();
