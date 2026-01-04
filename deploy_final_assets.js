const fs = require('fs');
const path = require('path');

// We use the best assets we have since generation failed for some.
const mappings = [
    { src: 'hair_long_final', dest: 'char_hair_long.png' },
    { src: 'hair_bob_final', dest: 'char_hair_bob.png' },
    // Fallback to 'clean' for pigtails as 'final' failed
    { src: 'hair_pigtails_clean', dest: 'char_hair_pigtails.png' },
    // Re-deploying dress to be safe
    { src: 'char_outfit_v4', dest: 'char_outfit_dress.png' },
    // Duplicate dress as shirt for now since generation failed
    { src: 'char_outfit_v4', dest: 'char_outfit_shirt.png' }
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
