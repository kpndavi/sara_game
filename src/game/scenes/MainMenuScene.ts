import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { TitleScene } from './TitleScene';
import { CharacterCreatorScene } from './CharacterCreatorScene';
import { DrawingScene } from './DrawingScene';
import { TetrisScene } from './TetrisScene';
// import { RunnerScene } from './RunnerScene';
import { GameState } from '../GameState';
import { CharacterRenderer } from '../CharacterRenderer';

// We import logic dynamically or stub to avoid circular deps if still an issue
// But we need classes for switchScene.
// Since TitleScene is new root, MainMenu is now 'Room'
import { RunnerScene } from './RunnerScene';

export class MainMenuScene implements Scene {
    private sceneManager: SceneManager;
    private zones: { name: string, x: number, y: number, width: number, height: number, color: string, action: () => void }[] = [];

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    init(): void {
        this.createUI();
        window.addEventListener('click', this.handleClick.bind(this));
    }

    createUI() {
        this.zones = [];
        const w = window.innerWidth;
        const h = window.innerHeight;

        // 1. Wardrobe (Character Creator) - Left side
        this.zones.push({
            name: "Wardrobe",
            x: 50,
            y: h - 300,
            width: 150,
            height: 250,
            color: "#8e44ad",
            action: () => {
                this.sceneManager.switchScene(new CharacterCreatorScene(this.sceneManager));
            }
        });

        // 2. Easel (Creative Studio) - Near Window?
        this.zones.push({
            name: "Easel",
            x: 250,
            y: h - 250,
            width: 120,
            height: 200,
            color: "#f39c12",
            action: () => {
                this.sceneManager.switchScene(new DrawingScene(this.sceneManager));
            }
        });

        // 3. Arcade Machine (Tetris)
        this.zones.push({
            name: "Arcade",
            x: w - 200,
            y: h - 250,
            width: 120,
            height: 200,
            color: "#2ecc71",
            action: () => {
                this.sceneManager.switchScene(new TetrisScene(this.sceneManager));
            }
        });

        // 4. Door (Adventure)
        this.zones.push({
            name: "Adventure",
            x: w / 2 - 60,
            y: h - 350,
            width: 120,
            height: 240,
            color: "#3498db",
            action: () => {
                this.sceneManager.switchScene(new RunnerScene(this.sceneManager));
            }
        });

        // 5. Back to Title (Exit) - Top Left
        this.zones.push({
            name: "Exit",
            x: 20,
            y: 20,
            width: 80,
            height: 40,
            color: "#95a5a6",
            action: () => {
                this.sceneManager.switchScene(new TitleScene(this.sceneManager));
            }
        });
    }

    handleClick(event: MouseEvent) {
        const clickX = event.clientX;
        const clickY = event.clientY;

        for (const zone of this.zones) {
            if (clickX >= zone.x && clickX <= zone.x + zone.width &&
                clickY >= zone.y && clickY <= zone.y + zone.height) {
                zone.action();
            }
        }
    }

    update(_deltaTime: number): void { }

    draw(ctx: CanvasRenderingContext2D): void {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Background (Wallpaper)
        ctx.fillStyle = "#fff0f5"; // Lavender/Pinkish
        ctx.fillRect(0, 0, w, h);

        // Floor
        ctx.fillStyle = "#e6d5b8"; // Wood
        ctx.fillRect(0, h - 100, w, 100);

        // Draw Interactive Zones (Placeholder Furniture)
        for (const zone of this.zones) {
            ctx.fillStyle = zone.color;
            ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

            // Label
            ctx.fillStyle = "white";
            ctx.font = "bold 20px 'Nunito'";
            ctx.textAlign = "center";
            ctx.fillText(zone.name, zone.x + zone.width / 2, zone.y + zone.height / 2);
        }

        // Draw Character in the center of the room
        const charX = w / 2;
        const charY = h - 80; // Standing on floor
        CharacterRenderer.drawCharacter(ctx, charX, charY, 1.5, GameState.getInstance().character);

        // Room Title
        ctx.fillStyle = "#555";
        ctx.font = "30px 'Fredoka One'";
        ctx.textAlign = "center";
        const name = GameState.getInstance().playerName;
        ctx.fillText(`${name}'s Room`, w / 2, 50);
    }

    onResize(_width: number, _height: number): void {
        this.createUI();
    }

    cleanup(): void {
        window.removeEventListener('click', this.handleClick.bind(this));
    }
}
