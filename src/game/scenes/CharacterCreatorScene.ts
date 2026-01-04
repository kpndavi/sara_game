import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { GameState } from '../GameState';
import { CharacterRenderer } from '../CharacterRenderer';

export class CharacterCreatorScene implements Scene {
    private sceneManager: SceneManager;
    private buttons: { text: string, x: number, y: number, width: number, height: number, action: () => void, color?: string }[] = [];
    private lastClick: number = 0;
    private bgImage: HTMLImageElement;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.bgImage = new Image();
        this.bgImage.src = new URL('../../assets/dressing_room_bg.png', import.meta.url).href;
    }
    // Premium Palette
    private hairColors = [
        "#2c3e50", // Midnight Blue
        "#e74c3c", // Ruby Red
        "#f1c40f", // Golden Blonde
        "#ecf0f1", // Platinum White
        "#9b59b6", // Lavender
        "#e67e22", // Ginger
        "#3498db", // Ice Blue
        "#2ecc71", // Forest Green
        "#34495e", // Charcoal
        "#ff9ff3", // Pink
        "#5f27cd", // Deep Purple
        "#00d2d3"  // Cyan
    ];
    private outfitColors = [
        "#ff6b81", // Pastel Red
        "#a4b0be", // Grey
        "#7bed9f", // Mint
        "#eccc68", // Mustard
        "#ff7f50", // Coral
        "#70a1ff", // Sky Blue
        "#5352ed", // Royal Blue
        "#ff4757", // Bright Red
        "#2f3542", // Asphalt
        "#d63031", // Crimson
        "#e056fd", // Violet
        "#686de0"  // Blurple
    ];
    private pets = [null, "cat", "dog", "dragon"];



    init(): void {
        this.createUI();
        this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput);
    }

    createUI() {
        this.buttons = [];
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const state = GameState.getInstance();
        const btnWidth = 200;
        const btnHeight = 50;

        // -- Controls Left (Hair) --
        this.buttons.push({
            text: "Hair Style >",
            x: cx - 350, y: cy - 150, width: btnWidth, height: btnHeight,
            action: () => {
                state.character.hairStyle = (state.character.hairStyle + 1) % 10;
            }
        });

        this.buttons.push({
            text: "Hair Color >",
            x: cx - 350, y: cy - 70, width: btnWidth, height: btnHeight,
            action: () => {
                const currentIdx = this.hairColors.indexOf(state.character.hairColor);
                state.character.hairColor = this.hairColors[(currentIdx + 1) % this.hairColors.length];
            }
        });

        this.buttons.push({
            text: "Your Name",
            x: cx - 350, y: cy + 10, width: btnWidth, height: btnHeight,
            action: () => {
                const newName = prompt("Enter your name:", state.playerName);
                if (newName) state.playerName = newName;
            }
        });

        // -- Controls Right (Outfit & Pet) --
        this.buttons.push({
            text: "Outfit >",
            x: cx + 150, y: cy - 150, width: btnWidth, height: btnHeight,
            action: () => {
                state.character.outfit = (state.character.outfit + 1) % 8;
            }
        });

        this.buttons.push({
            text: "Outfit Color >",
            x: cx + 150, y: cy - 70, width: btnWidth, height: btnHeight,
            action: () => {
                const currentIdx = this.outfitColors.indexOf(state.character.outfitColor);
                state.character.outfitColor = this.outfitColors[(currentIdx + 1) % this.outfitColors.length];
            }
        });

        this.buttons.push({
            text: "Pet >",
            x: cx + 150, y: cy + 10, width: btnWidth, height: btnHeight,
            action: () => {
                const currentIdx = this.pets.indexOf(state.character.pet);
                state.character.pet = this.pets[(currentIdx + 1) % this.pets.length];
            }
        });


        // -- Bottom (COME OUT AND PLAY) --
        this.buttons.push({
            text: "COME OUT AND PLAY!",
            x: cx - 150, y: window.innerHeight - 100, width: 300, height: 70,
            color: "#2ecc71",
            action: () => {
                state.save();
                this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
            }
        });

        // -- Randomize! (Top Center) --
        this.buttons.push({
            text: "MAKE IT BEAUTIFUL!",
            x: cx - 150, y: 100, width: 300, height: 50,
            color: "#ff9a9e",
            action: () => {
                state.character.hairStyle = Math.floor(Math.random() * 10);
                state.character.outfit = Math.floor(Math.random() * 2); // Still 2 for now, maybe add colors
                state.character.hairColor = this.hairColors[Math.floor(Math.random() * this.hairColors.length)];
                state.character.outfitColor = this.outfitColors[Math.floor(Math.random() * this.outfitColors.length)];
                state.character.pet = this.pets[Math.floor(Math.random() * this.pets.length)];
            }
        });
    }

    private handleInput = (event: PointerEvent) => {
        const now = Date.now();
        if (this.lastClick && now - this.lastClick < 300) return;
        this.lastClick = now;

        const canvas = this.sceneManager.getCanvas();
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        console.log(`Creator Input: ${clickX.toFixed(0)}, ${clickY.toFixed(0)}`);

        for (const btn of this.buttons) {
            if (clickX >= btn.x && clickX <= btn.x + btn.width &&
                clickY >= btn.y && clickY <= btn.y + btn.height) {
                btn.action();
                return;
            }
        }
    }

    update(_deltaTime: number): void { }

    draw(ctx: CanvasRenderingContext2D): void {
        const cx = ctx.canvas.width / 2;
        const cy = ctx.canvas.height / 2;

        // Background
        if (this.bgImage.complete && this.bgImage.naturalWidth > 0) {
            ctx.drawImage(this.bgImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        } else {
            ctx.fillStyle = '#f0f8ff';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // Spotlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy, 220, 0, Math.PI * 2);
        ctx.fill();

        // Render Character
        CharacterRenderer.drawCharacter(ctx, cx, cy, 2, GameState.getInstance().character);

        // UI
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 20px "Nunito"';

        for (const btn of this.buttons) {
            ctx.fillStyle = btn.color || '#ccc';
            ctx.beginPath();
            ctx.rect(btn.x, btn.y, btn.width, btn.height);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
        }

        ctx.fillStyle = '#555';
        ctx.font = 'bold 36px "Fredoka One"';
        ctx.fillText("Design Your Style", cx, 60);

        // Display Current Choices Text?
        // ctx.font = '16px "Nunito"';
        // ctx.fillText(`Pet: ${GameState.getInstance().character.pet || "None"}`, cx + 250, cy + 30);
    }

    onResize(_width: number, _height: number): void {
        this.createUI();
    }

    cleanup(): void {
        this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput);
    }
}
