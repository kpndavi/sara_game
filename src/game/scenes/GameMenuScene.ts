import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { TitleScene } from './TitleScene';
import { DrawingScene } from './DrawingScene';
import { ColoringScene } from './ColoringScene';
import { TetrisScene } from './TetrisScene';
// Stubs for new games
import { MazeScene } from './MazeScene';
import { PuzzleScene } from './PuzzleScene';
import { HorseRunnerScene } from './HorseRunnerScene';
import { MemoryScene } from './MemoryScene';

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

        // Grid layout: 2 rows of 3
        const btnW = 220;
        const btnH = 120;
        const gap = 40;

        const startX = cx - (btnW * 1.5 + gap);
        const startY = cy - (btnH + gap / 2);

        const games = [
            { name: "Block Party", color: "#e74c3c", scene: () => new TetrisScene(this.sceneManager) },
            { name: "Creative Studio", color: "#f39c12", scene: () => new DrawingScene(this.sceneManager) },
            { name: "Coloring Book", color: "#f1c40f", scene: () => new ColoringScene(this.sceneManager) },
            { name: "Crystal Maze", color: "#1abc9c", scene: () => new MazeScene(this.sceneManager) },
            { name: "Picture Puzzle", color: "#9b59b6", scene: () => new PuzzleScene(this.sceneManager) },
            { name: "Horse Runner", color: "#3498db", scene: () => new HorseRunnerScene(this.sceneManager) },
            { name: "Memory Magic", color: "#ff9ff3", scene: () => new MemoryScene(this.sceneManager) }
        ];

        games.forEach((game, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);

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
