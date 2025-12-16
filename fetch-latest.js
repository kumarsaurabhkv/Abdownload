// fetch-latest.js - Robust version with safer notice insertion

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

        // Helper: Wait for contentArea to be ready (more reliable)
        const waitForContentArea = () => {
            return new Promise((resolve) => {
                const check = () => {
                    const contentArea = document.querySelector('.content-area');
                    const versionSections = document.getElementById('version-sections');
                    if (contentArea && versionSections) {
                        resolve({ contentArea, versionSections });
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        };

        const { contentArea, versionSections } = await waitForContentArea();

        // Safe notice insertion function
        const insertNoticeBeforeVersions = (html) => {
            const notice = document.createElement('div');
            notice.className = 'info-text';
            notice.innerHTML = html;

            // Find the correct insertion point
            const referenceNode = versionSections;
            if (referenceNode.parentNode === contentArea) {
                contentArea.insertBefore(notice, referenceNode);
            } else {
                // Fallback: append to contentArea if structure changed
                contentArea.appendChild(notice);
            }
        };

        // Insert notices safely
        if (isNew) {
            insertNoticeBeforeVersions(`<strong>New version auto-added & saved permanently:</strong> ${latestVersion}`);
        }

        insertNoticeBeforeVersions(`<strong>Latest version auto-selected:</strong> ${latestVersion} (fetched live from Ableton)`);

        // Auto-select the latest version (wait a bit more if needed)
        let found = false;
        const trySelect = () => {
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
        };

        // Run selection immediately and retry a few times
        trySelect();
        setTimeout(trySelect, 200);
        setTimeout(trySelect, 500);

    } catch (err) {
        console.warn('Failed to fetch or process latest version:', err);
    }
})();
