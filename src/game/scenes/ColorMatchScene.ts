import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { GameState } from '../GameState';

const COLORS = [
    { name: 'Pink', value: '#ff7675' }, { name: 'Blue', value: '#74b9ff' },
    { name: 'Green', value: '#55efc4' }, { name: 'Yellow', value: '#ffeaa7' }
];

export class ColorMatchScene implements Scene {
    private sceneManager: SceneManager;
    private target = COLORS[0];
    private choices = COLORS.slice(0, 3);
    private score = 0;
    private round = 0;
    private finished = false;

    constructor(sceneManager: SceneManager) { this.sceneManager = sceneManager; }
    init(): void { this.newRound(); this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput); }
    private newRound() {
        this.target = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.choices = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 3);
        if (!this.choices.some(c => c.name === this.target.name)) this.choices[0] = this.target;
        this.choices = [...this.choices].sort(() => Math.random() - 0.5);
    }
    private handleInput = (event: PointerEvent) => {
        const c = this.sceneManager.getCanvas(); const r = c.getBoundingClientRect();
        const x = (event.clientX - r.left) * c.width / r.width; const y = (event.clientY - r.top) * c.height / r.height;
        if (x < 115 && y < 70) { this.sceneManager.switchScene(new GameMenuScene(this.sceneManager)); return; }
        if (this.finished) { this.score = 0; this.round = 0; this.finished = false; this.newRound(); return; }
        const startX = c.width / 2 - (this.choices.length * 105) / 2;
        this.choices.forEach((choice, i) => {
            const bx = startX + i * 105;
            if (x >= bx && x <= bx + 90 && y >= c.height / 2 + 35 && y <= c.height / 2 + 145) {
                if (choice.name === this.target.name) this.score++;
                this.round++;
                if (this.round >= 10) { this.finished = true; GameState.getInstance().updateHighScore('color-match', this.score); }
                else this.newRound();
            }
        });
    };
    update(_deltaTime: number): void { }
    draw(ctx: CanvasRenderingContext2D): void {
        const w = ctx.canvas.width, h = ctx.canvas.height;
        ctx.fillStyle = '#dff9fb'; ctx.fillRect(0, 0, w, h); ctx.textAlign = 'center';
        ctx.fillStyle = '#2d3436'; ctx.font = 'bold 38px "Fredoka One"'; ctx.fillText('Color Match', w / 2, 62);
        ctx.font = 'bold 21px "Nunito"'; ctx.fillText(`Round ${Math.min(this.round + 1, 10)} / 10   Score: ${this.score}`, w / 2, 98);
        ctx.fillStyle = '#fab1a0'; ctx.fillRect(15, 18, 90, 40); ctx.fillStyle = 'white'; ctx.font = '20px "Nunito"'; ctx.fillText('Back', 60, 45);
        if (this.finished) { ctx.fillStyle = '#2d3436'; ctx.font = 'bold 34px "Fredoka One"'; ctx.fillText(`Great job! ${this.score} / 10`, w / 2, h / 2); ctx.font = '22px "Nunito"'; ctx.fillText('Tap to play again', w / 2, h / 2 + 48); return; }
        ctx.fillStyle = '#2d3436'; ctx.font = 'bold 26px "Nunito"'; ctx.fillText(`Find ${this.target.name}`, w / 2, h / 2 - 65);
        const startX = w / 2 - (this.choices.length * 105) / 2;
        this.choices.forEach((choice, i) => { ctx.fillStyle = choice.value; ctx.beginPath(); ctx.roundRect(startX + i * 105, h / 2 + 35, 90, 110, 18); ctx.fill(); });
    }
    onResize(_width: number, _height: number): void { }
    cleanup(): void { this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput); }
}
