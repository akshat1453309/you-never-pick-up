/**
 * PhoneScene - Main messaging interface
 *
 * Shows incoming calls/messages as notifications
 * Player can click to enter conversations
 */

class PhoneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PhoneScene' });
    }

    init() {
        // Track active conversations
        this.activeConversations = [];
        this.incomingCalls = [];
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a1a).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, 'Messages', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, 80, 'You have incoming messages...', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0.5);

        // Create incoming call notification for Mom
        this.createIncomingCall('mom', 'Mom', 150);

        // Instructions
        this.add.text(width / 2, height - 40, 'Click on a conversation to answer', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#666666'
        }).setOrigin(0.5);
    }

    /**
     * Create an incoming call notification
     * @param {string} callerId - Unique identifier for caller
     * @param {string} callerName - Display name
     * @param {number} yPosition - Y position for the notification
     */
    createIncomingCall(callerId, callerName, yPosition) {
        const { width } = this.cameras.main;
        const centerX = width / 2;

        // Notification container
        const notificationBg = this.add.rectangle(centerX, yPosition, 600, 100, 0x2a2a2a)
            .setInteractive({ useHandCursor: true });

        // Border/highlight
        const border = this.add.rectangle(centerX, yPosition, 604, 104, 0x4a4a4a);
        border.setStrokeStyle(2, 0x666666);
        border.setDepth(-1);

        // Profile circle (placeholder for profile image)
        const profileCircle = this.add.circle(centerX - 220, yPosition, 30, 0x4a90e2);

        // Initial of caller
        const initial = this.add.text(centerX - 220, yPosition, callerName[0], {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Caller name
        const nameText = this.add.text(centerX - 170, yPosition - 20, callerName, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Incoming message preview
        const messagePreview = this.add.text(centerX - 170, yPosition + 10, 'Incoming call...', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0, 0.5);

        // Answer button
        const answerButton = this.add.rectangle(centerX + 200, yPosition, 100, 40, 0x4a90e2)
            .setInteractive({ useHandCursor: true });

        const answerText = this.add.text(centerX + 200, yPosition, 'Answer', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Hover effects
        answerButton.on('pointerover', () => {
            answerButton.setFillStyle(0x5aa0f2);
        });

        answerButton.on('pointerout', () => {
            answerButton.setFillStyle(0x4a90e2);
        });

        // Click to answer
        answerButton.on('pointerdown', () => {
            this.answerCall(callerId, callerName);
        });

        // Also allow clicking the whole notification to answer
        notificationBg.on('pointerdown', () => {
            this.answerCall(callerId, callerName);
        });

        // Pulse animation for incoming call
        this.tweens.add({
            targets: [notificationBg, border],
            alpha: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Answer a call and transition to conversation
     * @param {string} callerId - Unique identifier for caller
     * @param {string} callerName - Display name
     */
    answerCall(callerId, callerName) {
        // Stop all tweens
        this.tweens.killAll();

        // Transition to conversation scene
        this.scene.start('ConversationScene', {
            callerId: callerId,
            callerName: callerName
        });
    }
}
