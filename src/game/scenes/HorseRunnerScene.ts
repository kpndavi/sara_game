import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';

export class HorseRunnerScene implements Scene {
    private sceneManager: SceneManager;

    // Game State
    private isRunning: boolean = false;
    private score: number = 0;
    private speed: number = 6;
    private gameTime: number = 0;
    private highScore: number = 0;

    // Physics
    private horseY: number = 0;
    private velocityY: number = 0;
    private gravity: number = 0.6;
    private jumpForce: number = -13;
    private isGrounded: boolean = true;
    private groundY: number = 0;

    // Entities
    private obstacles: { x: number, y: number, width: number, height: number, type: 'rock' | 'bush' }[] = [];
    private clouds: { x: number, y: number, size: number, speed: number }[] = [];
    private mountains: { x: number, height: number }[] = [];
    private spawnTimer: number = 0;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.highScore = Number(localStorage.getItem('sara_runner_highscore')) || 0;
    }

    init(): void {
        this.onResize(window.innerWidth, window.innerHeight);
        this.resetGame();
        this.initBackground();

        window.addEventListener('keydown', this.handleInput);
        window.addEventListener('mousedown', this.handleJump);
        window.addEventListener('touchstart', this.handleJump, { passive: false });
    }

    initBackground() {
        // Generate clouds
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * (window.innerHeight / 2),
                size: 30 + Math.random() * 40,
                speed: 0.5 + Math.random() * 0.5
            });
        }
        // Generate mountains
        let x = 0;
        while (x < window.innerWidth + 200) {
            this.mountains.push({ x: x, height: 100 + Math.random() * 150 });
            x += 80 + Math.random() * 100;
        }
    }

    resetGame() {
        this.isRunning = true;
        this.score = 0;
        this.speed = 7;
        this.horseY = this.groundY;
        this.velocityY = 0;
        this.obstacles = [];
        this.gameTime = 0;
    }

    handleInput = (e: KeyboardEvent) => {
        if ((e.code === 'Space' || e.key === 'ArrowUp') && this.isRunning) {
            this.handleJump();
        } else if (!this.isRunning && this.gameTime > 10) {
            this.resetGame();
        }
    }

    handleJump = (e?: MouseEvent | TouchEvent) => {
        // Safe check if called without event (e.g. keyboard)
        if (e) {
            let clientX, clientY;
            if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }

            // Back Button Area
            if (clientX > window.innerWidth - 100 && clientY < 80) {
                this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
                return;
            }
            if (e.type === 'touchstart') e.preventDefault();
        }

        // Jump Logic
        if (this.isRunning && this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
        } else if (!this.isRunning && this.gameTime > 10) {
            this.resetGame();
        }
    }

    // Deprecated, handled in handleJump
    handleTouch = (e: TouchEvent) => { this.handleJump(e); }
    handleClick = (e: MouseEvent) => { this.handleJump(e); }

    update(_deltaTime: number): void {
        this.gameTime++;

        // Clouds always move
        this.clouds.forEach(c => {
            c.x -= c.speed;
            if (c.x < -100) c.x = window.innerWidth + 100;
        });

        if (!this.isRunning) return;

        this.score++;
        this.speed += 0.0015;

        // Save High Score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('sara_runner_highscore', this.highScore.toString());
        }

        // Physics
        this.velocityY += this.gravity;
        this.horseY += this.velocityY;

        if (this.horseY >= this.groundY) {
            this.horseY = this.groundY;
            this.velocityY = 0;
            this.isGrounded = true;
        }

        // Parallax Mountains
        this.mountains.forEach(m => {
            m.x -= this.speed * 0.2; // Move slower than foreground
            if (m.x < -200) m.x += window.innerWidth + 400;
        });

        // Spawn Obstacles
        this.spawnTimer++;
        if (this.spawnTimer > 90 + Math.random() * 50) { // Slightly faster spawn
            const type = Math.random() > 0.5 ? 'rock' : 'bush';
            this.obstacles.push({
                x: window.innerWidth,
                y: this.groundY + 10,
                width: 50,
                height: 50,
                type: type
            });
            this.spawnTimer = 0;
        }

        // Move Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.x -= this.speed;

            if (obs.x < -100) this.obstacles.splice(i, 1);

            // Collision (Refined Hitbox)
            // Horse is roughly at x=100. Width ~60, Height ~50 (visual)
            if (
                100 + 50 > obs.x + 10 &&    // Horse Right > Obs Left
                100 + 10 < obs.x + obs.width - 10 && // Horse Left < Obs Right
                this.horseY + 50 > obs.y + 10 // Horse Bottom > Obs Top
            ) {
                this.isRunning = false;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Sky Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw Mountains (Parallax)
        ctx.fillStyle = '#6c5ce7';
        ctx.beginPath();
        this.mountains.forEach(m => {
            ctx.moveTo(m.x, h - 80); // Ground level for mountains
            ctx.lineTo(m.x + 100, h - 80 - m.height);
            ctx.lineTo(m.x + 200, h - 80);
        });
        ctx.fill();

        // Draw Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(c => {
            this.drawCloud(ctx, c.x, c.y, c.size);
        });

        // Ground
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, this.groundY + 40, w, h - (this.groundY + 40));
        // Grass detailing
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, this.groundY + 40, w, 10);

        // Draw Player (Procedural Horse) in game loop
        // Animate legs logic: Simple toggling based on gameTime if running
        const legFrame = (this.isRunning && this.isGrounded) ? Math.floor(this.gameTime / 5) % 2 : 2; // 2=Jump
        this.drawHorse(ctx, 100, this.horseY, legFrame);

        // Draw Obstacles
        this.obstacles.forEach(obs => {
            if (obs.type === 'rock') this.drawRock(ctx, obs.x, obs.y);
            else this.drawBush(ctx, obs.x, obs.y);
        });

        // UI
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px "Fredoka One"';
        ctx.textAlign = 'left';
        ctx.lineWidth = 3;
        ctx.strokeText(`Score: ${Math.floor(this.score / 10)}`, 20, 50);
        ctx.fillText(`Score: ${Math.floor(this.score / 10)}`, 20, 50);

        ctx.font = '20px "Nunito"';
        ctx.fillText(`High: ${Math.floor(this.highScore / 10)}`, 20, 80);

        if (!this.isRunning) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = 'bold 40px "Fredoka One"';
            ctx.fillText("GAME OVER", w / 2, h / 2 - 20);
            ctx.font = '24px "Nunito"';
            ctx.fillText("Tap to Run Again", w / 2, h / 2 + 30);
        }

        // Back Button
        this.drawBackButton(ctx);
    }

    // --- Procedural Drawing Helpers ---

    private drawBackButton(ctx: CanvasRenderingContext2D) {
        const w = ctx.canvas.width;
        ctx.fillStyle = '#95a5a6';
        this.roundRect(ctx, w - 110, 20, 90, 40, 10);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px "Nunito"';
        ctx.textAlign = 'center';
        ctx.fillText("Back", w - 65, 47);
    }

    private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.8, y + size * 0.2, size * 0.7, 0, Math.PI * 2);
        ctx.arc(x - size * 0.8, y + size * 0.2, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawHorse(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
        ctx.save();
        ctx.translate(x, y);
        const scale = 0.8;
        ctx.scale(scale, scale);

        // Body
        ctx.fillStyle = '#e67e22'; // Brown/Orange
        ctx.beginPath();
        ctx.ellipse(30, 30, 25, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head/Neck
        ctx.beginPath();
        ctx.moveTo(45, 25);
        ctx.lineTo(65, 5); // Neck up
        ctx.lineTo(75, 15); // Nose
        ctx.lineTo(65, 30);
        ctx.fill();

        // Mane
        ctx.fillStyle = '#d35400';
        ctx.beginPath();
        ctx.moveTo(50, 15);
        ctx.lineTo(60, 0);
        ctx.lineTo(65, 15);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (frame === 0) { // Run 1
            ctx.moveTo(20, 40); ctx.lineTo(10, 60); // Back L
            ctx.moveTo(50, 40); ctx.lineTo(60, 60); // Front R
        } else if (frame === 1) { // Run 2
            ctx.moveTo(20, 40); ctx.lineTo(30, 60); // Back R
            ctx.moveTo(50, 40); ctx.lineTo(40, 60); // Front L
        } else { // Jump
            ctx.moveTo(20, 40); ctx.lineTo(5, 50); // Back tuck
            ctx.moveTo(50, 40); ctx.lineTo(70, 45); // Front reach
        }
        ctx.stroke();

        // Tail
        ctx.strokeStyle = '#d35400';
        ctx.beginPath(); ctx.moveTo(5, 30); ctx.quadraticCurveTo(-10, 20, -15, 40); ctx.stroke();

        ctx.restore();
    }

    private drawRock(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.moveTo(x, y + 40);
        ctx.lineTo(x + 10, y + 10);
        ctx.lineTo(x + 30, y + 0);
        ctx.lineTo(x + 50, y + 40);
        ctx.closePath();
        ctx.fill();
        // Shine
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath(); ctx.moveTo(x + 10, y + 15); ctx.lineTo(x + 15, y + 15); ctx.lineTo(x + 12, y + 30); ctx.fill();
    }

    private drawBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(x + 15, y + 30, 15, 0, Math.PI * 2);
        ctx.arc(x + 35, y + 30, 15, 0, Math.PI * 2);
        ctx.arc(x + 25, y + 15, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
        else ctx.rect(x, y, w, h);
        ctx.fill();
    }

    onResize(_width: number, height: number): void {
        this.groundY = height - 120;
    }

    cleanup(): void {
        window.removeEventListener('keydown', this.handleInput);
        window.removeEventListener('mousedown', this.handleJump);
        window.removeEventListener('touchstart', this.handleJump);
    }
}
