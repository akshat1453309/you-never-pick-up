/**
 * ConversationScene - Show conversation on phone screen (GTA-style)
 *
 * Phone stays visible, dialogue appears on phone screen
 */

class ConversationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConversationScene' });
    }

    init(data) {
        this.caller = data.caller;
        this.officeScene = data.officeScene;
        this.currentLine = 0;
        this.conversationStartTime = Date.now();
    }

    create() {
        const { width, height } = this.cameras.main;

        // DEBUG: Click to place green dot (uses global window.debugCoordMode)
        this.input.on('pointerdown', (pointer) => {
            if (!window.debugCoordMode) return;
            this.add.circle(pointer.x, pointer.y, 5, 0x00ff00).setDepth(9999);
            console.log(`📍 Click: x=${Math.round(pointer.x)}, y=${Math.round(pointer.y)}`);
        });

        // Create phone container (same as PhoneInterruptionScene)
        this.phoneContainer = this.add.container(0, 0).setDepth(500);

        // Phone dimensions
        const phoneWidth = 220;
        const phoneHeight = 420;
        const phoneX = width - 130;
        const phoneY = height - phoneHeight / 2 - 30;

        // Create 3D phone sprite
        this.createPhoneSprite(phoneWidth, phoneHeight);

        // Position phone (already on screen from previous scene)
        this.phoneContainer.setPosition(phoneX, phoneY);

        // Add conversation screen
        this.createConversationScreen(phoneWidth, phoneHeight);

        // Start conversation
        this.showNextLine();
    }

    createPhoneSprite(phoneWidth, phoneHeight) {
        // === ENHANCED 3D PHONE WITH DEPTH ===

        // Outer shadow (soft, larger blur effect)
        const outerShadow = this.add.rectangle(12, 12, phoneWidth + 4, phoneHeight + 4, 0x000000, 0.3);
        outerShadow.setOrigin(0.5);
        this.phoneContainer.add(outerShadow);

        // Inner shadow (sharper, for depth)
        const innerShadow = this.add.rectangle(6, 6, phoneWidth, phoneHeight, 0x000000, 0.5);
        innerShadow.setOrigin(0.5);
        this.phoneContainer.add(innerShadow);

        // Phone body (dark metal with gradient effect)
        const phoneBody = this.add.rectangle(0, 0, phoneWidth, phoneHeight, 0x1a1a1a);
        phoneBody.setOrigin(0.5);
        phoneBody.setStrokeStyle(4, 0x0a0a0a);
        this.phoneContainer.add(phoneBody);

        // Top highlight (for 3D rounded edge effect)
        const topHighlight = this.add.rectangle(0, -(phoneHeight / 2) + 3, phoneWidth - 10, 6, 0x2a2a2a, 0.6);
        topHighlight.setOrigin(0.5);
        this.phoneContainer.add(topHighlight);

        // Left side highlight (3D edge)
        const leftHighlight = this.add.rectangle(-(phoneWidth / 2) + 3, 0, 6, phoneHeight - 10, 0x2a2a2a, 0.4);
        leftHighlight.setOrigin(0.5);
        this.phoneContainer.add(leftHighlight);

        // Phone bezel/border (lighter edge for 3D effect)
        const bezel = this.add.rectangle(0, 0, phoneWidth - 8, phoneHeight - 8, 0x2a2a2a);
        bezel.setOrigin(0.5);
        this.phoneContainer.add(bezel);

        // Screen glass effect (subtle gradient overlay)
        const screenGlass = this.add.rectangle(0, 0, phoneWidth - 20, phoneHeight - 30, 0x1a1a1a, 0.8);
        screenGlass.setOrigin(0.5);
        this.phoneContainer.add(screenGlass);

        // Screen glare (top-left reflection)
        const glare = this.add.ellipse(-30, -80, 80, 40, 0xffffff, 0.08);
        glare.rotation = -0.3;
        this.phoneContainer.add(glare);

        // Screen background (dark OLED black)
        const screenBg = this.add.rectangle(0, 0, phoneWidth - 22, phoneHeight - 32, 0x000000);
        screenBg.setOrigin(0.5);
        this.phoneContainer.add(screenBg);

        // Notch at top (iPhone-style with better depth)
        const notchShadow = this.add.rectangle(0, -(phoneHeight / 2) + 12, 82, 22, 0x000000, 0.4);
        notchShadow.setOrigin(0.5, 0);
        this.phoneContainer.add(notchShadow);

        const notch = this.add.rectangle(0, -(phoneHeight / 2) + 10, 80, 20, 0x1a1a1a);
        notch.setOrigin(0.5, 0);
        this.phoneContainer.add(notch);

        // Speaker grill with depth
        const speakerBg = this.add.rectangle(0, -(phoneHeight / 2) + 23, 52, 6, 0x000000, 0.6);
        speakerBg.setOrigin(0.5);
        this.phoneContainer.add(speakerBg);

        const speaker = this.add.rectangle(0, -(phoneHeight / 2) + 22, 50, 4, 0x1a1a1a);
        speaker.setOrigin(0.5);
        this.phoneContainer.add(speaker);

        // Home button indicator (bottom) with glow
        const homeIndicatorGlow = this.add.rectangle(0, (phoneHeight / 2) - 15, 64, 8, 0xffffff, 0.1);
        homeIndicatorGlow.setOrigin(0.5);
        this.phoneContainer.add(homeIndicatorGlow);

        const homeIndicator = this.add.rectangle(0, (phoneHeight / 2) - 15, 60, 4, 0x666666);
        homeIndicator.setOrigin(0.5);
        this.phoneContainer.add(homeIndicator);

        // Add subtle pulsing glow to screen edges
        this.tweens.add({
            targets: screenGlass,
            alpha: 0.6,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createConversationScreen(phoneWidth, phoneHeight) {
        // Status bar time
        const timeText = this.add.text(0, -(phoneHeight / 2) + 35, '9:41', {
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.phoneContainer.add(timeText);

        // Call timer at top
        this.callTimer = this.add.text(0, -(phoneHeight / 2) + 55, '00:00', {
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#2ecc71',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.phoneContainer.add(this.callTimer);

        // Update call timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateCallTimer,
            callbackScope: this,
            loop: true
        });

        // Caller name header
        const nameText = this.add.text(0, -(phoneHeight / 2) + 80, this.caller.name, {
            fontSize: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.phoneContainer.add(nameText);

        // Dialogue area (scrollable text area)
        this.dialogueContainer = this.add.container(0, -30);
        this.phoneContainer.add(this.dialogueContainer);

        // End call button (red)
        const endCallBtn = this.add.circle(0, (phoneHeight / 2) - 65, 35, 0xe74c3c);
        endCallBtn.setInteractive({ useHandCursor: true });
        endCallBtn.setStrokeStyle(3, 0xc0392b);
        this.phoneContainer.add(endCallBtn);

        const endCallIcon = this.add.text(0, (phoneHeight / 2) - 65, '✕', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.phoneContainer.add(endCallIcon);

        const endCallLabel = this.add.text(0, (phoneHeight / 2) - 25, 'End Call', {
            fontSize: '11px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.phoneContainer.add(endCallLabel);

        // Button interaction
        endCallBtn.on('pointerdown', () => {
            this.endConversation();
        });

        // Hover effect
        endCallBtn.on('pointerover', () => {
            this.tweens.add({
                targets: endCallBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });
        endCallBtn.on('pointerout', () => {
            this.tweens.add({
                targets: endCallBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        this.dialogueTexts = [];
    }

    updateCallTimer() {
        const elapsed = Math.floor((Date.now() - this.conversationStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.callTimer.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    showNextLine() {
        if (this.currentLine >= this.caller.dialogue.length) {
            // Auto-end after last line
            this.time.delayedCall(2000, () => {
                this.endConversation();
            });
            return;
        }

        const line = this.caller.dialogue[this.currentLine];

        // Calculate yPos based on previous messages' actual heights
        let yPos = -60; // Starting position
        const messageGap = 8; // Gap between messages

        if (this.dialogueTexts.length > 0) {
            // Get the last message
            const lastMessage = this.dialogueTexts[this.dialogueTexts.length - 1];
            // Position new message below the last one
            yPos = lastMessage.y + lastMessage.height + messageGap;
        }

        // Message bubble
        const messageText = this.add.text(-70, yPos, line.text, {
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: 160 },
            backgroundColor: '#2a2a2a',
            padding: { x: 10, y: 8 }
        }).setOrigin(0, 0);

        this.dialogueContainer.add(messageText);
        this.dialogueTexts.push(messageText);

        // Fade in animation
        messageText.setAlpha(0);
        this.tweens.add({
            targets: messageText,
            alpha: 1,
            duration: 300
        });

        // Scroll up older messages if needed (when messages go beyond visible area)
        const visibleHeight = 150; // Approximate visible height in dialogue area
        if (yPos + messageText.height > visibleHeight) {
            const scrollAmount = (yPos + messageText.height) - visibleHeight;
            this.tweens.add({
                targets: this.dialogueContainer,
                y: this.dialogueContainer.y - scrollAmount,
                duration: 300
            });
        }

        this.currentLine++;

        // Auto-advance to next line
        this.time.delayedCall(2500, () => {
            this.showNextLine();
        });
    }

    endConversation() {
        // Calculate time spent on call
        const conversationDuration = (Date.now() - this.conversationStartTime) / 1000;
        const timeSpent = Math.max(5, conversationDuration);

        // Slide phone back down
        const { height } = this.cameras.main;

        this.tweens.add({
            targets: this.phoneContainer,
            y: height + 250,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.scene.stop();
                // OfficeScene was never paused, so no need to resume
                this.officeScene.returnFromConversation(timeSpent);
            }
        });
    }
}
