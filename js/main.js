/**
 * You Never Pick Up - Main Game Configuration
 *
 * This file initializes Phaser and configures the game canvas and settings.
 */

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [GameScene],  // Register game scene
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // Top-down game, no gravity
            debug: false  // Set to true to see collision boxes
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Game will be accessible globally via the 'game' variable
// Scenes can be accessed via game.scene
