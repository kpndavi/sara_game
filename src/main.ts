import './style.css'
import { SceneManager } from './game/SceneManager'
import { TitleScene } from './game/scenes/TitleScene'
import { GameState } from './game/GameState'

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    // Initialize Global State
    // Initialize Global State
    console.log("GAME VERSION: Mobile Fix 2.0 (Loaded)");
    GameState.getInstance().load();

    const sceneManager = new SceneManager(canvas);
    sceneManager.switchScene(new TitleScene(sceneManager));
});
