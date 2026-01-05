import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameState } from '../GameState';
import { CharacterCreatorScene } from './CharacterCreatorScene';

export class TitleScene implements Scene {
    private sceneManager: SceneManager;
    private buttons: { text: string, x: number, y: number, width: number, height: number, action: () => void, color: string }[] = [];

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    init(): void {
        console.log("DEBUG: TitleScene Init");
        this.createUI();
        this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput);
    }

    handleInput = (event: PointerEvent) => {
        const canvas = this.sceneManager.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        for (const btn of this.buttons) {
            if (clickX >= btn.x && clickX <= btn.x + btn.width &&
                clickY >= btn.y && clickY <= btn.y + btn.height) {
                btn.action();
            }
        }
    }

    createUI() {
        this.buttons = [];
        const w = window.innerWidth;
        const h = window.innerHeight;

        const cardWidth = 200;
        const cardHeight = 300;
        const gap = 50;
        const startX = (w - (3 * cardWidth + 2 * gap)) / 2;
        const centerY = h / 2 - cardHeight / 2;

        const slots = ['sara', 'lara', 'sofia'];
        const colors = ['#ff9a9e', '#a18cd1', '#4facfe'];

        slots.forEach((slot, index) => {
            this.buttons.push({
                text: slot.charAt(0).toUpperCase() + slot.slice(1),
                x: startX + index * (cardWidth + gap),
                y: centerY,
                width: cardWidth,
                height: cardHeight,
                color: colors[index],
                action: () => {
                    GameState.getInstance().currentSlot = slot;
                    GameState.getInstance().load();
                    this.sceneManager.switchScene(new CharacterCreatorScene(this.sceneManager));
                }
            });
        });
    }

    update(_deltaTime: number): void { }

    draw(ctx: CanvasRenderingContext2D): void {
        // BG
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, '#a18cd1');
        gradient.addColorStop(1, '#fbc2eb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 60px "Fredoka One"';
        ctx.textAlign = 'center';
        ctx.fillText("Who are you today?", ctx.canvas.width / 2, 100);

        // Cards
        for (const btn of this.buttons) {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(btn.x + 10, btn.y + 10, btn.width, btn.height, 20);
            else ctx.rect(btn.x + 10, btn.y + 10, btn.width, btn.height);
            ctx.fill();

            // Card
            ctx.fillStyle = btn.color;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 20);
            else ctx.rect(btn.x, btn.y, btn.width, btn.height);
            ctx.fill();

            // White Inner
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(btn.x + 10, btn.y + 10, btn.width - 20, btn.height - 80, 15);
            else ctx.rect(btn.x + 10, btn.y + 10, btn.width - 20, btn.height - 80);
            ctx.fill();

            // Avatar Placeholder (Circle)
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(btn.x + btn.width / 2, btn.y + 100, 60, 0, Math.PI * 2);
            ctx.fill();

            // Text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 36px "Nunito"';
            ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height - 30);
        }
    }

    onResize(_width: number, _height: number): void {
        this.createUI();
    }

    cleanup(): void {
        this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput);
    }
}
