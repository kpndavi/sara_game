export class InputHandler {
    jump: boolean = false;
    keys: Set<string> = new Set();

    constructor() {
        window.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.keys.has(e.code)) {
                this.jump = true;
                this.keys.add(e.code);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                this.jump = false; // Reset jump flag is not strictly necessary for single press, but good for state
                this.keys.delete(e.code);
            }
        });

        // Touch support
        window.addEventListener('touchstart', () => {
            this.jump = true;
        });

        // Mouse click support
        window.addEventListener('mousedown', () => {
            this.jump = true;
        });
    }
}
