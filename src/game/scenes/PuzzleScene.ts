import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';

export class PuzzleScene implements Scene {
    private sceneManager: SceneManager;
    private tiles: number[] = []; // 0-8, 8 is empty
    private gridSize = 3;
    private tileSize = 100;
    private solved = false;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    init(): void {
        this.resetPuzzle();
        window.addEventListener('click', this.handleClick.bind(this));
    }

    resetPuzzle() {
        this.tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        // Shuffle (must be solvable, simplifed shuffle for now)
        // Let's just do random swaps
        for (let i = 0; i < 20; i++) {
            this.randomMove();
        }
        this.solved = false;
    }

    randomMove() {
        const emptyIdx = this.tiles.indexOf(8);
        const neighbors = this.getNeighbors(emptyIdx);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        this.swap(emptyIdx, randomNeighbor);
    }

    getNeighbors(idx: number): number[] {
        const neighbors = [];
        const x = idx % this.gridSize;
        const y = Math.floor(idx / this.gridSize);

        if (x > 0) neighbors.push(idx - 1);
        if (x < this.gridSize - 1) neighbors.push(idx + 1);
        if (y > 0) neighbors.push(idx - this.gridSize);
        if (y < this.gridSize - 1) neighbors.push(idx + this.gridSize);

        return neighbors;
    }

    handleClick(e: MouseEvent) {
        // Check Back Button (Top Right)
        if (e.clientX > window.innerWidth - 100 && e.clientY < 80) {
            this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
            return;
        }

        if (this.solved) {
            this.resetPuzzle();
            return;
        }

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const startX = cx - (this.gridSize * this.tileSize) / 2;
        const startY = cy - (this.gridSize * this.tileSize) / 2;

        const mx = e.clientX - startX;
        const my = e.clientY - startY;

        if (mx >= 0 && mx < this.gridSize * this.tileSize &&
            my >= 0 && my < this.gridSize * this.tileSize) {

            const tx = Math.floor(mx / this.tileSize);
            const ty = Math.floor(my / this.tileSize);
            const idx = ty * this.gridSize + tx;

            this.tryMove(idx);
            this.checkWin();
        }
    }

    tryMove(idx: number) {
        const emptyIdx = this.tiles.indexOf(8);
        const neighbors = this.getNeighbors(emptyIdx);
        if (neighbors.includes(idx)) {
            this.swap(idx, emptyIdx);
        }
    }

    swap(i: number, j: number) {
        const temp = this.tiles[i];
        this.tiles[i] = this.tiles[j];
        this.tiles[j] = temp;
    }

    checkWin() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] !== i) return;
        }
        this.solved = true;
    }

    update(_deltaTime: number): void { }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const cx = ctx.canvas.width / 2;
        const cy = ctx.canvas.height / 2;
        const startX = cx - (this.gridSize * this.tileSize) / 2;
        const startY = cy - (this.gridSize * this.tileSize) / 2;

        ctx.font = 'bold 30px "Fredoka One"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText("Picture Puzzle", cx, 50);

        if (this.solved) {
            ctx.fillText("SOLVED! Click to Shuffle", cx, cy + 200);
        }

        // Draw Tiles
        for (let i = 0; i < this.tiles.length; i++) {
            const val = this.tiles[i];
            if (val === 8 && !this.solved) continue; // Skip empty tile

            const tx = i % this.gridSize;
            const ty = Math.floor(i / this.gridSize);

            const dx = startX + tx * this.tileSize;
            const dy = startY + ty * this.tileSize;

            // Tile BG
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(dx + 2, dy + 2, this.tileSize - 4, this.tileSize - 4);

            // Number/Image Placeholer
            ctx.fillStyle = '#2c3e50';
            ctx.fillText((val + 1).toString(), dx + this.tileSize / 2, dy + this.tileSize / 2 + 10);

            // Or draw part of an image
            // ctx.drawImage(image, val%3 * w, floor(val/3)*h, w, h, dx, dy, w, h);
        }

        // Back UI (Top Right)
        ctx.font = '20px "Nunito"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(ctx.canvas.width - 100, 20, 80, 40);
        ctx.fillStyle = 'white';
        ctx.fillText("Back", ctx.canvas.width - 60, 45);
    }

    onResize(_width: number, _height: number): void { }

    cleanup(): void {
        window.removeEventListener('click', this.handleClick.bind(this));
    }
}
