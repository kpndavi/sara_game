export interface CharacterAppearance {
    hairStyle: number;
    hairColor: string;
    outfit: number;
    outfitColor: string;
    skinTone: string;
    pet: string | null; // 'cat', 'dog', 'dragon', or null
}

export interface SlotData {
    playerName: string;
    character: CharacterAppearance;
    highScores: { [game: string]: number };
    // Future: coloredPictures: string[]
}

export class GameState {
    private static instance: GameState;

    public currentSlot: string = 'sara';
    public slots: { [key: string]: SlotData } = {};

    private constructor() {
        // Default Slots
        this.slots = {
            'sara': this.createDefaultSlot('Sara'),
            'lara': this.createDefaultSlot('Lara'),
            'sofia': this.createDefaultSlot('Sofia')
        };
    }

    private createDefaultSlot(name: string): SlotData {
        return {
            playerName: name,
            character: {
                hairStyle: 0,
                hairColor: "#ff9a9e",
                outfit: 0,
                outfitColor: "#a18cd1",
                skinTone: "#f5d0b0",
                pet: null
            },
            highScores: { "runner": 0, "tetris": 0 }
        };
    }

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    // Accessors for current slot
    public get playerName(): string {
        return this.slots[this.currentSlot].playerName;
    }

    public set playerName(name: string) {
        this.slots[this.currentSlot].playerName = name;
        this.save();
    }

    public get character(): CharacterAppearance {
        return this.slots[this.currentSlot].character;
    }

    public set character(c: CharacterAppearance) {
        this.slots[this.currentSlot].character = c;
        this.save();
    }

    public get highScores(): { [game: string]: number } {
        return this.slots[this.currentSlot].highScores;
    }

    public updateHighScore(game: string, score: number) {
        const currentScore = this.slots[this.currentSlot].highScores[game] || 0;
        if (score > currentScore) {
            this.slots[this.currentSlot].highScores[game] = score;
            this.save();
        }
    }

    public save() {
        localStorage.setItem('sara-demon-hunters-save-v2', JSON.stringify(this.slots));
    }

    public load() {
        const dataStr = localStorage.getItem('sara-demon-hunters-save-v2');
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                // Merge loaded data with defaults to ensure structure
                this.slots = { ...this.slots, ...data };
            } catch (e) {
                console.error("Failed to load save data", e);
            }
        }
    }
}
