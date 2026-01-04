const fs = require('fs');
const path = require('path');

const mappings = [
    { src: 'coloring_page_chibi', dest: 'coloring_page_1.png' },
    { src: 'coloring_page_horse', dest: 'coloring_page_2.png' },
    { src: 'coloring_page_castle', dest: 'coloring_page_3.png' },
    { src: 'game_horse_run', dest: 'game_horse_run.png' },
    { src: 'game_obstacle_rock', dest: 'game_obstacle_rock.png' },
    { src: 'char_base_white_fill', dest: 'char_base.png' },
    { src: 'char_outfit_dress_white_fill', dest: 'char_outfit_dress.png' }
];

const artifactDir = 'C:/Users/davis/.gemini/antigravity/brain/fb455529-2b4d-4aa7-a8c6-455aea26ba7b';
const destDir = path.join(__dirname, 'src/assets');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// Find latest file for each prefix in artifact dir
function findLatest(prefix) {
    const files = fs.readdirSync(artifactDir);
    const matches = files.filter(f => f.startsWith(prefix) && f.endsWith('.png'));
    if (matches.length === 0) return null;
    // Sort by timestamp (assumed in filename) or just pick last
    // The filenames have timestamps like _1767...
    matches.sort();
    return matches[matches.length - 1]; // Pick latest
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
