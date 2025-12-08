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
    scene: [TypingScene, EndingScene],  // Register game scenes
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Game will be accessible globally via the 'game' variable
// Scenes can be accessed via game.scene
