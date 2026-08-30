import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { GameState } from '../GameState';

export class StarCatchScene implements Scene {
    private sceneManager: SceneManager;
    private x = 0;
    private y = 0;
    private score = 0;
    private timeLeft = 30;
    private finished = false;

    constructor(sceneManager: SceneManager) { this.sceneManager = sceneManager; }

    init(): void {
        this.reset();
        this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput);
    }

    private reset() {
        this.score = 0;
        this.timeLeft = 30;
        this.finished = false;
        this.moveStar();
    }

    private moveStar() {
        const canvas = this.sceneManager.getCanvas();
        this.x = 70 + Math.random() * Math.max(1, canvas.width - 140);
        this.y = 130 + Math.random() * Math.max(1, canvas.height - 220);
    }

    private handleInput = (event: PointerEvent) => {
        const canvas = this.sceneManager.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * canvas.width / rect.width;
        const y = (event.clientY - rect.top) * canvas.height / rect.height;
        if (x < 115 && y < 70) { this.back(); return; }
        if (this.finished) { this.reset(); return; }
        if (Math.hypot(x - this.x, y - this.y) < 52) {
            this.score++;
            this.moveStar();
        }
    };

    private back() { this.sceneManager.switchScene(new GameMenuScene(this.sceneManager)); }

    update(deltaTime: number): void {
        if (this.finished) return;
        this.timeLeft -= deltaTime / 1000;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.finished = true;
            GameState.getInstance().updateHighScore('star-catch', this.score);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        ctx.fillStyle = '#6c5ce7'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'white'; ctx.textAlign = 'center';
        ctx.font = 'bold 40px "Fredoka One"'; ctx.fillText('Star Catch', w / 2, 62);
        ctx.font = 'bold 22px "Nunito"'; ctx.fillText(`Stars: ${this.score}   Time: ${Math.ceil(this.timeLeft)}s`, w / 2, 98);
        ctx.fillStyle = '#fab1a0'; ctx.fillRect(15, 18, 90, 40);
        ctx.fillStyle = 'white'; ctx.font = '20px "Nunito"'; ctx.fillText('Back', 60, 45);
        if (!this.finished) {
            ctx.font = '72px serif'; ctx.fillText('⭐', this.x, this.y + 24);
        } else {
            ctx.font = 'bold 34px "Fredoka One"'; ctx.fillText(`Time's up! ${this.score} stars`, w / 2, h / 2);
            ctx.font = '22px "Nunito"'; ctx.fillText('Tap anywhere to play again', w / 2, h / 2 + 48);
        }
    }

    onResize(_width: number, _height: number): void { if (!this.finished) this.moveStar(); }
    cleanup(): void { this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput); }
}
