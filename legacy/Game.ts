import { Player } from './entities/Player';
import { Obstacle, ObstacleType } from './entities/Obstacle';
import { InputHandler } from './InputHandler';
import confetti from 'canvas-confetti';

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number = 0;
    height: number = 0;

    player: Player;
    input: InputHandler;
    obstacles: Obstacle[] = [];

    score: number = 0;
    cheer: number = 3;
    gameSpeed: number = 5;
    gameActive: boolean = false;

    obstacleTimer: number = 0;
    obstacleInterval: number = 1500; // ms

    lastTime: number = 0;

    // UI Elements
    uiScore: HTMLElement | null;
    uiHealth: HTMLElement | null;
    startScreen: HTMLElement | null;
    gameOverScreen: HTMLElement | null;
    finalScore: HTMLElement | null;
    hud: HTMLElement | null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.width = canvas.width;
        this.height = canvas.height;

        // Initial Player Position
        this.player = new Player(100, this.height - 150);
        this.input = new InputHandler();

        // Bind UI
        this.uiScore = document.getElementById('score');
        this.uiHealth = document.getElementById('health');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScore = document.getElementById('final-score');
        this.hud = document.getElementById('hud');

        // Bind Buttons
        document.getElementById('start-btn')?.addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.startGame());

        // Bind Resize
        window.addEventListener('resize', () => {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.player.groundY = this.height - 150;
            if (this.player.isGrounded) this.player.y = this.player.groundY;
        });
    }

    init() {
        this.drawBackground(); // stationary background for menu
    }

    startGame() {
        this.score = 0;
        this.cheer = 3;
        this.gameSpeed = 5;
        this.obstacles = [];
        this.gameActive = true;
        this.lastTime = 0;
        this.player.y = this.player.groundY;
        this.player.vy = 0;

        this.startScreen?.classList.add('hidden');
        this.gameOverScreen?.classList.add('hidden');
        this.hud?.classList.remove('hidden');

        this.updateUI();
        requestAnimationFrame((ts) => this.loop(ts));
    }

    loop(timestamp: number) {
        if (!this.gameActive) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawBackground();

        // Spawner
        if (this.obstacleTimer > this.obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
            // Decrease interval slightly to make it harder
            if (this.obstacleInterval > 500) this.obstacleInterval -= 10;
            // Increase speed slightly
            if (this.gameSpeed < 15) this.gameSpeed += 0.05;
        } else {
            this.obstacleTimer += deltaTime || 16;
        }

        // Player
        this.player.updatePlayer(this.input, deltaTime || 16);
        this.player.draw(this.ctx);

        // Obstacles
        this.obstacles.forEach(obs => {
            obs.update(deltaTime || 16, this.gameSpeed);
            obs.draw(this.ctx);

            // Collision
            if (this.checkCollision(this.player, obs)) {
                obs.markedForDeletion = true;
                this.handleCollision(obs);
            }
        });

        this.obstacles = this.obstacles.filter(obs => !obs.markedForDeletion);

        // Ground
        this.drawGround();

        requestAnimationFrame((ts) => this.loop(ts));
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
            // Flash effect or shake could go here
        }
        this.updateUI();

        if (this.cheer <= 0) {
            this.gameOver();
        }
    }

    updateUI() {
        if (this.uiScore) this.uiScore.innerText = this.score.toString();
        if (this.uiHealth) this.uiHealth.innerText = '❤️'.repeat(this.cheer);
    }

    gameOver() {
        this.gameActive = false;
        this.hud?.classList.add('hidden');
        this.gameOverScreen?.classList.remove('hidden');
        if (this.finalScore) this.finalScore.innerText = this.score.toString();
    }

    triggerConfetti(x: number, y: number) {
        confetti({
            particleCount: 30,
            spread: 60,
            origin: { x: x / window.innerWidth, y: y / window.innerHeight }
        });
    }

    drawBackground() {
        // Simple gradient sky is handled by CSS, here maybe draw some distant clouds or mountains
    }

    drawGround() {
        this.ctx.fillStyle = '#8dc63f'; // Grass Green
        this.ctx.fillRect(0, this.player.groundY + 50, this.width, this.height - (this.player.groundY + 50));

        // Stripe for speed effect
        this.ctx.fillStyle = '#7db530';
        this.ctx.fillRect(0, this.player.groundY + 50, this.width, 10);
    }
}
