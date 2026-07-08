import BootScene from './scenes/Boot.js';
import MainMenuScene from './scenes/MainMenu.js';
import GameScene from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BootScene, MainMenuScene, GameScene]
};

const game = new Phaser.Game(config);
