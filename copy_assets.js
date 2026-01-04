const fs = require('fs');
const path = require('path');

const files = [
    { src: 'C:/Users/davis/.gemini/antigravity/brain/fb455529-2b4d-4aa7-a8c6-455aea26ba7b/char_base_1767305856819.png', dest: 'char_base.png' },
    { src: 'C:/Users/davis/.gemini/antigravity/brain/fb455529-2b4d-4aa7-a8c6-455aea26ba7b/char_hair_long_1767305880814.png', dest: 'char_hair_long.png' },
    { src: 'C:/Users/davis/.gemini/antigravity/brain/fb455529-2b4d-4aa7-a8c6-455aea26ba7b/char_outfit_dress_1767305895515.png', dest: 'char_outfit_dress.png' }
];

const destDir = path.join(__dirname, 'public');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

files.forEach(f => {
    try {
        fs.copyFileSync(f.src, path.join(destDir, f.dest));
        console.log(`Copied ${f.dest}`);
    } catch (e) {
        console.error(`Error copying ${f.dest}:`, e);
    }
});
