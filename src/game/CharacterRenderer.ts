import { CharacterAppearance } from './GameState';

export class CharacterRenderer {
    static init() { }

    static drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, char: CharacterAppearance) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const hairColor = char.hairColor || '#ffffff';
        const hairStyle = char.hairStyle % 10;

        // 1. Back Hair (Behind body)
        this.drawBackHair(ctx, hairStyle, hairColor);

        // 2. Body & Head
        this.drawBody(ctx);
        this.drawHead(ctx);
        this.drawFace(ctx);

        // 3. Outfit
        const outfitStyle = char.outfit % 2;
        if (outfitStyle === 0) this.drawDress(ctx, char.outfitColor || '#ff9ff3');
        else this.drawShirtSkirt(ctx, char.outfitColor || '#ff9ff3');

        // 4. Front Hair (Bangs, details)
        this.drawFrontHair(ctx, hairStyle, hairColor);

        // 5. Pet
        if (char.pet) this.drawPet(ctx, char.pet);

        ctx.restore();
    }

    private static roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
        else ctx.rect(x, y, w, h);
    }

    private static drawBody(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#ffe0bd';
        ctx.fillRect(-8, 30, 16, 15); // Neck
        // Arms
        ctx.beginPath(); this.roundRect(ctx, -38, 45, 12, 45, 6); this.roundRect(ctx, 26, 45, 12, 45, 6); ctx.fill();
        // Legs
        ctx.beginPath();
        ctx.moveTo(-15, 90); ctx.lineTo(-18, 140); ctx.quadraticCurveTo(-10, 145, -5, 140); ctx.lineTo(-5, 90); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(15, 90); ctx.lineTo(18, 140); ctx.quadraticCurveTo(10, 145, 5, 140); ctx.lineTo(5, 90); ctx.fill();
        // Torso
        ctx.beginPath(); this.roundRect(ctx, -25, 40, 50, 60, 10); ctx.fill();
    }

    private static drawHead(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#ffe0bd';
        ctx.beginPath();
        ctx.moveTo(-48, -20);
        ctx.bezierCurveTo(-48, 40, -25, 65, 0, 65);
        ctx.bezierCurveTo(25, 65, 48, 40, 48, -20);
        ctx.bezierCurveTo(48, -75, -48, -75, -48, -20);
        ctx.fill();
    }

    private static drawFace(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.2)'; // Blush
        ctx.beginPath(); ctx.ellipse(-30, 25, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(30, 25, 12, 7, 0, 0, Math.PI * 2); ctx.fill();

        this.drawAnimeEye(ctx, -22, 5, false);
        this.drawAnimeEye(ctx, 22, 5, true);

        ctx.strokeStyle = '#b08d76'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-35, -12); ctx.quadraticCurveTo(-22, -16, -10, -12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(35, -12); ctx.quadraticCurveTo(22, -16, 10, -12); ctx.stroke();

        ctx.strokeStyle = '#8a5a44'; ctx.beginPath(); ctx.arc(0, 30, 5, 0.1, Math.PI - 0.1); ctx.stroke();
    }

    private static drawAnimeEye(ctx: CanvasRenderingContext2D, x: number, y: number, isRight: boolean) {
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2); ctx.fill();
        const grad = ctx.createLinearGradient(0, -10, 0, 10); grad.addColorStop(0, '#555'); grad.addColorStop(1, '#222');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(0, 3, 10, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 5, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-5, -6, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(4, 6, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#2d3436'; ctx.beginPath();
        if (isRight) { ctx.moveTo(-14, -6); ctx.quadraticCurveTo(0, -18, 16, -4); ctx.lineTo(18, -8); ctx.quadraticCurveTo(0, -24, -16, -8); }
        else { ctx.moveTo(14, -6); ctx.quadraticCurveTo(0, -18, -16, -4); ctx.lineTo(-18, -8); ctx.quadraticCurveTo(0, -24, 16, -8); }
        ctx.fill(); ctx.restore();
    }

    private static drawDress(ctx: CanvasRenderingContext2D, color: string) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(-22, 40); ctx.lineTo(22, 40); ctx.lineTo(24, 85); ctx.lineTo(-24, 85); ctx.fill();
        ctx.beginPath(); ctx.arc(-32, 50, 14, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(32, 50, 14, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-24, 85); ctx.quadraticCurveTo(-60, 120, -55, 145); ctx.quadraticCurveTo(0, 160, 55, 145); ctx.quadraticCurveTo(60, 120, 24, 85); ctx.fill();
        ctx.fillStyle = '#ff7675'; ctx.beginPath(); ctx.arc(0, 85, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(-10, 85, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(10, 85, 8, 5, 0.4, 0, Math.PI * 2); ctx.fill();
    }

    private static drawShirtSkirt(ctx: CanvasRenderingContext2D, color: string) {
        ctx.fillStyle = '#fff'; ctx.fillRect(-24, 40, 48, 50);
        ctx.beginPath(); ctx.ellipse(-32, 50, 12, 10, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(32, 50, 12, 10, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-24, 90); ctx.lineTo(24, 90); ctx.lineTo(45, 135); ctx.lineTo(-45, 135); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-10, 90); ctx.lineTo(-15, 135); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, 90); ctx.lineTo(15, 135); ctx.stroke();
    }

    // --- HAIR LOGIC ---

    private static drawBackHair(ctx: CanvasRenderingContext2D, style: number, color: string) {
        ctx.fillStyle = color;
        ctx.beginPath();
        if (style === 0) { // Long
            ctx.moveTo(-50, -20); ctx.bezierCurveTo(-75, 40, -80, 140, -20, 160);
            ctx.quadraticCurveTo(0, 150, 20, 160); ctx.bezierCurveTo(80, 140, 75, 40, 50, -20);
        } else if (style === 1) { // Bob
            ctx.arc(0, -20, 52, Math.PI, 0); ctx.lineTo(52, 40); ctx.quadraticCurveTo(40, 60, 0, 55); ctx.quadraticCurveTo(-40, 60, -52, 40); ctx.lineTo(-52, -20);
        } else if (style === 2) { // Pigtails (Back ties)
            // No main back hair, just the tails
            ctx.moveTo(-45, -30); ctx.bezierCurveTo(-90, -10, -100, 100, -80, 130); ctx.quadraticCurveTo(-70, 140, -60, 110); ctx.bezierCurveTo(-50, 60, -50, 10, -45, -30);
            ctx.moveTo(45, -30); ctx.bezierCurveTo(90, -10, 100, 100, 80, 130); ctx.quadraticCurveTo(70, 140, 60, 110); ctx.bezierCurveTo(50, 60, 50, 10, 45, -30);
        } else if (style === 3) { // Bun
            // Draw bun behind head
            ctx.arc(0, -50, 30, 0, Math.PI * 2);
        } else if (style === 4) { // Short/Pixie
            // Minimal back hair
            ctx.arc(0, -25, 50, Math.PI, 0); ctx.lineTo(48, 10); ctx.quadraticCurveTo(0, 25, -48, 10); ctx.lineTo(-50, -25);
        } else if (style === 6) { // Curly Big
            ctx.arc(0, -25, 60, Math.PI, 0);
            ctx.bezierCurveTo(70, 0, 90, 80, 60, 120);
            ctx.quadraticCurveTo(0, 140, -60, 120);
            ctx.bezierCurveTo(-90, 80, -70, 0, -60, -25);
        } else if (style === 8) { // Braids
            // L Braid
            ctx.moveTo(-40, 0); ctx.lineTo(-50, 80); ctx.quadraticCurveTo(-45, 90, -40, 80); ctx.lineTo(-30, 0);
            // R Braid
            ctx.moveTo(40, 0); ctx.lineTo(50, 80); ctx.quadraticCurveTo(45, 90, 40, 80); ctx.lineTo(30, 0);
        }
        // Others (5, 7, 9) might be Side Pony, Spiky, Bald (None)
        if (style !== 9) ctx.fill();
    }

    private static drawFrontHair(ctx: CanvasRenderingContext2D, style: number, color: string) {
        ctx.fillStyle = color;
        // 9 IS BALD -> No hair
        if (style === 9) return;

        // Base Top Shell (for all except specialized ones)
        if (style !== 7) {
            ctx.beginPath(); ctx.arc(0, -25, 50, Math.PI, 0); ctx.fill();
        }

        // Specific Bangs
        ctx.beginPath();
        if (style === 7) { // Spiky
            ctx.moveTo(-50, -20);
            ctx.lineTo(-30, -60); ctx.lineTo(-10, -30); ctx.lineTo(10, -70); ctx.lineTo(30, -30); ctx.lineTo(50, -50);
            ctx.lineTo(50, 0); ctx.quadraticCurveTo(0, -10, -50, 0);
        } else if (style === 3 || style === 4) { // Bun or Short -> High bangs
            ctx.moveTo(-50, -25); ctx.quadraticCurveTo(0, -40, 50, -25);
            ctx.lineTo(50, -5); ctx.quadraticCurveTo(0, -15, -50, -5);
        } else { // Standard bangs
            ctx.moveTo(-52, -30);
            ctx.bezierCurveTo(-50, -85, 50, -85, 52, -30);
            ctx.lineTo(52, -5); // R Side
            ctx.quadraticCurveTo(40, -15, 35, 0); ctx.quadraticCurveTo(25, -20, 15, 0);
            ctx.quadraticCurveTo(5, -20, 0, -5); // Center
            ctx.quadraticCurveTo(-5, -20, -15, 0); ctx.quadraticCurveTo(-25, -20, -35, 0);
            ctx.quadraticCurveTo(-40, -15, -52, -5); // L Side
        }
        ctx.closePath();
        ctx.fill();

        // Accessories
        if (style === 2) { // Pigtail ties
            ctx.fillStyle = '#ff7675';
            ctx.beginPath(); ctx.arc(-50, -25, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(50, -25, 6, 0, Math.PI * 2); ctx.fill();
        } else if (style === 3) { // Bun tie
            ctx.fillStyle = '#ff7675';
            ctx.beginPath(); ctx.rect(-10, -55, 20, 10); ctx.fill();
        } else if (style === 5) { // Side Pony
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.ellipse(45, 10, 15, 40, 0.4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fab1a0'; // Tie
            ctx.beginPath(); ctx.arc(38, -10, 6, 0, Math.PI * 2); ctx.fill();
        }
    }

    private static drawPet(ctx: CanvasRenderingContext2D, petType: string) {
        ctx.save(); ctx.translate(70, 90); const scale = 0.7; ctx.scale(scale, scale);
        if (petType === 'cat') {
            ctx.fillStyle = '#fdb'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-6, -2, 2.5, 0, Math.PI * 2); ctx.arc(6, -2, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(-18, -30); ctx.lineTo(-6, -14); ctx.fill();
            ctx.beginPath(); ctx.moveTo(12, -12); ctx.lineTo(18, -30); ctx.lineTo(6, -14); ctx.fill();
            ctx.fillStyle = 'pink'; ctx.beginPath(); ctx.ellipse(0, 2, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
        } else if (petType === 'dog') {
            ctx.fillStyle = '#dfe6e9'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#2d3436'; ctx.beginPath(); ctx.ellipse(-15, 2, 8, 16, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(15, 2, 8, 16, -0.4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-6, -3, 2.5, 0, Math.PI * 2); ctx.arc(6, -3, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(0, 4, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
        } else if (petType === 'dragon') {
            ctx.fillStyle = '#fdcb6e'; ctx.beginPath(); ctx.moveTo(-20, 20); ctx.lineTo(20, 20); ctx.lineTo(0, -25); ctx.fill();
            ctx.fillStyle = '#55efc4'; ctx.beginPath(); ctx.ellipse(-14, -8, 18, 10, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(14, -8, 18, 10, 0.4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-5, -6, 2.5, 0, Math.PI * 2); ctx.arc(5, -6, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}
