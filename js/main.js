/**
 * You Never Pick Up - Main Game Configuration
 *
 * This file initializes Phaser and configures the game canvas and settings.
 */

// DEBUG: Check which scene classes are defined
console.log('=== SCENE CLASS AVAILABILITY CHECK ===');
console.log('OfficeScene:', typeof OfficeScene);
console.log('PhoneInterruptionScene:', typeof PhoneInterruptionScene);
console.log('ConversationScene:', typeof ConversationScene);
console.log('EndOfDayScene:', typeof EndOfDayScene);
console.log('HeartAttackScene:', typeof HeartAttackScene);
console.log('RevealEndingScene:', typeof RevealEndingScene);
console.log('=== END SCENE CLASS CHECK ===');

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#0a0a0a',
    scene: [OfficeScene, PhoneInterruptionScene, ConversationScene, EndOfDayScene, HeartAttackScene, RevealEndingScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Game will be accessible globally via the 'game' variable
// Scenes can be accessed via game.scene
