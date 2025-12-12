/**
 * OfficeScene - Primary gameplay scene
 *
 * Player types documents to earn money, manages health, receives phone calls
 */

class OfficeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OfficeScene' });
    }

    preload() {
        // Load office desk background
        this.load.image('office_desk', 'assets/images/office_desk_rough.png');

        // Load profile pictures for all characters
        this.load.image('profile_mom', 'assets/characters/mom.png');

        // Load office background music (optional - won't break game if missing)
        this.load.audio('office_music', 'assets/sounds/office_theme.mp3');

        // Load phone ringtone (optional - won't break game if missing)
        this.load.audio('phone_ring', 'assets/sounds/phone_ring.mp3');

        // Handle audio loading errors
        this.load.on('loaderror', (file) => {
            if (file.key === 'office_music') {
                console.log('Office music not found - game will continue without music');
            }
            if (file.key === 'phone_ring') {
                console.log('Phone ring not found - game will continue without ringtone');
            }
        });
    }

    init(data) {
        this.workDay = data.workDay || 1;
        this.money = data.money || 0;
        this.ignoredCalls = data.ignoredCalls || 0;
        this.totalCalls = data.totalCalls || 0;
        this.health = data.health || 100;
        this.documentsCompleted = 0;
        this.usedDocuments = data.usedDocuments || [];

        // Health drains passively over time
        this.healthDrainRate = 0.05; // 0.05% health per 100ms = 0.5% per second
    }

    create() {
        const { width, height } = this.cameras.main;

        // Set background color
        this.cameras.main.setBackgroundColor('#000000');

        // Office desk background image - FORCE to fill entire screen
        this.background = this.add.image(0, 0, 'office_desk')
            .setOrigin(0, 0)
            .setDepth(0);

        // Force background to fill entire screen (stretch if needed)
        this.background.setDisplaySize(width, height);

        // Fade in from black
        this.cameras.main.fadeIn(1500, 0, 0, 0);

        // Play office background music (looping) - with error handling
        try {
            if (this.cache.audio.exists('office_music')) {
                this.officeMusic = this.sound.add('office_music', {
                    loop: true,
                    volume: 0.5
                });
                this.officeMusic.play();
                console.log('Office music playing');
            } else {
                console.log('Office music not loaded - continuing without music');
            }
        } catch (error) {
            console.log('Could not play office music:', error.message);
        }

        // Get current document
        this.currentDocument = this.getDocument();
        this.typedText = '';
        this.phoneActive = false;
        this.messageOpen = false;
        this.typingOverlayVisible = false;
        this.phoneMinimized = false;

        // === PHONE UI (bottom-right corner) ===
        this.createPhoneUI();

        // === TYPING OVERLAY (hidden initially) ===
        this.createTypingOverlay();

        // Hide typing overlay initially
        this.hideTypingOverlay();

        // Keyboard input handlers
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleDialogueKey = this.handleDialogueKey.bind(this);

        // DEBUG: Click to place green dot (uses global window.debugCoordMode)
        this.input.on('pointerdown', (pointer) => {
            if (!window.debugCoordMode) return;
            this.add.circle(pointer.x, pointer.y, 5, 0x00ff00).setDepth(9999);
            console.log(`📍 Click: x=${Math.round(pointer.x)}, y=${Math.round(pointer.y)}`);
        });

        // DEBUG: Press '8' to jump directly to shop
        this.input.keyboard.on('keydown-EIGHT', () => {
            console.log('DEBUG: Jumping to shop scene');
            // Clean up before transition
            if (this.timerEvent) this.timerEvent.remove();
            if (this.healthDrainEvent) this.healthDrainEvent.remove();
            this.input.keyboard.off('keydown', this.handleKeyPress, this);

            // Jump to shop
            this.scene.start('EndOfDayScene', {
                workDay: this.workDay || 1,
                money: this.money || 100,
                ignoredCalls: this.ignoredCalls || 0,
                totalCalls: this.totalCalls || 0,
                health: this.health || 75,
                usedDocuments: this.usedDocuments || []
            });
        });

        // Show notification after fade in completes
        this.time.delayedCall(2000, () => {
            this.showBossNotification();
        });

        // Start phone call system
        this.time.delayedCall(3000, () => {
            this.schedulePhoneCall();
        });

        // === CLOCK OUT BUTTON (top-left) ===
        this.createClockOutButton();

        // === HEALTH INDICATOR (top-right) ===
        this.createHealthIndicator();

        // === TIMER DISPLAY (top-center) ===
        this.createTimerDisplay();

        // Handle window resize events
        this.scale.on('resize', this.handleResize, this);
    }

    handleResize(gameSize) {
        const { width, height } = gameSize;

        // Force background to fill entire screen
        if (this.background) {
            this.background.setPosition(0, 0);
            this.background.setDisplaySize(width, height);
        }

        // Reposition Clock Out button
        if (this.clockOutBtn) {
            const margin = 20;
            this.clockOutBtn.setPosition(margin, margin);
            this.clockOutText.setPosition(margin + 60, margin + 20);
        }

        // Reposition Health indicator
        if (this.healthBarBg) {
            const margin = 20;
            this.healthBarBg.setPosition(width - margin - 150, margin);
            this.healthBarFill.setPosition(width - margin - 148, margin + 2);
            this.healthText.setPosition(width - margin - 75, margin + 20);
        }

        // Reposition Timer display
        if (this.timerContainer) {
            const margin = 20;
            this.timerContainer.setPosition(width / 2, margin);
        }

        // Reposition phone UI (smaller dimensions)
        if (this.phoneElements && this.phoneElements.length > 0) {
            const phoneWidth = 180;
            const phoneHeight = 140;
            const margin = 15;
            const phoneX = width - margin;
            const phoneY = height - margin;
            const headerHeight = 28;

            // Update phone UI positions
            this.phoneBackground.setPosition(phoneX, phoneY);
            this.phoneHeader.setPosition(phoneX - phoneWidth, phoneY - phoneHeight);
            this.phoneHeaderText.setPosition(phoneX - phoneWidth + 10, phoneY - phoneHeight + 7);
            this.phoneMinimizeBtn.setPosition(phoneX - 10, phoneY - phoneHeight + 7);

            const badgeX = phoneX - phoneWidth + 75;
            const badgeY = phoneY - phoneHeight + 9;
            this.notificationBadge.setPosition(badgeX, badgeY);
            this.notificationBadgeText.setPosition(badgeX, badgeY);
            this.messageArea.setPosition(phoneX - phoneWidth + 8, phoneY - phoneHeight + headerHeight + 3);

            // Update minimized phone icon position
            this.phoneMinimizedIcon.setPosition(phoneX - 25, phoneY - 25);
            this.phoneMinimizedText.setPosition(phoneX - 25, phoneY - 25);
            this.phoneMinimizedBadge.setPosition(phoneX - 10, phoneY - 38);
        }

        // Update darkness and vignette overlays
        if (this.darknessOverlay) {
            this.darknessOverlay.setSize(width, height);
        }

        // Recreate vignette for new dimensions
        if (this.vignette) {
            this.createVignette();
        }

        // Update typing overlay elements if they exist
        if (this.typingOverlayElements && this.typingOverlayElements.length > 0) {
            this.typingOverlay.setSize(width, height);
            this.documentBox.setPosition(width / 2, height / 2);
            this.documentTitle.setPosition(width / 2, height / 2 - 120);
            this.instructionText.setPosition(width / 2, height / 2 - 95);
            this.promptText.setPosition(width / 2, height / 2 - 60);
            this.divider.setPosition(width / 2, height / 2 - 10);
            this.typedLabel.setPosition(width / 2, height / 2 + 10);
            this.typedTextDisplay.setPosition(width / 2, height / 2 + 40);
            this.accuracyText.setPosition(width / 2, height / 2 + 90);
            this.feedbackText.setPosition(width / 2, height / 2 + 115);
        }

        // Update message overlay elements if open
        if (this.messageElements && this.messageElements.length > 0) {
            this.messageOverlay.setSize(width, height);
            this.messageBox.setPosition(width / 2, height / 2);
            this.messageBoxHeader.setPosition(width / 2, height / 2 - 110);
            this.messageBoxTitle.setPosition(width / 2 - 210, height / 2 - 120);
            this.messageCloseBtn.setPosition(width / 2 + 205, height / 2 - 120);
            this.messageContent.setPosition(width / 2, height / 2 - 35);
            this.pressEInstruction.setPosition(width / 2, height / 2 + 95);
        }
    }

    createPhoneUI() {
        const { width, height } = this.cameras.main;

        // Smaller phone container (bottom-right corner)
        const phoneWidth = 180;
        const phoneHeight = 140;
        const margin = 15;
        const phoneX = width - margin;
        const phoneY = height - margin;

        // Phone background (compact, phone-like)
        this.phoneBackground = this.add.rectangle(phoneX, phoneY, phoneWidth, phoneHeight, 0x000000, 0.95)
            .setOrigin(1, 1)
            .setDepth(200)
            .setStrokeStyle(2, 0x333333, 1);

        // Phone header bar
        const headerHeight = 28;
        this.phoneHeader = this.add.rectangle(phoneX - phoneWidth, phoneY - phoneHeight, phoneWidth, headerHeight, 0x1c1c1e)
            .setOrigin(0, 0)
            .setDepth(202);

        // Phone header text (smaller)
        this.phoneHeaderText = this.add.text(phoneX - phoneWidth + 10, phoneY - phoneHeight + 7, 'Messages', {
            fontSize: '11px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0).setDepth(203);

        // Minimize button
        this.phoneMinimizeBtn = this.add.text(phoneX - 10, phoneY - phoneHeight + 7, '−', {
            fontSize: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(1, 0).setDepth(203).setInteractive({ useHandCursor: true });

        this.phoneMinimizeBtn.on('pointerdown', () => {
            this.togglePhoneMinimize();
        });

        // Notification badge (hidden initially)
        const badgeX = phoneX - phoneWidth + 75;
        const badgeY = phoneY - phoneHeight + 9;
        this.notificationBadge = this.add.circle(badgeX, badgeY, 8, 0xff3b30)
            .setDepth(204)
            .setVisible(false);

        this.notificationBadgeText = this.add.text(badgeX, badgeY, '1', {
            fontSize: '9px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(205).setVisible(false);

        // Message list area (initially empty)
        this.messageArea = this.add.container(phoneX - phoneWidth + 8, phoneY - phoneHeight + headerHeight + 3).setDepth(203);

        // Minimized phone icon (hidden initially)
        this.phoneMinimizedIcon = this.add.circle(phoneX - 25, phoneY - 25, 20, 0x1c1c1e, 0.95)
            .setOrigin(0.5)
            .setDepth(200)
            .setStrokeStyle(2, 0x333333, 1)
            .setVisible(false)
            .setInteractive({ useHandCursor: true });

        this.phoneMinimizedIcon.on('pointerdown', () => {
            this.togglePhoneMinimize();
        });

        this.phoneMinimizedText = this.add.text(phoneX - 25, phoneY - 25, '💬', {
            fontSize: '16px',
        }).setOrigin(0.5).setDepth(201).setVisible(false);

        this.phoneMinimizedBadge = this.add.circle(phoneX - 10, phoneY - 38, 6, 0xff3b30)
            .setDepth(202)
            .setVisible(false);

        // Store phone elements
        this.phoneElements = [
            this.phoneBackground,
            this.phoneHeader,
            this.phoneHeaderText,
            this.phoneMinimizeBtn,
            this.notificationBadge,
            this.notificationBadgeText,
            this.messageArea
        ];

        this.phoneMinimizedElements = [
            this.phoneMinimizedIcon,
            this.phoneMinimizedText,
            this.phoneMinimizedBadge
        ];
    }

    createClockOutButton() {
        const { width } = this.cameras.main;
        const margin = 20;

        // Clock Out button background (more subtle, blends with background)
        this.clockOutBtn = this.add.rectangle(margin, margin, 120, 40, 0x0a0a0a, 0.4)
            .setOrigin(0, 0)
            .setDepth(100)
            .setStrokeStyle(1, 0x333333, 0.5)
            .setInteractive({ useHandCursor: true });

        // Clock Out text (more subtle)
        this.clockOutText = this.add.text(margin + 60, margin + 20, 'Clock Out', {
            fontSize: '13px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#666666',
            fontStyle: 'normal'
        }).setOrigin(0.5).setDepth(101);

        // Subtle idle pulse animation
        this.tweens.add({
            targets: [this.clockOutBtn, this.clockOutText],
            alpha: 0.6,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Button interaction
        this.clockOutBtn.on('pointerdown', () => {
            this.endWorkDay();
        });

        // Hover effect - fade in and glow
        this.clockOutBtn.on('pointerover', () => {
            // Kill the idle animation temporarily
            this.tweens.killTweensOf([this.clockOutBtn, this.clockOutText]);

            this.clockOutBtn.setFillStyle(0x1c1c1e, 0.8);
            this.clockOutBtn.setStrokeStyle(2, 0x4a90e2, 0.8);
            this.clockOutText.setColor('#4a90e2');

            this.tweens.add({
                targets: [this.clockOutBtn, this.clockOutText],
                alpha: 1,
                duration: 200,
                ease: 'Power2'
            });

            this.tweens.add({
                targets: this.clockOutBtn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });

        this.clockOutBtn.on('pointerout', () => {
            this.clockOutBtn.setFillStyle(0x0a0a0a, 0.4);
            this.clockOutBtn.setStrokeStyle(1, 0x333333, 0.5);
            this.clockOutText.setColor('#666666');

            this.tweens.add({
                targets: this.clockOutBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });

            // Restart idle pulse animation
            this.tweens.add({
                targets: [this.clockOutBtn, this.clockOutText],
                alpha: 0.6,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    createHealthIndicator() {
        const { width } = this.cameras.main;
        const margin = 20;

        // Health bar background
        this.healthBarBg = this.add.rectangle(width - margin - 150, margin, 150, 40, 0x1c1c1e, 0.9)
            .setOrigin(0, 0)
            .setDepth(100)
            .setStrokeStyle(2, 0x333333, 1);

        // Health bar fill (green, will shrink as health decreases)
        this.healthBarFill = this.add.rectangle(width - margin - 148, margin + 2, 146, 36, 0x2ecc71)
            .setOrigin(0, 0)
            .setDepth(101);

        // Health text
        this.healthText = this.add.text(width - margin - 75, margin + 20, 'Health: 100%', {
            fontSize: '13px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);
    }

    createTimerDisplay() {
        const { width } = this.cameras.main;
        const margin = 20;

        // Timer container (hidden initially, shown when typing starts)
        this.timerContainer = this.add.container(width / 2, margin).setDepth(100).setVisible(false);

        // Timer background
        const timerBg = this.add.rectangle(0, 0, 180, 50, 0x1c1c1e, 0.9)
            .setStrokeStyle(2, 0xff9900, 1);

        // Timer icon (clock emoji or symbol)
        const timerIcon = this.add.text(-65, 0, '⏱', {
            fontSize: '24px'
        }).setOrigin(0.5);

        // Timer text
        this.timerText = this.add.text(15, 0, 'Time: --', {
            fontSize: '18px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.timerContainer.add([timerBg, timerIcon, this.timerText]);
    }

    togglePhoneMinimize() {
        this.phoneMinimized = !this.phoneMinimized;

        if (this.phoneMinimized) {
            // Hide full phone UI
            this.phoneElements.forEach(el => el.setVisible(false));
            // Show minimized icon
            this.phoneMinimizedElements.forEach(el => el.setVisible(true));
            // Show badge on minimized icon if there's a notification
            if (this.notificationBadge.visible) {
                this.phoneMinimizedBadge.setVisible(true);
            }
        } else {
            // Show full phone UI
            this.phoneElements.forEach(el => el.setVisible(true));
            // Hide minimized icon
            this.phoneMinimizedElements.forEach(el => el.setVisible(false));
        }
    }

    showBossNotification() {
        const { width, height } = this.cameras.main;

        // Show notification badge
        this.notificationBadge.setVisible(true);
        this.notificationBadgeText.setVisible(true);

        // Pulse animation on badge
        this.tweens.add({
            targets: [this.notificationBadge, this.notificationBadgeText],
            scale: 1.2,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Boss message preview (compact for smaller phone)
        const messageWidth = 164;
        this.bossMessagePreview = this.add.rectangle(0, 0, messageWidth, 45, 0x1c1c1e)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(1, 0x2c2c2e);

        // Sender name
        this.bossNameText = this.add.text(8, 5, 'Boss', {
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0);

        // Time stamp
        this.messageTime = this.add.text(messageWidth - 8, 5, 'now', {
            fontSize: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#8e8e93'
        }).setOrigin(1, 0);

        // Message preview
        this.bossMessagePreviewText = this.add.text(8, 20, 'New assignment...', {
            fontSize: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
            color: '#8e8e93'
        }).setOrigin(0, 0);

        // Unread indicator dot
        this.unreadDot = this.add.circle(messageWidth - 12, 32, 3, 0x007aff)
            .setOrigin(0.5);

        // Add to message area container
        this.messageArea.add([this.bossMessagePreview, this.bossNameText, this.messageTime, this.bossMessagePreviewText, this.unreadDot]);

        // Click to open message
        this.bossMessagePreview.on('pointerdown', () => {
            this.openBossMessage();
        });

        // Hover effect (subtle highlight)
        this.bossMessagePreview.on('pointerover', () => {
            this.bossMessagePreview.setFillStyle(0x2c2c2e);
        });

        this.bossMessagePreview.on('pointerout', () => {
            this.bossMessagePreview.setFillStyle(0x1c1c1e);
        });
    }

    openBossMessage() {
        if (this.messageOpen) return;
        this.messageOpen = true;

        const { width, height } = this.cameras.main;

        // Hide notification badge
        this.notificationBadge.setVisible(false);
        this.notificationBadgeText.setVisible(false);

        // Create message overlay (semi-transparent) - depth 600+ to be above phone scenes (500)
        this.messageOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.6)
            .setOrigin(0)
            .setDepth(600)
            .setInteractive();

        // Message box (centered, looks like phone message)
        this.messageBox = this.add.rectangle(width / 2, height / 2, 450, 250, 0x1a1a1a)
            .setStrokeStyle(2, 0x444444)
            .setDepth(601);

        // Message header
        this.messageBoxHeader = this.add.rectangle(width / 2, height / 2 - 110, 450, 40, 0x2a2a2a)
            .setDepth(602);

        this.messageBoxTitle = this.add.text(width / 2 - 210, height / 2 - 120, 'Boss', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0).setDepth(603);

        // Close button
        this.messageCloseBtn = this.add.text(width / 2 + 205, height / 2 - 120, '✕', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(1, 0).setDepth(603).setInteractive({ useHandCursor: true });

        this.messageCloseBtn.on('pointerdown', () => {
            this.closeBossMessage();
        });

        // Message content
        const messageLines = [
            'Listen up. I need these documents',
            'typed EXACTLY as shown.',
            '',
            'Speed matters. Accuracy matters more.',
            '',
            'Press [E] to bring up the document',
            'and start working.',
            '',
            'Don\'t mess this up.'
        ];

        this.messageContent = this.add.text(width / 2, height / 2 - 35, messageLines.join('\n'), {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5).setDepth(603);

        // Press E instruction (highlighted)
        this.pressEInstruction = this.add.text(width / 2, height / 2 + 95, 'Press [E] to start', {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(603);

        // Pulse animation
        this.tweens.add({
            targets: this.pressEInstruction,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Store message elements
        this.messageElements = [
            this.messageOverlay,
            this.messageBox,
            this.messageBoxHeader,
            this.messageBoxTitle,
            this.messageCloseBtn,
            this.messageContent,
            this.pressEInstruction
        ];

        // Start listening for E key
        this.input.keyboard.on('keydown', this.handleDialogueKey);
    }

    closeBossMessage() {
        // Remove message elements
        if (this.messageElements) {
            this.messageElements.forEach(element => element.destroy());
            this.messageElements = null;
        }
        this.messageOpen = false;
    }

    createTypingOverlay() {
        const { width, height } = this.cameras.main;

        // Subtle overlay - much more transparent to see desk
        this.typingOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3)
            .setOrigin(0)
            .setDepth(50);

        // Compact document box - smaller and more professional
        this.documentBox = this.add.rectangle(width / 2, height / 2, 500, 280, 0x000000, 0.7)
            .setStrokeStyle(1, 0x555555)
            .setDepth(51);

        // Document title - subtle gray
        this.documentTitle = this.add.text(width / 2, height / 2 - 120, this.currentDocument.title, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(52);

        // Instructions - very subtle
        this.instructionText = this.add.text(width / 2, height / 2 - 95, 'Type the text below:', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0.5).setDepth(52);

        // Document prompt - what to type (subtle but readable)
        this.promptText = this.add.text(width / 2, height / 2 - 60, this.currentDocument.text, {
            fontSize: '14px',
            fontFamily: 'Courier New, monospace',
            color: '#e0e0e0',
            align: 'center',
            wordWrap: { width: 440 },
            backgroundColor: '#1a1a1a',
            padding: { x: 10, y: 8 }
        }).setOrigin(0.5).setDepth(52);

        // Divider - subtle gray
        this.divider = this.add.text(width / 2, height / 2 - 10, '──────────────────────────────', {
            fontSize: '12px',
            color: '#444444'
        }).setOrigin(0.5).setDepth(52);

        // Label for typed text - very subtle
        this.typedLabel = this.add.text(width / 2, height / 2 + 10, 'Your text:', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0.5).setDepth(52);

        // Player typed text - subtle monospace with light green tint
        this.typedTextDisplay = this.add.text(width / 2, height / 2 + 40, '|', {
            fontSize: '14px',
            fontFamily: 'Courier New, monospace',
            color: '#b8d4b8',
            align: 'center',
            wordWrap: { width: 440 },
            backgroundColor: '#0f0f0f',
            padding: { x: 10, y: 8 }
        }).setOrigin(0.5).setDepth(52);

        // Accuracy display - smaller and subtle
        this.accuracyText = this.add.text(width / 2, height / 2 + 90, '', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#b8d4b8'
        }).setOrigin(0.5).setDepth(52);

        // Feedback text - subtle
        this.feedbackText = this.add.text(width / 2, height / 2 + 115, 'Press Enter to submit', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0.5).setDepth(52);

        // Store overlay elements for easy show/hide
        this.typingOverlayElements = [
            this.typingOverlay,
            this.documentBox,
            this.documentTitle,
            this.instructionText,
            this.promptText,
            this.divider,
            this.typedLabel,
            this.typedTextDisplay,
            this.accuracyText,
            this.feedbackText
        ];
    }

    handleDialogueKey(event) {
        if (event.key.toLowerCase() === 'e' && this.messageOpen) {
            this.startWork();
        }
    }

    startWork() {
        // Close the boss message
        this.closeBossMessage();

        // Remove dialogue key handler
        this.input.keyboard.off('keydown', this.handleDialogueKey);

        // Auto-minimize phone to avoid overlap with typing UI
        if (!this.phoneMinimized) {
            this.togglePhoneMinimize();
        }

        // Create health visualization overlays
        const { width, height } = this.cameras.main;

        // Darkness overlay (increases as health drops)
        this.darknessOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0)
            .setOrigin(0)
            .setDepth(45); // Below typing overlay but above background

        // Vignette effect (darker edges)
        this.vignette = this.add.graphics();
        this.vignette.setDepth(46);
        this.createVignette();

        // Show typing overlay
        this.showTypingOverlay();

        // Add typing key handler (remove first to prevent duplicates)
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
        this.input.keyboard.on('keydown', this.handleKeyPress, this);

        // Start health drain
        this.healthDrainEvent = this.time.addEvent({
            delay: 100,
            callback: this.drainHealth,
            callbackScope: this,
            loop: true
        });

        // Initialize and show timer
        this.timeRemaining = this.currentDocument.timeLimit;

        // Make sure timer exists before showing it
        if (this.timerContainer) {
            this.timerContainer.setVisible(true);
        }

        // Start timer countdown
        this.timerEvent = this.time.addEvent({
            delay: 100,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Update timer display immediately
        this.updateTimer();

        // Phone call system already started in create() - no need to call again
    }

    createVignette() {
        const { width, height } = this.cameras.main;

        // Create radial gradient vignette effect
        this.vignette.clear();

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.max(width, height) * 0.7;

        // Draw multiple circles with increasing darkness
        for (let i = 0; i < 20; i++) {
            const alpha = (i / 20) * 0.5; // Max 50% opacity at edges
            const currentRadius = radius + (i * 30);
            this.vignette.fillStyle(0x000000, alpha);
            this.vignette.fillCircle(centerX, centerY, currentRadius);
        }

        this.vignette.setAlpha(0); // Start invisible
    }

    showTypingOverlay() {
        this.typingOverlayVisible = true;
        this.typingOverlayElements.forEach(element => element.setVisible(true));
    }

    hideTypingOverlay() {
        this.typingOverlayVisible = false;
        this.typingOverlayElements.forEach(element => element.setVisible(false));
    }

    drainHealth() {
        // Passive health drain
        this.health -= this.healthDrainRate;

        if (this.health <= 0) {
            this.health = 0;
            this.updateHealthVisualization();
            this.triggerHeartAttack();
        } else {
            this.updateHealthVisualization();
        }
    }

    handleKeyPress(event) {
        // Don't process keys if phone is ringing
        if (this.phoneActive) return;

        const key = event.key;

        if (key === 'Enter') {
            this.submitWork();
        } else if (key === 'Backspace') {
            this.typedText = this.typedText.slice(0, -1);
            this.updateTypedText();
        } else if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
            this.typedText += key;
            this.updateTypedText();
        }
    }

    submitWork() {
        const accuracy = this.calculateAccuracy();

        // Calculate payment based on accuracy
        let payment = 0;
        if (accuracy >= 95) {
            payment = this.currentDocument.payment;
            this.feedbackText.setText(`Perfect! ${accuracy}% accuracy! +$${payment}`).setColor('#b8d4b8');
        } else if (accuracy >= 80) {
            payment = Math.floor(this.currentDocument.payment * 0.8);
            this.feedbackText.setText(`Good work. ${accuracy}% accuracy. +$${payment}`).setColor('#a8b8d4');
        } else if (accuracy >= 60) {
            payment = Math.floor(this.currentDocument.payment * 0.5);
            this.feedbackText.setText(`Sloppy. Only ${accuracy}% accuracy. +$${payment}`).setColor('#d4c4a8');
        } else {
            this.feedbackText.setText(`Terrible! ${accuracy}% accuracy. No payment!`).setColor('#d4a8a8');
        }

        // Add money
        this.money += payment;
        this.documentsCompleted++;

        // Load next document after brief delay
        this.time.delayedCall(2000, () => {
            this.loadNextDocument();
        });
    }

    calculateAccuracy() {
        const target = this.currentDocument.text;
        const typed = this.typedText;

        if (typed.length === 0) return 0;

        let correctChars = 0;
        const maxLength = Math.max(target.length, typed.length);

        for (let i = 0; i < maxLength; i++) {
            if (target[i] === typed[i]) {
                correctChars++;
            }
        }

        return Math.floor((correctChars / target.length) * 100);
    }

    updateTypedText() {
        // Show typed text with cursor
        this.typedTextDisplay.setText(this.typedText + '|');

        // Calculate and show real-time accuracy
        const accuracy = this.calculateAccuracy();
        this.accuracyText.setText(`Accuracy: ${accuracy}%`);

        // Color accuracy based on performance - subtle office colors
        if (accuracy >= 90) {
            this.accuracyText.setColor('#b8d4b8'); // Subtle green
        } else if (accuracy >= 70) {
            this.accuracyText.setColor('#d4c4a8'); // Subtle yellow/beige
        } else {
            this.accuracyText.setColor('#d4a8a8'); // Subtle red/pink
        }
    }

    updateTimer() {
        if (!this.timerEvent) return; // Timer not active

        this.timeRemaining -= 0.1;

        if (this.timeRemaining <= 0) {
            this.timeExpired();
            return;
        }

        if (this.timerText) {
            const secondsLeft = Math.ceil(this.timeRemaining);
            this.timerText.setText(`Time: ${secondsLeft}s`);

            // Warning color and border animation
            if (this.timeRemaining <= 10) {
                this.timerText.setColor('#ff0000'); // Red - critical
                // Pulse animation for urgency
                if (!this.timerPulseActive) {
                    this.timerPulseActive = true;
                    this.tweens.add({
                        targets: this.timerContainer,
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 300,
                        yoyo: true,
                        repeat: -1
                    });
                }
            } else if (this.timeRemaining <= 20) {
                this.timerText.setColor('#ff9900'); // Orange - warning
            } else {
                this.timerText.setColor('#ffffff'); // White - normal
            }
        }
    }

    timeExpired() {
        if (this.timerEvent) this.timerEvent.remove();
        this.input.keyboard.off('keydown', this.handleKeyPress, this);

        this.feedbackText.setText('TIME\'S UP! No payment!').setColor('#d4a8a8');
        this.cameras.main.shake(300, 0.01);

        // Stop timer pulse animation
        this.timerPulseActive = false;
        this.tweens.killTweensOf(this.timerContainer);
        this.timerContainer.setScale(1);

        // No health deduction - let it drain naturally

        this.time.delayedCall(2000, () => {
            if (this.health <= 0) {
                this.triggerHeartAttack();
            } else {
                this.documentsCompleted++;
                this.loadNextDocument();
            }
        });
    }

    loadNextDocument() {
        // Get next document
        this.currentDocument = this.getDocument();
        this.typedText = '';

        // Update overlay with new document
        this.documentTitle.setText(this.currentDocument.title);
        this.promptText.setText(this.currentDocument.text);
        this.typedTextDisplay.setText('|');
        this.accuracyText.setText('');
        this.feedbackText.setText('Press Enter to submit').setColor('#888888');

        // Re-enable keyboard if it was disabled (e.g., from timeExpired)
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
        this.input.keyboard.on('keydown', this.handleKeyPress, this);

        // Reset timer for new document
        this.timeRemaining = this.currentDocument.timeLimit;
        this.timerPulseActive = false;
        this.tweens.killTweensOf(this.timerContainer); // Stop any pulse animation
        this.timerContainer.setScale(1); // Reset scale
        if (this.timerText) {
            this.timerText.setColor('#ffffff'); // Reset to white
        }
        this.updateTimer();
    }

    endWorkDay() {
        if (this.documentsCompleted === 0) {
            this.feedbackText.setText('Complete at least one document first!').setColor('#d4a8a8');
            this.time.delayedCall(2000, () => {
                this.feedbackText.setText('Press Enter to submit');
                this.feedbackText.setColor('#888888');
            });
            return;
        }

        // Clean up
        if (this.timerEvent) this.timerEvent.remove();
        if (this.healthDrainEvent) this.healthDrainEvent.remove();
        this.input.keyboard.off('keydown', this.handleKeyPress, this);

        // Stop office music before transitioning
        if (this.officeMusic) {
            this.officeMusic.stop();
            console.log('Office music stopped - transitioning to shop');
        }

        // Hide timer
        if (this.timerContainer) {
            this.timerContainer.setVisible(false);
        }

        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('EndOfDayScene', {
                workDay: this.workDay,
                money: this.money,
                ignoredCalls: this.ignoredCalls,
                totalCalls: this.totalCalls,
                health: this.health,
                usedDocuments: this.usedDocuments
            });
        });
    }

    schedulePhoneCall() {
        // Random time between 15-25 seconds (spaced out as requested)
        const delay = Phaser.Math.Between(15000, 25000);

        this.phoneCallTimeout = this.time.delayedCall(delay, () => {
            if (!this.phoneActive) {
                this.triggerPhoneCall();
            } else {
                this.schedulePhoneCall();
            }
        });
    }

    triggerPhoneCall() {
        this.phoneActive = true;
        this.totalCalls++;

        // Don't pause the scene - timer keeps running!
        this.scene.launch('PhoneInterruptionScene', {
            caller: this.getCaller(this.totalCalls),
            officeScene: this
        });
    }

    answerCall(caller) {
        // Keep phoneActive = true during conversation to prevent typing
        // Will be set to false in returnFromConversation()
        // Timer keeps running during conversation!
        this.scene.launch('ConversationScene', {
            caller: caller,
            officeScene: this
        });
    }

    ignoreCall(caller) {
        this.phoneActive = false;
        this.ignoredCalls++;

        // Re-enable keyboard input
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
        this.input.keyboard.on('keydown', this.handleKeyPress, this);

        // Lose health from guilt
        this.health -= 10;
        this.updateHealthVisualization();

        const guiltMessages = [
            'It can wait...',
            'You tell yourself you\'ll call back later.',
            'The work is more important. Right?',
            'They\'ll understand.',
            'Just one more document...'
        ];

        this.feedbackText.setText(guiltMessages[Math.min(this.ignoredCalls - 1, guiltMessages.length - 1)])
            .setColor('#999999');

        this.time.delayedCall(3000, () => {
            this.feedbackText.setText('Press Enter to submit');
            this.feedbackText.setColor('#888888');
        });

        this.schedulePhoneCall();
    }

    returnFromConversation(timeSpent) {
        this.phoneActive = false;

        // Re-enable keyboard input
        this.input.keyboard.off('keydown', this.handleKeyPress, this);
        this.input.keyboard.on('keydown', this.handleKeyPress, this);

        // Timer already kept running, but show boss feedback
        this.feedbackText.setText('Stop wasting time! Get back to work!').setColor('#d4a8a8');
        this.cameras.main.flash(200, 255, 0, 0);

        // Lose health
        this.health -= 8;
        this.updateHealthVisualization();

        this.time.delayedCall(3000, () => {
            this.feedbackText.setText('Press Enter to submit');
            this.feedbackText.setColor('#888888');
        });

        this.schedulePhoneCall();
    }

    updateHealthVisualization() {
        // Simple health bar update only - no fancy effects
        const healthPercent = Math.max(0, this.health / 100);

        // Update health bar UI
        if (this.healthBarFill && this.healthText) {
            const healthValue = Math.max(0, Math.floor(this.health));

            // Update health bar width
            this.healthBarFill.setDisplaySize(146 * healthPercent, 36);

            // Update health text
            this.healthText.setText(`Health: ${healthValue}%`);

            // Change color based on health level
            if (healthPercent > 0.7) {
                this.healthBarFill.setFillStyle(0x2ecc71); // Green
            } else if (healthPercent > 0.4) {
                this.healthBarFill.setFillStyle(0xff9900); // Orange
            } else {
                this.healthBarFill.setFillStyle(0xe74c3c); // Red
            }
        }

        if (this.health <= 0) {
            this.triggerHeartAttack();
        }
    }

    interpolateColor(color1, color2, factor) {
        // Extract RGB components
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;

        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;

        // Interpolate
        const r = Math.floor(r1 + (r2 - r1) * factor);
        const g = Math.floor(g1 + (g2 - g1) * factor);
        const b = Math.floor(b1 + (b2 - b1) * factor);

        // Combine back to hex
        return (r << 16) | (g << 8) | b;
    }

    getHealthColor(health) {
        if (health > 70) return '#00ff00';
        if (health > 40) return '#ff9900';
        return '#ff0000';
    }

    triggerHeartAttack() {
        // Prevent multiple triggers
        if (this.heartAttackTriggered) return;
        this.heartAttackTriggered = true;

        // Clean up events
        if (this.timerEvent) this.timerEvent.remove();
        if (this.healthDrainEvent) this.healthDrainEvent.remove();
        this.input.keyboard.off('keydown', this.handleKeyPress, this);

        // Stop office music before transitioning
        if (this.officeMusic) {
            this.officeMusic.stop();
            console.log('Office music stopped - transitioning to heart attack scene');
        }

        // CRITICAL: Kill all tweens to prevent callback errors during scene transition
        this.tweens.killAll();

        // Hide timer
        if (this.timerContainer) {
            this.timerContainer.setVisible(false);
        }

        // Transition to HeartAttackScene
        this.scene.start('HeartAttackScene', {
            ignoredCalls: this.ignoredCalls,
            totalCalls: this.totalCalls
        });
    }

    getCaller(callNumber) {
        const callers = [
            {
                name: 'Mom',
                relationship: 'Mother',
                actualAspect: 'Need for Family Connection',
                dialogue: [
                    { text: 'Hey honey, I haven\'t heard from you in weeks.' },
                    { text: 'Are you eating well? Getting enough rest?' },
                    { text: 'I worry about you, you know.' }
                ]
            },
            {
                name: 'Sarah',
                relationship: 'Girlfriend',
                actualAspect: 'Need for Intimacy and Love',
                dialogue: [
                    { text: 'Hey... it\'s me again.' },
                    { text: 'I feel like I haven\'t really talked to you in forever.' },
                    { text: 'Are we okay?' }
                ]
            },
            {
                name: 'Professor Chen',
                relationship: 'Academic Advisor',
                actualAspect: 'Need for Growth and Learning',
                dialogue: [
                    { text: 'I noticed you haven\'t been to office hours lately.' },
                    { text: 'You used to be so passionate about your studies.' },
                    { text: 'Is everything alright?' }
                ]
            },
            {
                name: 'Emma',
                relationship: 'Sister',
                actualAspect: 'Need for Play and Joy',
                dialogue: [
                    { text: 'When was the last time you actually had fun?' },
                    { text: 'Remember when we used to just hang out and laugh?' },
                    { text: 'You\'re not just a worker. You\'re my sibling.' }
                ]
            },
            {
                name: 'Marcus',
                relationship: 'Best Friend',
                actualAspect: 'Need for Friendship and Support',
                dialogue: [
                    { text: 'Dude, you\'ve been MIA for weeks.' },
                    { text: 'We all miss you. I miss you.' },
                    { text: 'Talk to me. What\'s going on?' }
                ]
            }
        ];

        return callers[Math.min(callNumber - 1, callers.length - 1)];
    }

    getDocument() {
        // Large pool of documents that get longer by day
        const allDocuments = [
            // DAY 1-2: Short documents (60-90 chars)
            { title: 'QUICK EMAIL', text: 'Meeting confirmed for tomorrow at two PM. Please bring the reports.', timeLimit: 35, payment: 40, minDay: 1 },
            { title: 'MEMO', text: 'All staff must complete training modules by end of week. No exceptions.', timeLimit: 35, payment: 40, minDay: 1 },
            { title: 'CLIENT NOTE', text: 'Thank you for your inquiry. We will respond within two business days.', timeLimit: 35, payment: 40, minDay: 1 },
            { title: 'STATUS BRIEF', text: 'Project alpha on schedule. Beta delayed by one week. Gamma cancelled.', timeLimit: 35, payment: 40, minDay: 1 },
            { title: 'REMINDER', text: 'Annual reviews due next month. Managers schedule meetings with your teams.', timeLimit: 38, payment: 42, minDay: 1 },

            // DAY 2-3: Medium documents (90-120 chars)
            { title: 'QUARTERLY UPDATE', text: 'Revenue increased by twelve percent this quarter. Operational costs remained stable. Market share expanded in key demographics.', timeLimit: 45, payment: 50, minDay: 2 },
            { title: 'CLIENT PROPOSAL', text: 'Thank you for considering our services. We propose a comprehensive solution that addresses your core business needs and objectives.', timeLimit: 48, payment: 52, minDay: 2 },
            { title: 'MEETING NOTES', text: 'Attendees discussed budget allocations for next fiscal year. Action items assigned to department heads. Follow-up meeting scheduled.', timeLimit: 48, payment: 52, minDay: 2 },
            { title: 'PROJECT REPORT', text: 'Timeline remains on track despite recent setbacks. Three major milestones completed ahead of schedule. Team morale is high.', timeLimit: 45, payment: 50, minDay: 2 },
            { title: 'PERFORMANCE MEMO', text: 'Employee productivity metrics show improvement across all departments. However, work-life balance concerns have been raised by staff.', timeLimit: 50, payment: 54, minDay: 2 },

            // DAY 3-4: Longer documents (120-160 chars)
            { title: 'DETAILED ANALYSIS', text: 'Market research indicates strong consumer demand in the northeast region. Competitors have reduced pricing significantly. We must adjust our strategy accordingly to maintain market position.', timeLimit: 60, payment: 60, minDay: 3 },
            { title: 'CONTRACT SUMMARY', text: 'The agreement stipulates delivery within thirty days of order confirmation. Payment terms net sixty. Late fees apply after grace period. Both parties must maintain confidentiality.', timeLimit: 62, payment: 62, minDay: 3 },
            { title: 'INCIDENT REPORT', text: 'Server downtime lasted approximately four hours yesterday evening. Technical team identified the root cause as hardware failure. Replacement parts ordered. System now stable and operational.', timeLimit: 65, payment: 64, minDay: 3 },
            { title: 'BUDGET PROPOSAL', text: 'Requesting additional funding for marketing initiatives in Q4. Projected ROI exceeds twenty percent based on previous campaigns. Detailed breakdown attached for your review and approval.', timeLimit: 65, payment: 64, minDay: 3 },
            { title: 'POLICY UPDATE', text: 'New remote work policy effective immediately. Employees may work from home up to three days per week with manager approval. Equipment requests must be submitted through the portal.', timeLimit: 62, payment: 62, minDay: 3 },

            // DAY 4-5: Very long documents (160-200 chars)
            { title: 'COMPREHENSIVE REVIEW', text: 'Annual performance review highlights significant achievements across multiple departments. Sales exceeded targets by eighteen percent. Customer satisfaction ratings improved. However, employee retention remains a concern requiring immediate attention and strategic planning.', timeLimit: 75, payment: 70, minDay: 4 },
            { title: 'STRATEGIC PLAN', text: 'Five-year growth strategy focuses on digital transformation and market expansion. Initial investment required substantial but projections indicate strong returns. Implementation begins next quarter with pilot programs in selected markets.', timeLimit: 78, payment: 72, minDay: 4 },
            { title: 'COMPLIANCE REPORT', text: 'Recent audit found minor discrepancies in documentation procedures. Corrective actions implemented immediately. Training sessions scheduled for all staff. Next audit expected in six months. Management committed to full compliance going forward.', timeLimit: 80, payment: 74, minDay: 4 },
            { title: 'CLIENT FEEDBACK', text: 'Survey results reveal high satisfaction with product quality and customer service. Areas for improvement include response times and technical support availability. Action plan developed to address these concerns systematically over the next quarter.', timeLimit: 82, payment: 76, minDay: 4 },
            { title: 'MERGER DETAILS', text: 'Acquisition talks progressing smoothly with target company. Due diligence phase nearly complete. Financial terms acceptable to both parties. Board approval expected next month. Integration planning already underway to ensure smooth transition process.', timeLimit: 82, payment: 76, minDay: 4 },

            // DAY 5+: Maximum length documents (200+ chars)
            { title: 'ANNUAL REPORT DRAFT', text: 'The fiscal year concluded with record-breaking revenues and substantial growth across all major product lines. International expansion proved highly successful, particularly in Asian markets. Challenges included supply chain disruptions and increased competition. Strategic initiatives for the coming year focus on innovation and sustainability.', timeLimit: 90, payment: 80, minDay: 5 },
            { title: 'LEGAL BRIEF', text: 'Case precedent supports our position regarding intellectual property claims. Discovery phase revealed significant evidence in our favor. Settlement negotiations ongoing but litigation remains an option if necessary. Legal counsel recommends maintaining current strategy while exploring alternative dispute resolution mechanisms.', timeLimit: 92, payment: 82, minDay: 5 },
            { title: 'RESEARCH FINDINGS', text: 'Study conducted over six months with two hundred participants. Results indicate statistically significant correlation between variables. Methodology rigorous and peer-reviewed. Implications for future product development substantial. Recommend immediate action to capitalize on these insights before competitors can respond effectively.', timeLimit: 95, payment: 84, minDay: 5 },
            { title: 'CRISIS MANAGEMENT', text: 'Recent data breach affected approximately five thousand customer accounts. Immediate response included system lockdown and password resets. Law enforcement notified. Public relations team prepared statement. Legal implications serious but manageable. Customer trust restoration our top priority moving forward with enhanced security measures.', timeLimit: 95, payment: 84, minDay: 5 },
            { title: 'BOARD PRESENTATION', text: 'Quarterly results exceed expectations despite challenging market conditions. New product launch highly successful with strong consumer reception. Organizational restructuring complete with minimal disruption. Forward guidance remains optimistic. Board recommends continued investment in research and development while maintaining fiscal discipline and operational excellence.', timeLimit: 98, payment: 86, minDay: 5 }
        ];

        // Filter documents appropriate for current day that haven't been used
        const availableDocs = allDocuments.filter(doc =>
            doc.minDay <= this.workDay && !this.usedDocuments.includes(doc.title)
        );

        // If all documents have been used, reset the pool but warn player
        if (availableDocs.length === 0) {
            this.usedDocuments = [];
            return this.getDocument();
        }

        // Select random document from available pool
        const selectedDoc = availableDocs[Math.floor(Math.random() * availableDocs.length)];

        // Mark as used
        this.usedDocuments.push(selectedDoc.title);

        return selectedDoc;
    }

    shutdown() {
        // Stop office background music
        if (this.officeMusic) {
            this.officeMusic.stop();
        }

        // Remove resize event listener to prevent null reference errors in other scenes
        this.scale.off('resize', this.handleResize, this);

        // Remove all keyboard listeners to prevent interference with other scenes
        this.input.keyboard.removeAllListeners();
    }
}
