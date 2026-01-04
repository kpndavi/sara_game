import { Scene } from './Scene';

export class SceneManager {
    private currentScene: Scene | null = null;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get 2D context");
        this.ctx = context;

        // Bind loop
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        // Handle Resize
        window.addEventListener('resize', () => {
            this.resize();
        });
        this.resize();
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public switchScene(newScene: Scene) {
        console.log(`DEBUG: SwitchScene: ${newScene.constructor.name}`);
        if (this.currentScene) {
            this.currentScene.cleanup();
        }
        this.currentScene = newScene;
        this.currentScene.init();
        this.currentScene.onResize(this.canvas.width, this.canvas.height);
    }

    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.currentScene) {
            this.currentScene.onResize(this.canvas.width, this.canvas.height);
        }
    }

    private loop(timestamp: number) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentScene) {
            this.currentScene.update(deltaTime);
            this.currentScene.draw(this.ctx);
        }

        requestAnimationFrame(this.loop);
    }
}
