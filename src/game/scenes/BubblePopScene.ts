import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { GameState } from '../GameState';

interface Bubble { x: number; y: number; radius: number; color: string; }

export class BubblePopScene implements Scene {
    private sceneManager: SceneManager; private bubbles: Bubble[] = []; private score = 0; private timeLeft = 20; private finished = false;
    private colors = ['#ff7675', '#74b9ff', '#a29bfe', '#55efc4', '#ffeaa7'];
    constructor(sceneManager: SceneManager) { this.sceneManager = sceneManager; }
    init(): void { this.reset(); this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput); }
    private reset() { this.score = 0; this.timeLeft = 20; this.finished = false; this.bubbles = []; for (let i = 0; i < 12; i++) this.addBubble(); }
    private addBubble() { const c = this.sceneManager.getCanvas(); this.bubbles.push({ x: 45 + Math.random() * Math.max(1, c.width - 90), y: 130 + Math.random() * Math.max(1, c.height - 210), radius: 22 + Math.random() * 16, color: this.colors[Math.floor(Math.random() * this.colors.length)] }); }
    private handleInput = (event: PointerEvent) => { const c = this.sceneManager.getCanvas(), r = c.getBoundingClientRect(); const x = (event.clientX - r.left) * c.width / r.width, y = (event.clientY - r.top) * c.height / r.height; if (x < 115 && y < 70) { this.sceneManager.switchScene(new GameMenuScene(this.sceneManager)); return; } if (this.finished) { this.reset(); return; } const i = this.bubbles.findIndex(b => Math.hypot(x - b.x, y - b.y) <= b.radius); if (i >= 0) { this.bubbles.splice(i, 1); this.score++; this.addBubble(); } };
    update(deltaTime: number): void { if (!this.finished) { this.timeLeft -= deltaTime / 1000; if (this.timeLeft <= 0) { this.timeLeft = 0; this.finished = true; GameState.getInstance().updateHighScore('bubble-pop', this.score); } } }
    draw(ctx: CanvasRenderingContext2D): void { const w = ctx.canvas.width, h = ctx.canvas.height; ctx.fillStyle = '#81ecec'; ctx.fillRect(0, 0, w, h); ctx.textAlign = 'center'; ctx.fillStyle = '#0984e3'; ctx.font = 'bold 40px "Fredoka One"'; ctx.fillText('Bubble Pop', w / 2, 62); ctx.font = 'bold 22px "Nunito"'; ctx.fillText(`Popped: ${this.score}   Time: ${Math.ceil(this.timeLeft)}s`, w / 2, 98); ctx.fillStyle = '#fab1a0'; ctx.fillRect(15, 18, 90, 40); ctx.fillStyle = 'white'; ctx.font = '20px "Nunito"'; ctx.fillText('Back', 60, 45); if (this.finished) { ctx.fillStyle = '#0984e3'; ctx.font = 'bold 34px "Fredoka One"'; ctx.fillText(`Amazing! ${this.score} bubbles`, w / 2, h / 2); ctx.font = '22px "Nunito"'; ctx.fillText('Tap to play again', w / 2, h / 2 + 48); return; } this.bubbles.forEach(b => { ctx.fillStyle = b.color; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.beginPath(); ctx.arc(b.x - b.radius / 3, b.y - b.radius / 3, b.radius / 4, 0, Math.PI * 2); ctx.fill(); }); }
    onResize(_width: number, _height: number): void { }
    cleanup(): void { this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput); }
}
