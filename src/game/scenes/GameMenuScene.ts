import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { TitleScene } from './TitleScene';
import { DrawingScene } from './DrawingScene';
import { ColoringScene } from './ColoringScene';
import { TetrisScene } from './TetrisScene';
import { HorseRunnerScene } from './HorseRunnerScene';
import { MemoryScene } from './MemoryScene';
import { StarCatchScene } from './StarCatchScene';
import { ColorMatchScene } from './ColorMatchScene';
import { BubblePopScene } from './BubblePopScene';
import { FruitSliceScene } from './FruitSliceScene';
import { WhackAMoleScene } from './WhackAMoleScene';
import { FindDifferenceScene } from './FindDifferenceScene';
import { DressUpChallengeScene } from './DressUpChallengeScene';
import { CatchHeartsScene } from './CatchHeartsScene';

export class GameMenuScene implements Scene {
    private sceneManager: SceneManager;
    private buttons: { text: string, x: number, y: number, width: number, height: number, color: string, action: () => void }[] = [];

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    init(): void {
        this.createUI();
        this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput);
    }

    createUI() {
        this.buttons = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = w / 2;
        const cy = h / 2;

        const columns = w < 760 ? 2 : 3;
        const btnW = Math.min(220, (w - 80 - (columns - 1) * 24) / columns);
        const btnH = w < 760 ? 88 : 100;
        const gap = w < 760 ? 18 : 28;

        const games = [
            { name: "Block Party", color: "#e74c3c", scene: () => new TetrisScene(this.sceneManager) },
            { name: "Creative Studio", color: "#f39c12", scene: () => new DrawingScene(this.sceneManager) },
            { name: "Coloring Book", color: "#f1c40f", scene: () => new ColoringScene(this.sceneManager) },
            { name: "Horse Runner", color: "#3498db", scene: () => new HorseRunnerScene(this.sceneManager) },
            { name: "Memory Magic", color: "#ff9ff3", scene: () => new MemoryScene(this.sceneManager) },
            { name: "Star Catch", color: "#6c5ce7", scene: () => new StarCatchScene(this.sceneManager) },
            { name: "Color Match", color: "#00b894", scene: () => new ColorMatchScene(this.sceneManager) },
            { name: "Bubble Pop", color: "#0984e3", scene: () => new BubblePopScene(this.sceneManager) },
            { name: "Fruit Slice", color: "#e17055", scene: () => new FruitSliceScene(this.sceneManager) },
            { name: "Whack-a-Mole", color: "#0984e3", scene: () => new WhackAMoleScene(this.sceneManager) },
            { name: "Find Difference", color: "#6c5ce7", scene: () => new FindDifferenceScene(this.sceneManager) },
            { name: "Dress-Up Challenge", color: "#e84393", scene: () => new DressUpChallengeScene(this.sceneManager) },
            { name: "Catch the Hearts", color: "#fd79a8", scene: () => new CatchHeartsScene(this.sceneManager) }
        ];

        games.forEach((game, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const rows = Math.ceil(games.length / columns);
            const totalHeight = rows * btnH + (rows - 1) * gap;
            const startX = cx - (columns * btnW + (columns - 1) * gap) / 2;
            const centeredY = cy - totalHeight / 2 + 24;
            const startY = Math.max(92, Math.min(centeredY, h - totalHeight - 18));

            this.buttons.push({
                text: game.name,
                x: startX + col * (btnW + gap),
                y: startY + row * (btnH + gap),
                width: btnW,
                height: btnH,
                color: game.color,
                action: () => {
                    this.sceneManager.switchScene(game.scene());
                }
            });
        });

        // Exit Button
        this.buttons.push({
            text: "Change Hero",
            x: 20, y: 20, width: 140, height: 40, color: "#95a5a6",
            action: () => {
                this.sceneManager.switchScene(new TitleScene(this.sceneManager));
            }
        });
    }

    private handleInput = (event: PointerEvent) => {
        const canvas = this.sceneManager.getCanvas();
        const rect = canvas.getBoundingClientRect();

        // Map client coordinates to canvas internal coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        console.log(`Input: client(${event.clientX}, ${event.clientY}) -> canvas(${clickX.toFixed(0)}, ${clickY.toFixed(0)})`);

        for (const btn of this.buttons) {
            // console.log(`Checking btn '${btn.text}': ${btn.x},${btn.y} [${btn.width}x${btn.height}]`);
            if (clickX >= btn.x && clickX <= btn.x + btn.width &&
                clickY >= btn.y && clickY <= btn.y + btn.height) {
                console.log(`Action: Clicked '${btn.text}'`);
                btn.action();
                break; // Handle one button per click
            }
        }
    }

    update(_deltaTime: number): void { }

    draw(ctx: CanvasRenderingContext2D): void {
        // Background
        ctx.fillStyle = '#fce4ec'; // Light pink
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Header
        ctx.fillStyle = "#ff6b81";
        ctx.font = "bold 50px 'Fredoka One'";
        ctx.textAlign = "center";
        ctx.fillText("Game Center", ctx.canvas.width / 2, 80);

        // Buttons
        ctx.font = "bold 24px 'Nunito'";
        ctx.textBaseline = "middle";

        for (const btn of this.buttons) {
            // Shadow
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.beginPath();
            ctx.roundRect(btn.x + 5, btn.y + 5, btn.width, btn.height, 15);
            ctx.fill();

            // Button
            ctx.fillStyle = btn.color;
            ctx.beginPath();
            ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 15);
            ctx.fill();

            // Text
            ctx.fillStyle = "white";
            ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
    }

    onResize(_width: number, _height: number): void {
        this.createUI();
    }

    cleanup(): void {
        this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput);
    }
}
