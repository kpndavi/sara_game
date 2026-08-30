import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { GameState } from '../GameState';

type Fruit = { x: number; y: number; radius: number; emoji: string; speed: number };

export class FruitSliceScene implements Scene {
    private sceneManager: SceneManager;
    private fruits: Fruit[] = [];
    private score = 0;
    private timeLeft = 30;
    private finished = false;
    private spawnTimer = 0;

    constructor(sceneManager: SceneManager) { this.sceneManager = sceneManager; }
    init(): void { this.reset(); this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput); }
    private reset() { this.fruits = []; this.score = 0; this.timeLeft = 30; this.finished = false; this.spawnTimer = 0; }
    private addFruit() {
        const c = this.sceneManager.getCanvas();
        const emojis = ['🍎', '🍊', '🍓', '🍉', '🍌'];
        this.fruits.push({ x: 45 + Math.random() * Math.max(1, c.width - 90), y: c.height + 30, radius: 30, emoji: emojis[Math.floor(Math.random() * emojis.length)], speed: 90 + Math.random() * 90 });
    }
    private handleInput = (event: PointerEvent) => {
        const c = this.sceneManager.getCanvas(), r = c.getBoundingClientRect();
        const x = (event.clientX - r.left) * c.width / r.width, y = (event.clientY - r.top) * c.height / r.height;
        if (x < 115 && y < 70) { this.sceneManager.switchScene(new GameMenuScene(this.sceneManager)); return; }
        if (this.finished) { this.reset(); return; }
        const i = this.fruits.findIndex(f => Math.hypot(x - f.x, y - f.y) < f.radius + 12);
        if (i >= 0) { this.fruits.splice(i, 1); this.score++; }
    };
    update(deltaTime: number): void {
        if (this.finished) return;
        const seconds = deltaTime / 1000; this.timeLeft -= seconds; this.spawnTimer -= seconds;
        if (this.spawnTimer <= 0) { this.addFruit(); this.spawnTimer = 0.65; }
        this.fruits.forEach(f => f.y -= f.speed * seconds);
        this.fruits = this.fruits.filter(f => f.y > 90);
        if (this.timeLeft <= 0) { this.timeLeft = 0; this.finished = true; GameState.getInstance().updateHighScore('fruit-slice', this.score); }
    }
    draw(ctx: CanvasRenderingContext2D): void {
        const w = ctx.canvas.width, h = ctx.canvas.height; ctx.fillStyle = '#fff3cd'; ctx.fillRect(0, 0, w, h); ctx.textAlign = 'center';
        ctx.fillStyle = '#e17055'; ctx.font = 'bold 40px "Fredoka One"'; ctx.fillText('Fruit Slice', w / 2, 62);
        ctx.fillStyle = '#2d3436'; ctx.font = 'bold 22px "Nunito"'; ctx.fillText(`Fruit: ${this.score}   Time: ${Math.ceil(this.timeLeft)}s`, w / 2, 98);
        ctx.fillStyle = '#fab1a0'; ctx.fillRect(15, 18, 90, 40); ctx.fillStyle = 'white'; ctx.font = '20px "Nunito"'; ctx.fillText('Back', 60, 45);
        if (!this.finished) this.fruits.forEach(f => { ctx.font = '48px serif'; ctx.fillText(f.emoji, f.x, f.y); });
        else { ctx.fillStyle = '#2d3436'; ctx.font = 'bold 34px "Fredoka One"'; ctx.fillText(`Time's up! ${this.score} fruit`, w / 2, h / 2); ctx.font = '22px "Nunito"'; ctx.fillText('Tap to play again', w / 2, h / 2 + 48); }
    }
    onResize(_width: number, _height: number): void { }
    cleanup(): void { this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput); }
}
