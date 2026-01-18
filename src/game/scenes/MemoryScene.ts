import { Scene } from '../Scene';
import { SceneManager } from '../SceneManager';
import { GameMenuScene } from './GameMenuScene';

interface Card {
    id: number;
    emoji: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isFlipped: boolean;
    isMatched: boolean;
}

export class MemoryScene implements Scene {
    private sceneManager: SceneManager;
    private cards: Card[] = [];
    private flippedCards: Card[] = [];
    private isLocked: boolean = false;
    private level: number = 1;

    private message: string = "";
    private showMessageTime: number = 0;

    // Cute emojis for a 7yo girl
    private emojis: string[] = [
        '🦄', '🌈', '🍦', '🍭', '🐱', '🐶', '🦋', '🌸',
        '🍓', '🍄', '🐢', '🐬', '🎀', '🧸', '🐣', '🍟',
        '🍩', '🍪', '🎈', '🏰', '🧜‍♀️', '🧚‍♀️', '👑', '💎'
    ];

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    init(): void {
        this.startLevel(this.level);
        this.sceneManager.getCanvas().addEventListener('pointerup', this.handleInput);
    }

    private startLevel(level: number) {
        this.level = level;
        this.cards = [];
        this.flippedCards = [];
        this.isLocked = false;
        this.message = `Level ${level}`;
        this.showMessageTime = 120; // Show level start message for ~2 seconds

        // Determine grid size based on level (Layers)
        let cols = 4;
        let rows = 3;

        switch (level) {
            case 1: cols = 4; rows = 3; break; // 12 cards
            case 2: cols = 4; rows = 4; break; // 16 cards
            case 3: cols = 5; rows = 4; break; // 20 cards
            case 4: cols = 6; rows = 4; break; // 24 cards
            case 5: cols = 6; rows = 5; break; // 30 cards
            default: cols = 6; rows = 5; break; // Cap at 30
        }

        const totalPairs = (cols * rows) / 2;
        // Shuffle emojis and pick needed amount
        const shuffledEmojis = [...this.emojis].sort(() => Math.random() - 0.5);
        const selectedEmojis = shuffledEmojis.slice(0, totalPairs);

        // Create pairs
        const cardEmojis = [...selectedEmojis, ...selectedEmojis];
        // Shuffle cards
        cardEmojis.sort(() => Math.random() - 0.5);

        // Layout calculation
        const canvas = this.sceneManager.getCanvas();
        const cardW = 80;
        const cardH = 100;
        const gap = 15;

        const totalW = cols * cardW + (cols - 1) * gap;
        const totalH = rows * cardH + (rows - 1) * gap;

        const startX = (canvas.width - totalW) / 2;
        const startY = (canvas.height - totalH) / 2 + 30; // Offset for header

        for (let i = 0; i < cardEmojis.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            this.cards.push({
                id: i,
                emoji: cardEmojis[i],
                x: startX + col * (cardW + gap),
                y: startY + row * (cardH + gap),
                width: cardW,
                height: cardH,
                isFlipped: false,
                isMatched: false
            });
        }
    }

    private handleInput = (event: PointerEvent) => {
        if (this.isLocked || this.showMessageTime > 0) return;

        const canvas = this.sceneManager.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        // Check Back/Exit button (top left)
        if (clickX < 100 && clickY < 60) {
            this.cleanup(); // Clean up before switching
            this.sceneManager.switchScene(new GameMenuScene(this.sceneManager));
            return;
        }

        // Check Cards
        for (const card of this.cards) {
            if (!card.isFlipped && !card.isMatched &&
                clickX >= card.x && clickX <= card.x + card.width &&
                clickY >= card.y && clickY <= card.y + card.height) {

                this.flipCard(card);
                break;
            }
        }
    };

    private flipCard(card: Card) {
        card.isFlipped = true;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.isLocked = true;
            this.checkMatch();
        }
    }

    private checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.emoji === card2.emoji) {
            // Match!
            card1.isMatched = true;
            card2.isMatched = true;
            this.flippedCards = [];
            this.isLocked = false;
            this.message = "Good Job! ✨";
            this.showMessageTime = 30;

            // Check Win
            if (this.cards.every(c => c.isMatched)) {
                setTimeout(() => {
                    this.message = "Level Complete! 🎉";
                    this.showMessageTime = 120;
                    setTimeout(() => this.startLevel(this.level + 1), 2000);
                }, 500);
            }
        } else {
            // No Match
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                this.flippedCards = [];
                this.isLocked = false;
            }, 1000);
        }
    }

    update(_deltaTime: number): void {
        if (this.showMessageTime > 0) {
            this.showMessageTime--;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Background
        ctx.fillStyle = '#ffeaa7'; // Pastel yellow/orange
        ctx.fillRect(0, 0, w, h);

        // Header
        ctx.fillStyle = "#ff7675";
        ctx.font = "bold 40px 'Fredoka One'";
        ctx.textAlign = "center";
        ctx.fillText(`Memory Magic - Level ${this.level}`, w / 2, 60);

        // Back Button
        ctx.fillStyle = "#fab1a0";
        ctx.beginPath();
        ctx.roundRect(10, 10, 90, 40, 10);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "20px 'Nunito'";
        ctx.fillText("Back", 55, 36);

        // Cards
        for (const card of this.cards) {
            this.drawCard(ctx, card);
        }

        // Overlay Message
        if (this.showMessageTime > 0 && this.message) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(0, h / 2 - 50, w, 100);

            ctx.fillStyle = "#d63031";
            ctx.font = "bold 50px 'Fredoka One'";
            ctx.fillText(this.message, w / 2, h / 2 + 15);
        }
    }

    private drawCard(ctx: CanvasRenderingContext2D, card: Card) {
        ctx.save();

        // Draw Card Body
        if (card.isFlipped || card.isMatched) {
            ctx.fillStyle = "white";
        } else {
            ctx.fillStyle = "#ff9ff3"; // Pink for back
        }

        // Shadow
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;

        ctx.beginPath();
        ctx.roundRect(card.x, card.y, card.width, card.height, 10);
        ctx.fill();
        ctx.restore();

        // Draw Content
        if (card.isFlipped || card.isMatched) {
            ctx.font = "50px serif"; // Emoji font size
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(card.emoji, card.x + card.width / 2, card.y + card.height / 2 + 5);
        } else {
            // Pattern for back
            ctx.font = "40px 'Fredoka One'";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", card.x + card.width / 2, card.y + card.height / 2);
        }
    }

    onResize(_width: number, _height: number): void {
        // Re-calculate layout if needed, but for now just restart level to be safe/lazy or keep state
        // Keeping state is better but layout needs update. 
        // Simple fix: just re-center based on new width/height?
        // Let's just restart to ensure grid fits.
        this.startLevel(this.level);
    }

    cleanup(): void {
        this.sceneManager.getCanvas().removeEventListener('pointerup', this.handleInput);
    }
}
