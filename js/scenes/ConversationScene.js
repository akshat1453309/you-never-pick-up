/**
 * ConversationScene - Active conversation/chat interface
 *
 * Shows messages from the caller and dialogue choices for the player
 */

class ConversationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConversationScene' });
    }

    init(data) {
        // Data passed from PhoneScene
        this.callerId = data.callerId;
        this.callerName = data.callerName;

        // Conversation state
        this.currentMessageIndex = 0;
        this.displayedMessages = [];
        this.choiceButtons = [];
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a1a).setOrigin(0);

        // Header bar
        const headerBg = this.add.rectangle(0, 0, width, 80, 0x2a2a2a).setOrigin(0, 0);

        // Back button (for later when we have multiple calls)
        const backButton = this.add.text(20, 40, '← Back', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2'
        }).setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('PhoneScene');
        });

        // Caller name in header
        this.add.text(width / 2, 40, this.callerName, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Status text
        this.statusText = this.add.text(width / 2, 65, 'Active', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2'
        }).setOrigin(0.5);

        // Message display area (scrollable region)
        this.messageArea = this.add.container(0, 90);
        this.messageYOffset = 20;

        // Choice buttons container (at bottom)
        this.choiceContainer = this.add.container(0, height - 120);

        // Load dialogue data
        this.loadDialogue();
    }

    /**
     * Load dialogue for the current caller
     */
    loadDialogue() {
        // Get dialogue data from global DIALOGUE object (will be loaded from dialogue.js)
        if (typeof DIALOGUE === 'undefined') {
            console.error('DIALOGUE data not loaded!');
            return;
        }

        this.dialogue = DIALOGUE[this.callerId];

        if (!this.dialogue) {
            console.error(`No dialogue found for ${this.callerId}`);
            return;
        }

        // Start the conversation
        this.showNextMessage();
    }

    /**
     * Display the next message in the conversation
     */
    showNextMessage() {
        if (this.currentMessageIndex >= this.dialogue.messages.length) {
            // Conversation complete
            this.showConversationEnd();
            return;
        }

        const messageData = this.dialogue.messages[this.currentMessageIndex];

        if (messageData.type === 'caller') {
            // Caller's message
            this.displayCallerMessage(messageData.text);

            // Auto-advance after a delay
            this.time.delayedCall(1500, () => {
                this.currentMessageIndex++;
                this.showNextMessage();
            });
        } else if (messageData.type === 'choice') {
            // Player choice point
            this.displayChoices(messageData.choices);
        }
    }

    /**
     * Display a message from the caller
     * @param {string} text - Message text
     */
    displayCallerMessage(text) {
        const { width } = this.cameras.main;

        // Message bubble (left-aligned for caller)
        const maxWidth = 450;
        const padding = 15;

        // Create text to measure size
        const tempText = this.add.text(0, 0, text, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            wordWrap: { width: maxWidth - padding * 2 }
        });

        const textWidth = Math.min(tempText.width, maxWidth - padding * 2);
        const textHeight = tempText.height;

        // Message bubble background
        const bubbleBg = this.add.rectangle(
            100,
            this.messageYOffset,
            textWidth + padding * 2,
            textHeight + padding * 2,
            0x3a3a3a
        ).setOrigin(0, 0);

        // Round corners (visual polish)
        bubbleBg.setStrokeStyle(1, 0x4a4a4a);

        // Message text
        const messageText = this.add.text(
            100 + padding,
            this.messageYOffset + padding,
            text,
            {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                wordWrap: { width: maxWidth - padding * 2 }
            }
        ).setOrigin(0, 0);

        // Add to message area
        this.messageArea.add([bubbleBg, messageText]);

        // Update Y offset for next message
        this.messageYOffset += textHeight + padding * 2 + 15;

        // Scroll if needed (simple version - move container up)
        if (this.messageYOffset > 350) {
            this.tweens.add({
                targets: this.messageArea,
                y: this.messageArea.y - (textHeight + padding * 2 + 15),
                duration: 300,
                ease: 'Sine.easeOut'
            });
        }

        // Cleanup temp text
        tempText.destroy();

        // Fade in animation
        bubbleBg.setAlpha(0);
        messageText.setAlpha(0);

        this.tweens.add({
            targets: [bubbleBg, messageText],
            alpha: 1,
            duration: 300,
            ease: 'Sine.easeOut'
        });
    }

    /**
     * Display player dialogue choices
     * @param {Array} choices - Array of choice objects {text, next}
     */
    displayChoices(choices) {
        const { width } = this.cameras.main;

        // Clear any existing choice buttons
        this.choiceButtons.forEach(btn => btn.destroy());
        this.choiceButtons = [];

        // Create choice buttons
        const buttonHeight = 50;
        const buttonSpacing = 10;
        const startY = 10;

        choices.forEach((choice, index) => {
            const yPos = startY + (buttonHeight + buttonSpacing) * index;

            // Button background
            const buttonBg = this.add.rectangle(
                width / 2,
                yPos,
                600,
                buttonHeight,
                0x4a90e2
            ).setInteractive({ useHandCursor: true });

            // Button text
            const buttonText = this.add.text(
                width / 2,
                yPos,
                choice.text,
                {
                    fontSize: '16px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#ffffff',
                    wordWrap: { width: 550 },
                    align: 'center'
                }
            ).setOrigin(0.5);

            // Hover effects
            buttonBg.on('pointerover', () => {
                buttonBg.setFillStyle(0x5aa0f2);
            });

            buttonBg.on('pointerout', () => {
                buttonBg.setFillStyle(0x4a90e2);
            });

            // Click handler
            buttonBg.on('pointerdown', () => {
                this.handleChoice(choice);
            });

            // Add to container
            this.choiceContainer.add([buttonBg, buttonText]);
            this.choiceButtons.push(buttonBg, buttonText);
        });
    }

    /**
     * Handle player choice selection
     * @param {Object} choice - Selected choice object
     */
    handleChoice(choice) {
        // Clear choices
        this.choiceButtons.forEach(btn => btn.destroy());
        this.choiceButtons = [];

        // Display player's response (optional - can add this later)
        // For now, just advance to next message

        this.currentMessageIndex++;
        this.showNextMessage();
    }

    /**
     * Show conversation end state
     */
    showConversationEnd() {
        const { width, height } = this.cameras.main;

        this.statusText.setText('Call Ended');

        // Show return button
        const returnButton = this.add.rectangle(
            width / 2,
            height - 60,
            200,
            50,
            0x4a90e2
        ).setInteractive({ useHandCursor: true });

        const returnText = this.add.text(
            width / 2,
            height - 60,
            'Back to Messages',
            {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        returnButton.on('pointerdown', () => {
            this.scene.start('PhoneScene');
        });
    }
}
