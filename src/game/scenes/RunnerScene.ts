import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { Player } from '../entities/Player';
import { Obstacle, ObstacleType } from '../entities/Obstacle';
import { InputHandler } from '../InputHandler';
import confetti from 'canvas-confetti';
import { MainMenuScene } from './MainMenuScene';

export class RunnerScene implements Scene {
    private sceneManager: SceneManager;
    private width: number = 0;
    private height: number = 0;

    private player: Player;
    private input: InputHandler;
    private obstacles: Obstacle[] = [];

    private score: number = 0;
    private cheer: number = 3;
    private gameSpeed: number = 5;
    private gameActive: boolean = false;

    private obstacleTimer: number = 0;
    private obstacleInterval: number = 1500; // ms

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Initial Player Position
        this.player = new Player(100, this.height - 150);
        this.input = new InputHandler();
    }

    init(): void {
        this.startGame();
    }

    startGame() {
        this.score = 0;
        this.cheer = 3;
        this.gameSpeed = 5;
        this.obstacles = [];
        this.gameActive = true;
        this.player.groundY = this.height - 150;
        this.player.y = this.player.groundY;
        this.player.vy = 0;
    }

    spawnObstacle() {
        const typeRand = Math.random();
        let type: ObstacleType = 'COLLECTIBLE';

        if (typeRand < 0.3) type = 'FRIEND'; // 30% chance Friend
        else if (typeRand < 0.6) type = 'HAZARD'; // 30% chance Hazard
        else type = 'COLLECTIBLE'; // 40% chance Collectible

        // Ensure hazards are on ground
        let y = this.player.groundY;

        // Floating collectibles
        if (type === 'COLLECTIBLE' && Math.random() > 0.5) {
            y -= 100; // Floating
        }

        // Adjustment for obstacle height
        if (type === 'FRIEND') y -= 10; // Tall
        if (type === 'HAZARD') y += 20; // Short

        this.obstacles.push(new Obstacle(this.width + 100, y, type));
    }

    update(deltaTime: number): void {
        if (!this.gameActive) return;

        // Spawner
        if (this.obstacleTimer > this.obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
            // Decrease interval slightly to make it harder
            if (this.obstacleInterval > 500) this.obstacleInterval -= 10;
            if (this.gameSpeed < 10) this.gameSpeed += 0.02; // Slower max speed
        } else {
            this.obstacleTimer += deltaTime;
        }

        // Levels
        if (Math.floor(this.score / 500) > Math.floor((this.score - 1) / 500)) {
            // Level Up effect could go here
        }

        // Player
        this.player.updatePlayer(this.input, deltaTime);


        // Obstacles
        this.obstacles.forEach(obs => {
            obs.update(deltaTime, this.gameSpeed);

            // Collision
            if (this.checkCollision(this.player, obs)) {
                obs.markedForDeletion = true;
                this.handleCollision(obs);
            }
        });

        this.obstacles = this.obstacles.filter(obs => !obs.markedForDeletion);
    }

    checkCollision(rect1: Player, rect2: Obstacle): boolean {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    handleCollision(obs: Obstacle) {
        if (obs.type === 'FRIEND') {
            this.score += 5;
            this.triggerConfetti(obs.x, obs.y);
        } else if (obs.type === 'COLLECTIBLE') {
            this.score += 1;
        } else if (obs.type === 'HAZARD') {
            this.cheer -= 1;
        }

        if (this.cheer <= 0) {
            this.gameOver();
        }
    }

    triggerConfetti(x: number, y: number) {
        confetti({
            particleCount: 30,
            spread: 60,
            origin: { x: x / window.innerWidth, y: y / window.innerHeight }
        });
    }

    gameOver() {
        this.gameActive = false;
        setTimeout(() => {
            alert(`Game Over! Score: ${this.score}`);
            this.sceneManager.switchScene(new MainMenuScene(this.sceneManager));
        }, 100);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, this.width, this.height);
        this.drawBackground(ctx);
        this.drawGround(ctx);

        // Player
        this.player.draw(ctx);

        // Obstacles
        this.obstacles.forEach(obs => {
            obs.draw(ctx);
        });

        // HUD
        this.drawHUD(ctx);
    }

    drawBackground(_ctx: CanvasRenderingContext2D) {
        // Handled by CSS gradient mostly, or add details
    }

    drawGround(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#8dc63f'; // Grass Green
        ctx.fillRect(0, this.player.groundY + 50, this.width, this.height - (this.player.groundY + 50));

        // Stripe for speed effect
        ctx.fillStyle = '#7db530';
        ctx.fillRect(0, this.player.groundY + 50, this.width, 10);
    }

    drawHUD(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "black";
        ctx.font = "24px 'Nunito'";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        ctx.fillText(`Level: ${Math.floor(this.score / 500) + 1}`, 20, 70);
        ctx.fillText(`Health: ${'❤️'.repeat(this.cheer)}`, 20, 100);
    }

    onResize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.player.groundY = this.height - 150;
        if (this.player.isGrounded) this.player.y = this.player.groundY;
    }

    cleanup(): void {
        // Input handler cleanup handles listener removal?
        // Actually InputHandler attaches to window in constructor, 
        // we might need to detach or reuse content.
        // For now, let's just let it be (minor leak if frequent switching, but InputHandler logic needs review).
    }
}
