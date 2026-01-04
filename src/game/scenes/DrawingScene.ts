import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';

interface Point {
    x: number;
    y: number;
}

export class DrawingScene implements Scene {
    private sceneManager: SceneManager;
    private isDrawing: boolean = false;
    private points: Point[] = [];
    private paths: { points: Point[], color: string, width: number }[] = [];

    // Tools
    private currentColor: string = "#000000";
    private currentWidth: number = 5;
    private colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF"];

    // UI Local State
    private buttons: { text?: string, color?: string, x: number, y: number, width: number, height: number, action: () => void }[] = [];


    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    init(): void {
        this.createUI();

        // We need to attach listeners to the CANVAS specifically to handle coordinates correctly,
        // but SceneManager handles the loop. We can attach to window for global mouse, 
        // or canvas if we had access. SceneManager passed canvas in constructor? No.
        // But we can attach to window and check coordinates.
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        window.addEventListener('touchstart', this.onTouchStart, { passive: false });
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd);
    }

    createUI() {
        this.buttons = [];



        // Color Palette (Left)
        let y = 100;
        this.colors.forEach(color => {
            this.buttons.push({
                color: color,
                x: 20,
                y: y,
                width: 40,
                height: 40,
                action: () => {
                    this.currentColor = color;
                    this.currentWidth = (color === "#FFFFFF") ? 20 : 5; // Eraser logic
                }
            });
            y += 50;
        });

        // Clear Button
        this.buttons.push({
            text: "Clear",
            x: 20,
            y: y + 20,
            width: 60,
            height: 40,
            action: () => {
                this.paths = [];
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
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // White Paper

        // Drawn Paths
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

        // UI
        this.drawUI(ctx);
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

        // Title
        ctx.fillStyle = "#ccc";
        ctx.font = '20px "Fredoka One"';
        ctx.fillText("Creative Studio", ctx.canvas.width / 2, 30);
    }

    onResize(_width: number, _height: number): void {
        this.createUI();
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
