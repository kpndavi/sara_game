export class Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    markedForDeletion: boolean = false;

    constructor(x: number, y: number, width: number, height: number, color: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    update(deltaTime: number, speed: number) {
        // Override in subclasses
        // Basic behavior: move left with world speed
        this.x -= speed * deltaTime;
        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        // Draw rounded rect
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 10);
    }

    // Utility to draw rounded rectangles
    roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    }
}
