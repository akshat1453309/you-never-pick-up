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
    backgroundColor: '#1a1a1a',
    scene: [],  // Scenes will be added as they're created
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // Enable physics if needed (probably not for this game)
    // physics: {
    //     default: 'arcade',
    //     arcade: {
    //         gravity: { y: 0 },
    //         debug: false
    //     }
    // }
};

// Create the game instance
const game = new Phaser.Game(config);

// Game will be accessible globally via the 'game' variable
// Scenes can be accessed via game.scene
