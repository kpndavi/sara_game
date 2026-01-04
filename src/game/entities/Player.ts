import { Entity } from './Entity';
import { InputHandler } from '../InputHandler';
import confetti from 'canvas-confetti';

export class Player extends Entity {
    vy: number = 0;
    gravity: number = 0.8;
    jumpForce: number = -15;
    groundY: number;
    isGrounded: boolean = true;
    canDoubleJump: boolean = true;

    constructor(x: number, y: number) {
        super(x, y, 50, 50, '#ff9a9e'); // Pink color
        this.groundY = y;
    }

    updatePlayer(input: InputHandler, _deltaTime: number) {
        if (input.jump) {
            if (this.isGrounded) {
                this.vy = this.jumpForce;
                this.isGrounded = false;
                this.canDoubleJump = true;
                input.jump = false; // Consume jump
            } else if (this.canDoubleJump) {
                this.vy = this.jumpForce * 0.8;
                this.canDoubleJump = false;
                input.jump = false;
                // Puff of confetti for double jump
                confetti({
                    particleCount: 15,
                    spread: 50,
                    origin: { x: this.x / window.innerWidth, y: this.y / window.innerHeight },
                    colors: ['#ffffff', '#ff9a9e']
                });
            }
        }

        // Apply gravity
        this.vy += this.gravity;
        this.y += this.vy;

        // Ground collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.vy = 0;
            this.isGrounded = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        super.draw(ctx);
        // Draw Cute Face
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 5, 0, Math.PI * 2); // Left Eye
        ctx.arc(this.x + 35, this.y + 15, 5, 0, Math.PI * 2); // Right Eye
        ctx.fill();

        // Smile
        ctx.beginPath();
        ctx.arc(this.x + 25, this.y + 25, 10, 0, Math.PI, false);
        ctx.stroke();
    }
}
