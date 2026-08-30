import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { GameState } from '../GameState';

const OUTFITS = [{ name: 'Party', emoji: '👗', color: '#e84393' }, { name: 'Sunny', emoji: '👚', color: '#f6b93b' }, { name: 'Fancy', emoji: '🧥', color: '#6c5ce7' }];
export class DressUpChallengeScene implements Scene {
    private sceneManager: SceneManager; private target = OUTFITS[0]; private score = 0; private round = 0; private finished = false;
    constructor(sceneManager: SceneManager) { this.sceneManager = sceneManager; }
    init(): void { this.next(); this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput); }
    private next() { this.target = OUTFITS[Math.floor(Math.random() * OUTFITS.length)]; }
    private handleInput = (event: PointerEvent) => { const c = this.sceneManager.getCanvas(), r = c.getBoundingClientRect(); const x = (event.clientX - r.left) * c.width / r.width, y = (event.clientY - r.top) * c.height / r.height; if (x < 115 && y < 70) { this.sceneManager.switchScene(new GameMenuScene(this.sceneManager)); return; } if (this.finished) { this.score = 0; this.round = 0; this.finished = false; this.next(); return; } const startX = c.width / 2 - 170; OUTFITS.forEach((outfit, i) => { const bx = startX + i * 115; if (x >= bx && x <= bx + 100 && y >= c.height - 170 && y <= c.height - 55) { if (outfit.name === this.target.name) this.score++; this.round++; if (this.round >= 8) { this.finished = true; GameState.getInstance().updateHighScore('dress-up-challenge', this.score); } else this.next(); } }); };
    update(_deltaTime: number): void { }
    draw(ctx: CanvasRenderingContext2D): void { const w = ctx.canvas.width, h = ctx.canvas.height; ctx.fillStyle = '#fff0f5'; ctx.fillRect(0, 0, w, h); ctx.textAlign = 'center'; ctx.fillStyle = '#e84393'; ctx.font = 'bold 40px "Fredoka One"'; ctx.fillText('Dress-Up Challenge', w / 2, 62); ctx.fillStyle = '#2d3436'; ctx.font = 'bold 21px "Nunito"'; ctx.fillText(`Choose: ${this.target.name}   Round ${Math.min(this.round + 1, 8)} / 8   Score: ${this.score}`, w / 2, 98); ctx.fillStyle = '#fab1a0'; ctx.fillRect(15, 18, 90, 40); ctx.fillStyle = 'white'; ctx.font = '20px "Nunito"'; ctx.fillText('Back', 60, 45); if (this.finished) { ctx.fillStyle = '#2d3436'; ctx.font = 'bold 34px "Fredoka One"'; ctx.fillText(`Stylist score: ${this.score} / 8`, w / 2, h / 2); ctx.font = '22px "Nunito"'; ctx.fillText('Tap to play again', w / 2, h / 2 + 48); return; } ctx.font = '100px serif'; ctx.fillText('🧍‍♀️', w / 2, h / 2 + 15); const startX = w / 2 - 170; OUTFITS.forEach((outfit, i) => { const bx = startX + i * 115; ctx.fillStyle = outfit.color; ctx.beginPath(); ctx.roundRect(bx, h - 170, 100, 115, 16); ctx.fill(); ctx.fillStyle = 'white'; ctx.font = '40px serif'; ctx.fillText(outfit.emoji, bx + 50, h - 115); ctx.font = '17px "Nunito"'; ctx.fillText(outfit.name, bx + 50, h - 72); }); }
    onResize(_width: number, _height: number): void { }
    cleanup(): void { this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput); }
}
