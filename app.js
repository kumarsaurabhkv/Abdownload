// app.js - Main application logic (extracted and updated)

// Updated list of Ableton Live versions (as of December 16, 2025)
const versions = [
    "12.3.1", "12.3", "12.2.7", "12.2.6", "12.2.5", "12.2.2", "12.2.1", "12.2", "12.1.11", "12.1.10", "12.1.9", "12.1.8", "12.1.7", "12.1.6", "12.1.5",
    "12.1.4", "12.1.3", "12.1.2", "12.1.1", "12.1", "12.0.25", "12.0.20", "12.0.12", "12.0.11", "12.0.10",
    "12.0.9", "12.0.8", "12.0.7", "12.0.6", "12.0.5", "12.0.4", "12.0.3", "12.0.2", "12.0.1", "12.0",
    "11.3.43", "11.3.42", "11.3.35", "11.3.30", "11.3.20", "11.3.13", "11.3.12", "11.3.11", "11.3.10", "11.3.4", "11.3.3",
    "11.3.2", "11.2.11", "11.2.10", "11.2.7", "11.2.6", "11.2.5", "11.2", "11.1.5", "11.1.1", "11.1",
    "11.0.12", "11.0.11", "11.0.10", "11.0.6", "11.0.5", "11.0.2", "11.0.1", "11.0", "10.1.30", "10.1.25",
    "10.1.18", "10.1.17", "10.1.15", "10.1.14", "10.1.13", "10.1.9", "10.1.7", "10.1.6", "10.1.5", "10.1.4",
    "10.1.3", "10.1.2", "10.1.1", "10.1", "10.0.6", "10.0.5", "10.0.4", "10.0.3", "10.0.2", "10.0.1", "10.0",
    "9.7.7", "9.7.6", "9.7.5", "9.7.4", "9.7.3", "9.7.2", "9.7.1", "9.7", "9.6.2", "9.6.1", "9.6", "9.5",
    "9.2.3", "9.2.2", "9.2.1", "9.2", "9.1.10", "9.1.9", "9.1.8", "9.1.7", "9.1.6", "9.1.5", "9.1.4", "9.1.3",
    "9.1.2", "9.1", "9.0.6", "9.0.5", "9.0.4", "9.0.3", "9.0.2", "9.0.1"
];

// Function to compare versions
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

// Sort versions descending
versions.sort((a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    if (aParts[0] !== bParts[0]) return bParts[0] - aParts[0];
    if (aParts[1] !== bParts[1]) return (bParts[1] || 0) - (aParts[1] || 0);
    return (bParts[2] || 0) - (aParts[2] || 0);
});

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
    osDetection.style.color = '#6bb1ff';
    return osValue;
}

// Group and populate versions
function groupVersionsByMajor(versions) {
    const grouped = {};
    versions.forEach(version => {
        const major = version.split('.')[0];
        if (!grouped[major]) grouped[major] = [];
        grouped[major].push(version);
    });
    return grouped;
}

const versionSections = document.getElementById('version-sections');
const groupedVersions = groupVersionsByMajor(versions);
const majorVersions = Object.keys(groupedVersions).sort((a, b) => b - a);

majorVersions.forEach(major => {
    const section = document.createElement('div');
    section.className = 'version-section';

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
});

// Custom version handling
document.getElementById('custom-version-btn').addEventListener('click', function() {
    const customVersion = document.getElementById('custom-version-input').value.trim();
    if (!customVersion) return alert("Please enter a version number");

    const versionPattern = /^\d+(\.\d+){0,2}$/;
    if (!versionPattern.test(customVersion)) return alert("Invalid version format");

    document.querySelectorAll('.version-item').forEach(item => item.classList.remove('selected'));
    document.getElementById('custom-version-input').style.borderColor = '#6bb1ff';
    document.getElementById('custom-version-input').style.boxShadow = '0 0 0 3px rgba(107, 177, 255, 0.3)';
});

// Download button
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

    const downloadLink = document.getElementById('download-link');
    const directLink = document.getElementById('direct-download-link');
    directLink.href = url;
    directLink.textContent = `Download Ableton Live ${edition.charAt(0).toUpperCase() + edition.slice(1)} ${version}`;
    downloadLink.style.display = 'block';
    downloadLink.scrollIntoView({ behavior: 'smooth' });
});

// Initial setup
document.querySelector('.version-item')?.classList.add('selected');
detectOS();
