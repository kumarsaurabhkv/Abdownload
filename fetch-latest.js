// fetch-latest.js - Auto-detect latest version and persist new ones to KV

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
                break; // First match is the latest
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
            currentVersions.unshift(latestVersion); // Add as newest

            try {
                const updateResp = await fetch('/api/update-versions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentVersions)
                });

                if (updateResp.ok) {
                    console.log('New version successfully saved to KV:', latestVersion);
                    
                    const savedNotice = document.createElement('div');
                    savedNotice.className = 'info-text';
                    savedNotice.innerHTML = `<strong>New version auto-added & saved permanently:</strong> ${latestVersion}`;
                    document.querySelector('.content-area').insertBefore(savedNotice, document.getElementById('version-sections'));
                } else {
                    console.warn('Failed to save new version to KV');
                }
            } catch (e) {
                console.warn('Error calling update API:', e);
            }
        }

        // Auto-select the latest version in the UI
        let found = false;
        document.querySelectorAll('.version-item').forEach(item => {
            if (item.dataset.version === latestVersion) {
                item.classList.add('selected');
                found = true;
            } else {
                item.classList.remove('selected');
            }
        });

        // If not in grid (very new), use custom input
        if (!found) {
            const customInput = document.getElementById('custom-version-input');
            if (customInput) {
                customInput.value = latestVersion;
                customInput.style.borderColor = '#ff2e5e';
                customInput.style.boxShadow = '0 0 0 3px rgba(255, 46, 94, 0.3)';
            }
        }

        // Always show the "latest detected" notice
        const notice = document.createElement('div');
        notice.className = 'info-text';
        notice.innerHTML = `<strong>Latest version auto-selected:</strong> ${latestVersion} (fetched live from Ableton)`;

        const insertNotice = () => {
            const contentArea = document.querySelector('.content-area');
            const versionSections = document.getElementById('version-sections');
            if (contentArea && versionSections) {
                contentArea.insertBefore(notice, versionSections);
            } else {
                setTimeout(insertNotice, 100);
            }
        };
        insertNotice();

    } catch (err) {
        console.warn('Failed to fetch latest version:', err);
        // Fallback: do nothing, user can still select manually
    }
})();
