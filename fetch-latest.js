// fetch-latest.js - Updated and fixed version (robust DOM insertion + better parsing)

(async function() {
    try {
        const proxyUrl = 'https://abproxy.cmpxor.workers.dev';
        const targetUrl = 'https://www.ableton.com/en/release-notes/live-12/';
        const fetchUrl = `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Proxy fetch failed');

        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Improved parsing: look for headings that start with a version number
        const headings = doc.querySelectorAll('h2, h3');
        let latestVersion = null;

        for (let heading of headings) {
            const headingText = heading.textContent.trim();
            // Match patterns like "12.3.1 Release Notes" or just "12.3.1"
            const match = headingText.match(/^(\d+\.\d+(\.\d+)?)/);
            if (match) {
                latestVersion = match[1];
                break; // First matching heading = latest version
            }
        }

        if (latestVersion) {
            console.log('Latest Ableton Live version detected:', latestVersion);

            // Auto-select in grid
            let found = false;
            document.querySelectorAll('.version-item').forEach(item => {
                if (item.dataset.version === latestVersion) {
                    item.classList.add('selected');
                    found = true;
                } else {
                    item.classList.remove('selected');
                }
            });

            // Fallback to custom input if not in list
            if (!found) {
                const customInput = document.getElementById('custom-version-input');
                if (customInput) {
                    customInput.value = latestVersion;
                    customInput.style.borderColor = '#6bb1ff';
                    customInput.style.boxShadow = '0 0 0 3px rgba(107, 177, 255, 0.3)';
                }
            }

            // Safe notice insertion (waits for elements to exist)
            const notice = document.createElement('div');
            notice.className = 'info-text';
            notice.innerHTML = `<strong>Latest version auto-selected:</strong> ${latestVersion} (fetched live)`;

            const insertNotice = () => {
                const contentArea = document.querySelector('.content-area');
                const versionSections = document.getElementById('version-sections');
                if (contentArea && versionSections && versionSections.parentNode === contentArea) {
                    contentArea.insertBefore(notice, versionSections);
                } else {
                    // Retry after a short delay if DOM not ready yet
                    setTimeout(insertNotice, 100);
                }
            };

            insertNotice();
        } else {
            console.warn('No version found in release notes');
        }
    } catch (err) {
        console.warn('Failed to fetch latest version via proxy:', err);
        // Fallback: keep default selection from app.js
    }
})();
