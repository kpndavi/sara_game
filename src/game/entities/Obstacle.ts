import { Entity } from './Entity';

export type ObstacleType = 'FRIEND' | 'HAZARD' | 'COLLECTIBLE';

export class Obstacle extends Entity {
    type: ObstacleType;

    constructor(x: number, y: number, type: ObstacleType) {
        let color = '';
        let w = 50;
        let h = 50;

        switch (type) {
            case 'FRIEND':
                color = '#a18cd1'; // Purple
                w = 40; h = 60; // Tall
                break;
            case 'HAZARD':
                color = '#7d7d7d'; // Grey
                w = 50; h = 30; // Short/Wide
                break;
            case 'COLLECTIBLE':
                color = '#fecfef'; // Light Pink
                w = 30; h = 30; // Small
                break;
        }

        super(x, y, w, h, color);
        this.type = type;
    }

    draw(ctx: CanvasRenderingContext2D) {
        super.draw(ctx);
        // Add simple details based on type
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';

        if (this.type === 'FRIEND') {
            ctx.fillText('^_^', this.x + this.width / 2, this.y + 20);
        } else if (this.type === 'HAZARD') {
            ctx.fillText('>_<', this.x + this.width / 2, this.y + 20);
        } else if (this.type === 'COLLECTIBLE') {
            ctx.fillText('★', this.x + this.width / 2, this.y + 20);
        }
    }
}
