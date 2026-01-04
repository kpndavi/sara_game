const fs = require('fs');
const path = require('path');

const mappings = [
    { src: 'hair_long_clean', dest: 'char_hair_long.png' },
    { src: 'hair_bob_clean', dest: 'char_hair_bob.png' },
    { src: 'hair_pigtails_clean', dest: 'char_hair_pigtails.png' }
];

const artifactDir = 'C:/Users/davis/.gemini/antigravity/brain/fb455529-2b4d-4aa7-a8c6-455aea26ba7b';
const destDir = path.join(__dirname, 'src/assets');

function findLatest(prefix) {
    const files = fs.readdirSync(artifactDir);
    const matches = files.filter(f => f.startsWith(prefix) && f.endsWith('.png'));
    if (matches.length === 0) return null;
    matches.sort();
    return matches[matches.length - 1];
}

mappings.forEach(m => {
    const latest = findLatest(m.src);
    if (latest) {
        fs.copyFileSync(path.join(artifactDir, latest), path.join(destDir, m.dest));
        console.log(`Deployed ${latest} -> ${m.dest}`);
    } else {
        console.error(`Could not find artifact for ${m.src}`);
    }
});
