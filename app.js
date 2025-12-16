// app.js - Main application logic with KV-backed dynamic versions + Accordion Support

let versions = [];

function compareVersions(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0, nb = pb[i] || 0;
        if (na > nb) return 1;
        if (na < nb) return -1;
    }
    return 0;
}

async function loadVersions() {
    try {
        const response = await fetch('/api/get-versions');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        versions = await response.json();

        // Sort descending (latest first)
        versions.sort((a, b) => compareVersions(b, a));

        populateVersionGrid();

        // After grid is built, default select the latest version item
        setTimeout(() => {
            document.querySelector('.version-item')?.classList.add('selected');
        }, 100); // Small delay to ensure DOM is ready
    } catch (err) {
        console.error('Failed to load versions from KV API:', err);
        alert('Failed to load version list. Please try refreshing the page.');

        // Fallback list
        versions = ["12.3.1", "12.3", "12.2.7", "12.0"];
        versions.sort((a, b) => compareVersions(b, a));
        populateVersionGrid();
    }
}

function groupVersionsByMajor(versions) {
    const grouped = {};
    versions.forEach(version => {
        const major = version.split('.')[0];
        if (!grouped[major]) grouped[major] = [];
        grouped[major].push(version);
    });
    return grouped;
}

function populateVersionGrid() {
    const versionSections = document.getElementById('version-sections');
    if (!versionSections) return;

    versionSections.innerHTML = ''; // Clear previous

    const groupedVersions = groupVersionsByMajor(versions);
    const majorVersions = Object.keys(groupedVersions).sort((a, b) => b - a);

    majorVersions.forEach(major => {
        const section = document.createElement('div');
        section.className = 'version-section collapsed'; // Start collapsed

        const header = document.createElement('div');
        header.className = 'section-header';
        header.textContent = `Version ${major}.x`;

        const content = document.createElement('div');
        content.className = 'section-content';

        const grid = document.createElement('div');
        grid.className = 'version-grid';

        groupedVersions[major].forEach(version => {
            const versionItem = document.createElement('div');
            versionItem.className = 'version-item';
            versionItem.textContent = version;
            versionItem.dataset.version = version;

            versionItem.addEventListener('click', () => {
                document.querySelectorAll('.version-item').forEach(item => item.classList.remove('selected'));
                versionItem.classList.add('selected');
                document.getElementById('custom-version-input').value = '';
            });

            grid.appendChild(versionItem);
        });

        content.appendChild(grid);
        section.appendChild(header);
        section.appendChild(content);
        versionSections.appendChild(section);

        // === Accordion Toggle Logic ===
        header.addEventListener('click', () => {
            section.classList.toggle('collapsed');
        });

        // === Auto-expand only the latest major version (12) ===
        if (major === '12') {
            section.classList.remove('collapsed');
        }
    });
}

// Auto-detect OS
function detectOS() {
    const userAgent = navigator.userAgent;
    const osDetection = document.getElementById('os-detection');
    let osValue = 'windows';
    let osName = 'Windows';

    if (userAgent.includes('Macintosh')) {
        if (userAgent.match(/(M1|M2|M3|Apple)/) || navigator.platform.includes('MacARM64')) {
            osValue = 'mac_arm';
            osName = 'macOS (Apple Silicon)';
        } else {
            osValue = 'mac_intel';
            osName = 'macOS (Intel)';
        }
    } else if (userAgent.includes('Win')) {
        osValue = 'windows';
        osName = 'Windows';
    }

    document.getElementById('os-select').value = osValue;
    osDetection.textContent = `Detected: ${osName}`;
    osDetection.style.color = '#ff2e5e';
    return osValue;
}

// Custom version handling
document.getElementById('custom-version-btn').addEventListener('click', function() {
    const customVersion = document.getElementById('custom-version-input').value.trim();
    if (!customVersion) return alert("Please enter a version number");

    const versionPattern = /^\d+(\.\d+){0,2}$/;
    if (!versionPattern.test(customVersion)) return alert("Invalid version format (e.g., 12.3.1)");

    document.querySelectorAll('.version-item').forEach(item => item.classList.remove('selected'));
    document.getElementById('custom-version-input').style.borderColor = '#ff2e5e';
    document.getElementById('custom-version-input').style.boxShadow = '0 0 0 3px rgba(255, 46, 94, 0.3)';
});

// Download button
// Download button - Now auto-starts download immediately
document.getElementById('download-btn').addEventListener('click', function() {
    const os = document.getElementById('os-select').value;
    const edition = document.getElementById('edition-select').value;
    const selectedVersion = document.querySelector('.version-item.selected');
    const customVersion = document.getElementById('custom-version-input').value.trim();

    let version = selectedVersion ? selectedVersion.dataset.version : (customVersion || null);
    if (!version) return alert("Please select a version or enter a custom version");

    let url = `https://cdn-downloads.ableton.com/channels/${version}/ableton_live_${edition}_${version}`;

    if (os.startsWith("mac")) {
        url += compareVersions(version, "11.0.12") > 0 
            ? (os === "mac_intel" ? "_intel.dmg" : "_universal.dmg")
            : "_64.dmg";
    } else {
        url += "_64.zip";
    }

    // Create hidden link and trigger download immediately
    const link = document.createElement('a');
    link.href = url;
    link.download = `ableton_live_${edition}_${version}${os.startsWith("mac") ? (os === "mac_intel" ? "_intel.dmg" : "_universal.dmg") : "_64.zip"}`; // Suggested filename
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Still show the ready message + fallback link (for rare cases where auto-download fails)
    const downloadLink = document.getElementById('download-link');
    const directLink = document.getElementById('direct-download-link');
    directLink.href = url;
    directLink.textContent = `Download Ableton Live ${edition.charAt(0).toUpperCase() + edition.slice(1)} ${version}`;
    downloadLink.style.display = 'block';
    downloadLink.scrollIntoView({ behavior: 'smooth' });
});

// Initial setup
detectOS();
loadVersions();
