import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';

interface Point {
    x: number;
    y: number;
}

export class ColoringScene implements Scene {
    private sceneManager: SceneManager;
    private isDrawing: boolean = false;
    private points: Point[] = [];
    private paths: { points: Point[], color: string, width: number }[] = [];

    // Tools
    private currentColor: string = "#ff0000";
    private currentWidth: number = 20;
    private colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#a52a2a", "#ffffff"];

    private buttons: { color?: string, text?: string, x: number, y: number, width: number, height: number, action: () => void }[] = [];

    // Images
    private images: HTMLImageElement[] = [];
    private loaded: boolean = false;

    private currentImage: number = 0; // 0: Horse, 1: Demon Hunter (Stub)

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.loadImages();
    }

    loadImages() {
        // Use importing if possible, but for array loading we might need dynamic imports or static list
        // For now relying on Vite processing assets in src/assets if referenced correctly
        // But since we are using new Image(), we need the resolved path.
        // Let's assume they are handled by a bundler or we use the ES import method elsewhere.
        // Actually, let's use the explicit imports at the top if we could, but for a list:
        const paths = [
            new URL('../../assets/coloring_page_1.png', import.meta.url).href,
            new URL('../../assets/coloring_page_2.png', import.meta.url).href,
            new URL('../../assets/coloring_page_3.png', import.meta.url).href
        ];

        let loadedCount = 0;

        paths.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === paths.length) this.loaded = true;
            }
            this.images.push(img);
        });
    }

    init(): void {
        this.createUI();
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        window.addEventListener('touchstart', this.onTouchStart, { passive: false });
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd);
    }

    createUI() {
        this.buttons = [];

        // Color Palette
        let x = 50;
        this.colors.forEach(color => {
            this.buttons.push({
                color: color,
                x: x,
                y: window.innerHeight - 80,
                width: 50,
                height: 50,
                action: () => {
                    this.currentColor = color;
                    this.currentWidth = (color === "#ffffff") ? 40 : 20;
                }
            });
            x += 60;
        });

        // Next Image
        this.buttons.push({
            text: "Next Pic >",
            x: window.innerWidth - 300,
            y: window.innerHeight - 80,
            width: 120,
            height: 50,
            action: () => {
                this.currentImage = (this.currentImage + 1) % this.images.length;
                this.paths = []; // Clear drawing for new image
            }
        });

        // Save
        this.buttons.push({
            text: "Save Art",
            x: window.innerWidth - 150,
            y: window.innerHeight - 80,
            width: 120,
            height: 50,
            action: () => {
                alert("Masterpiece Saved!");
            }
        });

        // Back Button (Top Right)
        this.buttons.push({
            text: "Back",
            x: window.innerWidth - 100,
            y: 20,
            width: 80,
            height: 40,
            action: () => {
                this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
            }
        });
    }

    private onMouseDown = (e: MouseEvent) => {
        if (this.checkUI(e.clientX, e.clientY)) return;
        this.isDrawing = true;
        this.points = [{ x: e.clientX, y: e.clientY }];
    }

    private onMouseMove = (e: MouseEvent) => {
        if (!this.isDrawing) return;
        this.points.push({ x: e.clientX, y: e.clientY });
    }

    private onMouseUp = (_e: MouseEvent) => {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.savePath();
        }
    }

    // Touch Support
    private onTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (this.checkUI(touch.clientX, touch.clientY)) return;
        e.preventDefault();
        this.isDrawing = true;
        this.points = [{ x: touch.clientX, y: touch.clientY }];
    }

    private onTouchMove = (e: TouchEvent) => {
        if (!this.isDrawing) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.points.push({ x: touch.clientX, y: touch.clientY });
    }

    private onTouchEnd = (_e: TouchEvent) => {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.savePath();
        }
    }

    private checkUI(x: number, y: number): boolean {
        for (const btn of this.buttons) {
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {
                btn.action();
                return true;
            }
        }
        return false;
    }

    private savePath() {
        if (this.points.length > 0) {
            this.paths.push({
                points: [...this.points],
                color: this.currentColor,
                width: this.currentWidth
            });
            this.points = [];
        }
    }

    update(_deltaTime: number): void { }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // 1. Draw User Colors (Underlay)
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        this.paths.forEach(path => {
            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.width;
            if (path.points.length > 0) {
                ctx.moveTo(path.points[0].x, path.points[0].y);
                for (let i = 1; i < path.points.length; i++) {
                    ctx.lineTo(path.points[i].x, path.points[i].y);
                }
            }
            ctx.stroke();
        });

        // Current Stroke
        if (this.isDrawing && this.points.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = this.currentColor;
            ctx.lineWidth = this.currentWidth;
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.stroke();
        }

        // 2. Draw Image Overlay (Multiply for coloring effect)
        if (this.loaded && this.images[this.currentImage]) {
            ctx.globalCompositeOperation = 'multiply';
            const img = this.images[this.currentImage];

            // Center and fit
            const scale = Math.min((ctx.canvas.width - 50) / img.width, (ctx.canvas.height - 150) / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (ctx.canvas.width - w) / 2;
            const y = (ctx.canvas.height - h) / 2 - 20;

            ctx.drawImage(img, x, y, w, h);
            ctx.globalCompositeOperation = 'source-over';
        }

        // UI
        this.drawUI(ctx);
    }

    onResize(_width: number, _height: number): void {
        this.createUI();
    }

    private drawUI(ctx: CanvasRenderingContext2D) {
        ctx.font = 'bold 16px "Nunito"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const btn of this.buttons) {
            ctx.fillStyle = btn.color || '#ccc';
            if (btn.color === this.currentColor) {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = 'transparent';
            }

            ctx.beginPath();
            ctx.rect(btn.x, btn.y, btn.width, btn.height);
            ctx.fill();
            if (btn.color === this.currentColor) ctx.stroke();

            if (btn.text) {
                ctx.fillStyle = 'black';
                ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
            }
        }

        ctx.fillStyle = "#333";
        ctx.font = "30px 'Fredoka One'";
        ctx.fillText("Coloring Book", ctx.canvas.width / 2, 50);
    }

    cleanup(): void {
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
    }
}
