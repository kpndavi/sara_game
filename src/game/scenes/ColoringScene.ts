import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';

export class ColoringScene implements Scene {
    private sceneManager: SceneManager;
    private bufferCanvas: HTMLCanvasElement;
    private bufferCtx: CanvasRenderingContext2D;

    // Tools
    private currentColor: { r: number, g: number, b: number } = { r: 255, g: 0, b: 0 }; // Default Red
    private colors = [
        { hex: "#ff0000", rgb: { r: 255, g: 0, b: 0 } },
        { hex: "#00ff00", rgb: { r: 0, g: 255, b: 0 } },
        { hex: "#0000ff", rgb: { r: 0, g: 0, b: 255 } },
        { hex: "#ffff00", rgb: { r: 255, g: 255, b: 0 } },
        { hex: "#ff00ff", rgb: { r: 255, g: 0, b: 255 } },
        { hex: "#00ffff", rgb: { r: 0, g: 255, b: 255 } },
        { hex: "#ffa500", rgb: { r: 255, g: 165, b: 0 } },
        { hex: "#a52a2a", rgb: { r: 165, g: 42, b: 42 } },
        { hex: "#ffffff", rgb: { r: 255, g: 255, b: 255 } }
    ];

    private buttons: { color?: string, text?: string, x: number, y: number, width: number, height: number, action: () => void }[] = [];

    // Images
    private images: HTMLImageElement[] = [];
    private loaded: boolean = false;
    private currentImageIndex: number = 0;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        // Create Offscreen Buffer
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = window.innerWidth;
        this.bufferCanvas.height = window.innerHeight;
        const ctx = this.bufferCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error("Could not create buffer context");
        this.bufferCtx = ctx;

        this.loadImages();
    }

    loadImages() {
        const paths = [
            new URL('../../assets/coloring_page_1.png', import.meta.url).href,
            new URL('../../assets/coloring_page_2.png', import.meta.url).href,
            new URL('../../assets/coloring_page_3.png', import.meta.url).href,
            new URL('../../assets/coloring_page_castle.png', import.meta.url).href,
            new URL('../../assets/coloring_page_dragon.png', import.meta.url).href,
            new URL('../../assets/coloring_page_unicorn.png', import.meta.url).href,
            new URL('../../assets/coloring_page_mermaid.png', import.meta.url).href,
            new URL('../../assets/coloring_page_fairy_house.png', import.meta.url).href,
            new URL('../../assets/coloring_page_princess.png', import.meta.url).href,
            new URL('../../assets/coloring_page_kitten.png', import.meta.url).href,
            new URL('../../assets/coloring_page_puppy.png', import.meta.url).href,
            new URL('../../assets/coloring_page_butterfly.png', import.meta.url).href,
            new URL('../../assets/coloring_page_dolphin.png', import.meta.url).href,
            new URL('../../assets/coloring_page_owl.png', import.meta.url).href,
            new URL('../../assets/coloring_page_cupcake.png', import.meta.url).href
        ];

        let loadedCount = 0;
        paths.forEach(src => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Crucial for pixel manipulation if served externally, usually fine locally
            img.src = src;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === paths.length) {
                    this.loaded = true;
                    this.resetImage();
                }
            }
            this.images.push(img);
        });
    }

    resetImage() {
        if (!this.loaded || !this.images[this.currentImageIndex]) return;

        // Clear buffer
        this.bufferCtx.fillStyle = '#ffffff';
        this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

        // Draw Image Scaled and Centered
        const img = this.images[this.currentImageIndex];
        const maxWidth = this.bufferCanvas.width - 50;
        const maxHeight = this.bufferCanvas.height - 150;

        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (this.bufferCanvas.width - w) / 2;
        const y = (this.bufferCanvas.height - h) / 2 - 20;

        this.bufferCtx.drawImage(img, x, y, w, h);
    }

    init(): void {
        console.log("DEBUG: ColoringScene Init (Flood Fill)");
        this.createUI();
        this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput);
    }

    createUI() {
        this.buttons = [];

        // Color Palette
        let x = 50;
        this.colors.forEach(colorObj => {
            this.buttons.push({
                color: colorObj.hex,
                x: x,
                y: window.innerHeight - 80,
                width: 50,
                height: 50,
                action: () => {
                    this.currentColor = colorObj.rgb;
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
                this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
                this.resetImage();
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
                // To save, we'd export bufferCanvas
                const link = document.createElement('a');
                link.download = 'sara_masterpiece.png';
                link.href = this.bufferCanvas.toDataURL();
                link.click();
            }
        });

        // Back Button
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

    handleInput = (event: PointerEvent) => {
        const canvas = this.sceneManager.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const clickX = Math.floor(event.clientX - rect.left);
        const clickY = Math.floor(event.clientY - rect.top);

        // Check UI first
        for (const btn of this.buttons) {
            if (clickX >= btn.x && clickX <= btn.x + btn.width &&
                clickY >= btn.y && clickY <= btn.y + btn.height) {
                btn.action();
                return;
            }
        }

        // Flood Fill
        this.floodFill(clickX, clickY, this.currentColor);
    }

    // Stack-based Flood Fill
    floodFill(startX: number, startY: number, fillColor: { r: number, g: number, b: number }) {
        const width = this.bufferCanvas.width;
        const height = this.bufferCanvas.height;
        const imageData = this.bufferCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Helper to get color at index
        const getPixelColor = (index: number) => ({
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
        });

        // Helper to match colors (tolerance for compression artifacts)
        const colorsMatch = (c1: any, c2: any) => {
            const tolerance = 50;
            return Math.abs(c1.r - c2.r) < tolerance &&
                Math.abs(c1.g - c2.g) < tolerance &&
                Math.abs(c1.b - c2.b) < tolerance;
        };

        const startIdx = (startY * width + startX) * 4;
        const targetColor = getPixelColor(startIdx);

        // Don't fill if same color or if target is black (borders)
        if (colorsMatch(targetColor, fillColor)) return;
        if (targetColor.r < 50 && targetColor.g < 50 && targetColor.b < 50) return; // Verify it's not a black line

        const stack = [[startX, startY]];

        while (stack.length) {
            const [x, y] = stack.pop()!;
            const pixelPos = (y * width + x) * 4;

            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const currColor = getPixelColor(pixelPos);
            if (!colorsMatch(currColor, targetColor)) continue;

            // Color Pixel
            data[pixelPos] = fillColor.r;
            data[pixelPos + 1] = fillColor.g;
            data[pixelPos + 2] = fillColor.b;
            data[pixelPos + 3] = 255; // Alpha full

            // Add neighbors
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }

        this.bufferCtx.putImageData(imageData, 0, 0);
    }

    update(_deltaTime: number): void { }

    draw(ctx: CanvasRenderingContext2D): void {
        // Draw the buffer (Artwork)
        ctx.drawImage(this.bufferCanvas, 0, 0);

        // Draw UI
        this.drawUI(ctx);
    }

    private drawUI(ctx: CanvasRenderingContext2D) {
        ctx.font = 'bold 16px "Nunito"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const btn of this.buttons) {
            // Draw highlight if selected color
            const isSelected = btn.color === this.rgbToHex(this.currentColor);

            ctx.fillStyle = btn.color || '#ccc';
            if (isSelected) {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                ctx.lineWidth = 1;
            }

            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 10);
            else ctx.rect(btn.x, btn.y, btn.width, btn.height);
            ctx.fill();
            ctx.stroke();

            if (btn.text) {
                ctx.fillStyle = 'black';
                ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
            }
        }

        ctx.fillStyle = "#333";
        ctx.font = "30px 'Fredoka One'";
        ctx.textAlign = 'center';
        ctx.fillText("Magic Coloring", ctx.canvas.width / 2, 50);
    }

    private rgbToHex(rgb: { r: number, g: number, b: number }): string {
        return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
    }

    onResize(width: number, height: number): void {
        // Simple resize: Resize buffer and redraw current image (loses progress, but simpler for now)
        this.bufferCanvas.width = width;
        this.bufferCanvas.height = height;
        this.resetImage();
        this.createUI();
    }

    cleanup(): void {
        this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput);
    }
}
