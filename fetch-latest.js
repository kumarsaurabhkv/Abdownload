// fetch-latest.js - Fixed with robust DOM waiting and safe insertion

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

        const headings = doc.querySelectorAll('h2, h3');
        let latestVersion = null;

        for (let heading of headings) {
            const headingText = heading.textContent.trim();
            const match = headingText.match(/^(\d+\.\d+(\.\d+)?)/);
            if (match) {
                latestVersion = match[1];
                break;
            }
        }

        if (!latestVersion) {
            console.warn('No version found in release notes');
            return;
        }

        console.log('Latest Ableton Live version detected:', latestVersion);

        // Load current versions from KV
        let currentVersions = [];
        try {
            const resp = await fetch('/api/get-versions');
            if (resp.ok) {
                currentVersions = await resp.json();
            }
        } catch (e) {
            console.warn('Could not fetch current versions for comparison:', e);
        }

        let isNew = !currentVersions.includes(latestVersion);

        // If new version detected, save it permanently
        if (isNew) {
            currentVersions.unshift(latestVersion);

            try {
                const updateResp = await fetch('/api/update-versions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentVersions)
                });

                if (updateResp.ok) {
                    console.log('New version successfully saved to KV:', latestVersion);
                }
            } catch (e) {
                console.warn('Error calling update API:', e);
            }
        }

        // Helper: Wait for version grid to be ready
        const waitForGrid = () => {
            return new Promise((resolve) => {
                const check = () => {
                    const versionSections = document.getElementById('version-sections');
                    const contentArea = document.querySelector('.content-area');
                    if (contentArea && versionSections && versionSections.children.length > 0) {
                        resolve({ contentArea, versionSections });
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        };

        const { contentArea, versionSections } = await waitForGrid();

        // Insert "new version saved" notice if applicable
        if (isNew) {
            const savedNotice = document.createElement('div');
            savedNotice.className = 'info-text';
            savedNotice.innerHTML = `<strong>New version auto-added & saved permanently:</strong> ${latestVersion}`;
            contentArea.insertBefore(savedNotice, versionSections);
        }

        // Auto-select the latest version
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
            const customInput = document.getElementById('custom-version-input');
            if (customInput) {
                customInput.value = latestVersion;
                customInput.style.borderColor = '#ff2e5e';
                customInput.style.boxShadow = '0 0 0 3px rgba(255, 46, 94, 0.3)';
            }
        }

        // Insert main "latest auto-selected" notice
        const notice = document.createElement('div');
        notice.className = 'info-text';
        notice.innerHTML = `<strong>Latest version auto-selected:</strong> ${latestVersion} (fetched live from Ableton)`;
        contentArea.insertBefore(notice, versionSections);

    } catch (err) {
        console.warn('Failed to fetch or process latest version:', err);
    }
})();
