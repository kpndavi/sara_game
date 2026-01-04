import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';
import { GameState } from '../GameState';

// Shapes: I, J, L, O, S, T, Z
const TETROMINOS = [
    [[1, 1, 1, 1]], // I
    [[1, 0, 0], [1, 1, 1]], // J
    [[0, 0, 1], [1, 1, 1]], // L
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]] // Z
];

const COLORS = ["#00f0f0", "#0000f0", "#f0a000", "#f0f000", "#00f000", "#a000f0", "#f00000"];

export class TetrisScene implements Scene {
    private sceneManager: SceneManager;

    // Grid 10x20
    private grid: (string | null)[][];
    private cols = 10;
    private rows = 20;
    private size = 30; // Block size

    // State
    private currentPiece: { shape: number[][], x: number, y: number, color: string } | null = null;
    private dropCounter = 0;
    private dropInterval = 1000;

    private score = 0;
    private gameOver = false;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    }

    init(): void {
        this.reset();
        window.addEventListener('keydown', this.handleInput);
        window.addEventListener('touchstart', this.handleTouch, { passive: false });
        // Mouse/Pointer for Back Button
        window.addEventListener('pointerup', this.handleClick);
    }

    handleClick = (e: PointerEvent) => {
        const w = window.innerWidth;
        // Check Back Button (Top Right)
        if (e.clientX > w - 100 && e.clientY < 80) {
            this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
        } else if (this.gameOver) {
            this.reset();
        }
    }

    reset() {
        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
        this.score = 0;
        this.gameOver = false;
        this.spawnPiece();
    }

    spawnPiece() {
        const typeId = Math.floor(Math.random() * TETROMINOS.length);
        this.currentPiece = {
            shape: TETROMINOS[typeId],
            color: COLORS[typeId],
            x: 3,
            y: 0
        };

        if (this.collide(this.grid, this.currentPiece)) {
            this.gameOver = true;
            this.currentPiece = null;
        }
    }

    handleInput = (e: KeyboardEvent) => {
        if (this.gameOver) {
            if (e.key === 'Enter') this.reset();
            if (e.key === 'Escape') this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
            return;
        }

        if (!this.currentPiece) return;

        if (e.key === 'ArrowLeft') {
            this.currentPiece.x--;
            if (this.collide(this.grid, this.currentPiece)) this.currentPiece.x++;
        } else if (e.key === 'ArrowRight') {
            this.currentPiece.x++;
            if (this.collide(this.grid, this.currentPiece)) this.currentPiece.x--;
        } else if (e.key === 'ArrowDown') {
            this.drop();
        } else if (e.key === 'ArrowUp') {
            this.rotate();
        }
    }

    rotate() {
        if (!this.currentPiece) return;
        const original = this.currentPiece.shape;
        const rotated = original[0].map((_, i) => original.map(row => row[i]).reverse());

        const prevShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        if (this.collide(this.grid, this.currentPiece)) {
            this.currentPiece.shape = prevShape; // Revert if invalid
        }
    }

    handleTouch = (e: TouchEvent) => {
        // Simple touch logic: top half rotate, bottom half drop?
        // Or left/right screen check.
        const touchX = e.touches[0].clientX;
        const width = window.innerWidth;

        if (this.gameOver) {
            this.reset();
            return;
        }

        if (touchX < width * 0.3) {
            // Left
            if (this.currentPiece) {
                this.currentPiece.x--;
                if (this.collide(this.grid, this.currentPiece)) this.currentPiece.x++;
            }
        } else if (touchX > width * 0.7) {
            // Right
            if (this.currentPiece) {
                this.currentPiece.x++;
                if (this.collide(this.grid, this.currentPiece)) this.currentPiece.x--;
            }
        } else {
            // Center - Rotate
            this.rotate();
        }
    }

    collide(grid: (string | null)[][], piece: { shape: number[][], x: number, y: number }): boolean {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const ny = piece.y + y;
                    const nx = piece.x + x;

                    if (ny >= this.rows || nx < 0 || nx >= this.cols || (ny >= 0 && grid[ny][nx])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    merge(grid: (string | null)[][], piece: { shape: number[][], x: number, y: number, color: string }) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const ny = piece.y + y;
                    const nx = piece.x + x;
                    if (ny >= 0 && ny < this.rows && nx >= 0 && nx < this.cols) {
                        grid[ny][nx] = piece.color;
                    }
                }
            }
        }
    }

    arenaSweep() {
        let rowCount = 1;
        outer: for (let y = this.rows - 1; y > 0; --y) {
            for (let x = 0; x < this.cols; ++x) {
                if (!this.grid[y][x]) {
                    continue outer;
                }
            }
            const row = this.grid.splice(y, 1)[0].fill(null);
            this.grid.unshift(row);
            ++y;
            this.score += rowCount * 10;
            rowCount *= 2;
        }
        GameState.getInstance().updateHighScore('tetris', this.score);
    }

    drop() {
        if (!this.currentPiece) return;
        this.currentPiece.y++;
        if (this.collide(this.grid, this.currentPiece)) {
            this.currentPiece.y--;
            this.merge(this.grid, this.currentPiece);
            this.spawnPiece();
            this.arenaSweep();
        }
        this.dropCounter = 0;
    }

    update(deltaTime: number): void {
        if (this.gameOver) return;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Center Grid
        const gridW = this.cols * this.size;
        const gridH = this.rows * this.size;
        const offsetX = (ctx.canvas.width - gridW) / 2;
        const offsetY = (ctx.canvas.height - gridH) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);

        // Draw Grid BG
        ctx.strokeStyle = "#333";
        ctx.strokeRect(0, 0, gridW, gridH);

        // Draw Locked Blocks
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x]) {
                    this.drawBlock(ctx, x, y, this.grid[y][x]!);
                }
            }
        }

        // Draw Current Piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x] !== 0) {
                        this.drawBlock(ctx, this.currentPiece.x + x, this.currentPiece.y + y, this.currentPiece.color);
                    }
                }
            }
        }

        ctx.restore();

        // UI
        ctx.fillStyle = "white";
        ctx.font = "24px 'Nunito'";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${this.score}`, 20, 40);

        if (this.gameOver) {
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = "40px 'Fredoka One'";
            ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.font = "20px 'Nunito'";
            ctx.fillText("Tap / Enter to Restart", ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
        }

        // Back Button
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(ctx.canvas.width - 100, 20, 80, 40);
        ctx.fillStyle = 'white';
        ctx.font = '20px "Nunito"'; // Standardize font
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Back", ctx.canvas.width - 60, 40);
    }

    drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.size, y * this.size, this.size - 1, this.size - 1);
        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(x * this.size, y * this.size, this.size - 1, 4);
    }

    onResize(_width: number, _height: number): void {
        this.size = Math.min(_width / 15, _height / 25);
    }

    cleanup(): void {
        window.removeEventListener('keydown', this.handleInput);
        window.removeEventListener('touchstart', this.handleTouch);
        window.removeEventListener('pointerup', this.handleClick);
    }
}
