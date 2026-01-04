export interface Scene {
    init(): void;
    update(deltaTime: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    cleanup(): void;
    onResize(width: number, height: number): void;
}
