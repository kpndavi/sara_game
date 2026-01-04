const fs = require('fs');
const path = require('path');

const mappings = [
    { src: 'game_horse_run_v2', dest: 'game_horse_run.png' },
    { src: 'game_obstacle_rock_v2', dest: 'game_obstacle_rock.png' },
    { src: 'char_base_colored', dest: 'char_base.png' },
    { src: 'char_outfit_dress_colored', dest: 'char_outfit_dress.png' },
    { src: 'dressing_room_bg', dest: 'dressing_room_bg.png' }
];

const artifactDir = 'C:/Users/davis/.gemini/antigravity/brain/fb455529-2b4d-4aa7-a8c6-455aea26ba7b';
const destDir = path.join(__dirname, 'src/assets');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

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
