import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { GameState } from '../GameState';

type Heart = { x: number; y: number; speed: number; good: boolean };
export class CatchHeartsScene implements Scene {
    private sceneManager: SceneManager; private hearts: Heart[] = []; private basketX = 0; private score = 0; private timeLeft = 30; private finished = false; private spawnTimer = 0;
    constructor(sceneManager: SceneManager) { this.sceneManager = sceneManager; }
    init(): void { this.reset(); this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput); }
    private reset() { this.hearts = []; this.score = 0; this.timeLeft = 30; this.finished = false; this.spawnTimer = 0; this.basketX = this.sceneManager.getCanvas().width / 2; }
    private handleInput = (event: PointerEvent) => { const c = this.sceneManager.getCanvas(), r = c.getBoundingClientRect(); const x = (event.clientX - r.left) * c.width / r.width, y = (event.clientY - r.top) * c.height / r.height; if (x < 115 && y < 70) { this.sceneManager.switchScene(new GameMenuScene(this.sceneManager)); return; } if (this.finished) { this.reset(); return; } this.basketX = x; };
    update(deltaTime: number): void { if (this.finished) return; const s = deltaTime / 1000, c = this.sceneManager.getCanvas(); this.timeLeft -= s; this.spawnTimer -= s; if (this.spawnTimer <= 0) { this.hearts.push({ x: 35 + Math.random() * Math.max(1, c.width - 70), y: 115, speed: 100 + Math.random() * 70, good: Math.random() > 0.18 }); this.spawnTimer = 0.6; } this.hearts.forEach(h => h.y += h.speed * s); this.hearts = this.hearts.filter(h => { if (h.y > c.height - 85 && Math.abs(h.x - this.basketX) < 60) { this.score += h.good ? 1 : -1; return false; } return h.y < c.height + 30; }); if (this.timeLeft <= 0) { this.timeLeft = 0; this.finished = true; GameState.getInstance().updateHighScore('catch-hearts', Math.max(0, this.score)); } }
    draw(ctx: CanvasRenderingContext2D): void { const w = ctx.canvas.width, h = ctx.canvas.height; ctx.fillStyle = '#ffeef5'; ctx.fillRect(0, 0, w, h); ctx.textAlign = 'center'; ctx.fillStyle = '#e84393'; ctx.font = 'bold 40px "Fredoka One"'; ctx.fillText('Catch the Hearts', w / 2, 62); ctx.fillStyle = '#2d3436'; ctx.font = 'bold 22px "Nunito"'; ctx.fillText(`Score: ${this.score}   Time: ${Math.ceil(this.timeLeft)}s`, w / 2, 98); ctx.fillStyle = '#fab1a0'; ctx.fillRect(15, 18, 90, 40); ctx.fillStyle = 'white'; ctx.font = '20px "Nunito"'; ctx.fillText('Back', 60, 45); if (!this.finished) { this.hearts.forEach(h => { ctx.font = '38px serif'; ctx.fillText(h.good ? '💗' : '💔', h.x, h.y); }); ctx.font = '52px serif'; ctx.fillText('🧺', this.basketX, h - 42); } else { ctx.fillStyle = '#2d3436'; ctx.font = 'bold 34px "Fredoka One"'; ctx.fillText(`Final score: ${Math.max(0, this.score)}`, w / 2, h / 2); ctx.font = '22px "Nunito"'; ctx.fillText('Tap to play again', w / 2, h / 2 + 48); } }
    onResize(_width: number, _height: number): void { }
    cleanup(): void { this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput); }
}
