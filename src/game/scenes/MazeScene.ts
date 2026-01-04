import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { CharacterRenderer } from '../CharacterRenderer';
import { GameState } from '../GameState';

export class MazeScene implements Scene {
    private sceneManager: SceneManager;
    private playerX: number = 1;
    private playerY: number = 1;
    private tileSize: number = 40;
    private currentLevelIndex: number = 0;

    // Control State
    private isDragging: boolean = false;
    private lastMoveTime: number = 0;

    // 0: Wall, 1: Path, 2: Start, 3: Exit
    private levels: number[][][] = [
        // Level 1: Simple
        [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 3, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ],
        // Level 2: Trickier
        [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ],
        // Level 3: Large
        [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    ];

    private currentLevel: number[][];

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.currentLevel = this.levels[0];
        this.findStart();
    }

    findStart() {
        for (let y = 0; y < this.currentLevel.length; y++) {
            for (let x = 0; x < this.currentLevel[y].length; x++) {
                if (this.currentLevel[y][x] === 2) {
                    this.playerX = x;
                    this.playerY = y;
                    return;
                }
            }
        }
    }

    init(): void {
        console.log("DEBUG: MazeScene Init (Rewritten)");
        // Arrow keys
        window.addEventListener('keydown', this.handleInput);

        // Mouse / Touch
        window.addEventListener('mousedown', this.handleStart);
        window.addEventListener('mousemove', this.handleMove);
        window.addEventListener('mouseup', this.handleEnd);

        window.addEventListener('touchstart', this.handleStart, { passive: false });
        window.addEventListener('touchmove', this.handleMove, { passive: false });
        window.addEventListener('touchend', this.handleEnd);
    }

    // --- Interaction Logic ---

    private handleStart = (e: MouseEvent | TouchEvent) => {
        let clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        // 1. Check Back Button
        if (clientX > window.innerWidth - 100 && clientY < 80) {
            this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
            return;
        }

        // 2. Check Player Hitbox for Drag Start
        const { offsetX, offsetY } = this.getOffsets();
        const pX = offsetX + this.playerX * this.tileSize;
        const pY = offsetY + this.playerY * this.tileSize;

        // Hitbox: Player Tile (roughly 40x40, maybe give a little tolerance)
        if (
            clientX >= pX - 10 && clientX <= pX + this.tileSize + 10 &&
            clientY >= pY - 10 && clientY <= pY + this.tileSize + 10
        ) {
            this.isDragging = true;
        }

        if (e.type === 'touchstart') e.preventDefault();
    }

    private handleMove = (e: MouseEvent | TouchEvent) => {
        // Only process move if we are actively dragging the character
        if (!this.isDragging) return;

        let clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        if (e.type === 'touchmove') e.preventDefault();

        // Check if cursor has moved to an adjacent cell
        const { offsetX, offsetY } = this.getOffsets();
        const targetX = Math.floor((clientX - offsetX) / this.tileSize);
        const targetY = Math.floor((clientY - offsetY) / this.tileSize);

        const dx = targetX - this.playerX;
        const dy = targetY - this.playerY;

        // Only allow move to immediate neighbor (up/down/left/right)
        if (Math.abs(dx) + Math.abs(dy) === 1) {
            this.attemptMove(dx, dy);
        }
    }

    private handleEnd = () => {
        this.isDragging = false;
    }

    private handleInput = (e: KeyboardEvent) => {
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -1;
        if (e.key === 'ArrowDown') dy = 1;
        if (e.key === 'ArrowLeft') dx = -1;
        if (e.key === 'ArrowRight') dx = 1;
        this.attemptMove(dx, dy);
    }

    private attemptMove(dx: number, dy: number) {
        const now = Date.now();
        if (now - this.lastMoveTime < 100) return; // Limit speed

        const newX = this.playerX + dx;
        const newY = this.playerY + dy;

        // Bounds Check
        if (newY >= 0 && newY < this.currentLevel.length &&
            newX >= 0 && newX < this.currentLevel[newY].length) {

            // Wall Check
            if (this.currentLevel[newY][newX] !== 0) {
                this.playerX = newX;
                this.playerY = newY;
                this.lastMoveTime = now;

                if (this.currentLevel[newY][newX] === 3) {
                    this.nextLevel();
                }
            }
        }
    }

    private nextLevel() {
        this.currentLevelIndex++;
        if (this.currentLevelIndex < this.levels.length) {
            this.currentLevel = this.levels[this.currentLevelIndex];
            this.findStart();
            this.isDragging = false;
        } else {
            this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
        }
    }

    private getOffsets() {
        // Center the maze
        const offsetX = (window.innerWidth - this.currentLevel[0].length * this.tileSize) / 2;
        const offsetY = (window.innerHeight - this.currentLevel.length * this.tileSize) / 2;
        return { offsetX, offsetY };
    }

    update(_deltaTime: number): void { }

    draw(ctx: CanvasRenderingContext2D): void {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, w, h);

        const { offsetX, offsetY } = this.getOffsets();

        // Draw Map
        for (let y = 0; y < this.currentLevel.length; y++) {
            for (let x = 0; x < this.currentLevel[y].length; x++) {
                const cell = this.currentLevel[y][x];
                const drawX = offsetX + x * this.tileSize;
                const drawY = offsetY + y * this.tileSize;

                if (cell === 0) { // Wall
                    ctx.fillStyle = '#34495e';
                    ctx.fillRect(drawX, drawY, this.tileSize, this.tileSize);
                } else { // Path
                    ctx.fillStyle = '#ecf0f1';
                    ctx.fillRect(drawX, drawY, this.tileSize, this.tileSize);
                    if (cell === 3) { // Exit
                        ctx.fillStyle = '#e74c3c';
                        ctx.fillRect(drawX + 10, drawY + 10, this.tileSize - 20, this.tileSize - 20);
                    }
                }
            }
        }

        // Draw Player
        const pX = offsetX + this.playerX * this.tileSize + this.tileSize / 2;
        const pY = offsetY + this.playerY * this.tileSize + this.tileSize / 2;

        // Visual Drag Indicator
        if (this.isDragging) {
            ctx.beginPath();
            ctx.arc(pX, pY, 30, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 234, 167, 0.4)'; // Glow
            ctx.fill();
        }

        CharacterRenderer.drawCharacter(ctx, pX, pY, 0.4, GameState.getInstance().character);

        // UI
        ctx.fillStyle = 'white';
        ctx.font = '20px "Nunito"';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${this.currentLevelIndex + 1}`, 20, 40);
        ctx.fillText("Click & Hold Sara to Move!", 20, 70);

        // Back Button
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(w - 100, 20, 80, 40);
        ctx.fillStyle = 'white';
        ctx.fillText("Back", w - 60, 45); // Centered text roughly
    }

    onResize(_width: number, _height: number): void { }

    cleanup(): void {
        window.removeEventListener('keydown', this.handleInput);
        window.removeEventListener('mousedown', this.handleStart);
        window.removeEventListener('mousemove', this.handleMove);
        window.removeEventListener('mouseup', this.handleEnd);
        window.removeEventListener('touchstart', this.handleStart);
        window.removeEventListener('touchmove', this.handleMove);
        window.removeEventListener('touchend', this.handleEnd);
    }
}
