/**
 * PhoneInterruptionScene - GTA-style phone call with 3D phone object
 *
 * Shows realistic phone sliding up from bottom-right
 */

class PhoneInterruptionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PhoneInterruptionScene' });
    }

    init(data) {
        this.caller = data.caller;
        this.officeScene = data.officeScene;
    }

    getProfileKey(callerName) {
        const mapping = {
            'Mom': 'profile_mom',
            'Sarah': 'profile_sarah',
            'Professor Chen': 'profile_professor_chen',
            'Emma': 'profile_emma',
            'Marcus': 'profile_marcus'
        };
        return mapping[callerName] || null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Create phone container
        this.phoneContainer = this.add.container(0, 0).setDepth(500);

        // Phone dimensions
        const phoneWidth = 220;
        const phoneHeight = 420;
        const phoneX = width - 130; // Bottom-right positioning
        const phoneStartY = height + phoneHeight / 2; // Start off-screen
        const phoneEndY = height - phoneHeight / 2 - 30; // Final position

        // Create 3D phone sprite
        this.createPhoneSprite(phoneWidth, phoneHeight);

        // Position phone off-screen initially
        this.phoneContainer.setPosition(phoneX, phoneStartY);

        // Slide phone up animation
        this.tweens.add({
            targets: this.phoneContainer,
            y: phoneEndY,
            duration: 500,
            ease: 'Back.easeOut'
        });

        // Add phone screen content
        this.createPhoneScreen(phoneWidth, phoneHeight);

        // Vibration effect
        this.time.delayedCall(500, () => {
            this.vibratePhone();
        });
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

    createPhoneScreen(phoneWidth, phoneHeight) {
        const screenY = -40;

        // Status bar time
        const timeText = this.add.text(0, -(phoneHeight / 2) + 35, '9:41', {
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.phoneContainer.add(timeText);

        // Get profile picture key
        const profileKey = this.getProfileKey(this.caller.name);
        console.log('[PhoneInterruptionScene] Caller:', this.caller.name);
        console.log('[PhoneInterruptionScene] Profile key:', profileKey);
        console.log('[PhoneInterruptionScene] Texture exists:', profileKey ? this.textures.exists(profileKey) : 'N/A');

        if (profileKey && this.textures.exists(profileKey)) {
            console.log('[PhoneInterruptionScene] ✅ Showing profile picture for', this.caller.name);

            // Show actual profile picture (without mask for now - white screen helps hide checkered bg)
            const profilePic = this.add.image(0, screenY - 60, profileKey)
                .setOrigin(0.5)
                .setDisplaySize(80, 80); // Circle diameter = 80 (radius 40)

            this.phoneContainer.add(profilePic);

            console.log('[PhoneInterruptionScene] Profile pic added at:', profilePic.x, profilePic.y);
            console.log('[PhoneInterruptionScene] Profile pic size:', profilePic.displayWidth, 'x', profilePic.displayHeight);
        } else {
            console.log('[PhoneInterruptionScene] ⚠️ Falling back to initials for', this.caller.name);
            // Fallback to generic circle with initials if no profile picture
            const callerPhoto = this.add.circle(0, screenY - 60, 40, 0x4a90e2);
            this.phoneContainer.add(callerPhoto);

            const initials = this.caller.name.split(' ').map(n => n[0]).join('');
            const initialsText = this.add.text(0, screenY - 60, initials, {
                fontSize: '24px',
                fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
                color: '#ffffff', // Keep white for the blue circle background
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.phoneContainer.add(initialsText);
        }

        // Caller name
        const nameText = this.add.text(0, screenY, this.caller.name, {
            fontSize: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.phoneContainer.add(nameText);

        // Caller relationship
        const relationText = this.add.text(0, screenY + 25, this.caller.relationship, {
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#888888'
        }).setOrigin(0.5);
        this.phoneContainer.add(relationText);

        // "incoming call" text with pulse
        const incomingText = this.add.text(0, screenY + 55, 'incoming call...', {
            fontSize: '13px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#4a90e2'
        }).setOrigin(0.5);
        this.phoneContainer.add(incomingText);

        this.tweens.add({
            targets: incomingText,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Answer button (green circle)
        const answerBtn = this.add.circle(-50, screenY + 130, 35, 0x2ecc71);
        answerBtn.setInteractive({ useHandCursor: true });
        answerBtn.setStrokeStyle(3, 0x27ae60);
        this.phoneContainer.add(answerBtn);

        const answerIcon = this.add.text(-50, screenY + 130, '📞', {
            fontSize: '28px'
        }).setOrigin(0.5);
        this.phoneContainer.add(answerIcon);

        const answerLabel = this.add.text(-50, screenY + 175, 'Answer', {
            fontSize: '11px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.phoneContainer.add(answerLabel);

        // Decline button (red circle)
        const declineBtn = this.add.circle(50, screenY + 130, 35, 0xe74c3c);
        declineBtn.setInteractive({ useHandCursor: true });
        declineBtn.setStrokeStyle(3, 0xc0392b);
        this.phoneContainer.add(declineBtn);

        const declineIcon = this.add.text(50, screenY + 130, '✕', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.phoneContainer.add(declineIcon);

        const declineLabel = this.add.text(50, screenY + 175, 'Decline', {
            fontSize: '11px',
            fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.phoneContainer.add(declineLabel);

        // Button interactions
        answerBtn.on('pointerdown', () => {
            this.answerCall();
        });

        declineBtn.on('pointerdown', () => {
            this.declineCall();
        });

        // Hover effects
        answerBtn.on('pointerover', () => {
            this.tweens.add({
                targets: answerBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });
        answerBtn.on('pointerout', () => {
            this.tweens.add({
                targets: answerBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        declineBtn.on('pointerover', () => {
            this.tweens.add({
                targets: declineBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });
        declineBtn.on('pointerout', () => {
            this.tweens.add({
                targets: declineBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });
    }

    vibratePhone() {
        // Subtle vibration effect
        this.tweens.add({
            targets: this.phoneContainer,
            x: this.phoneContainer.x + 3,
            duration: 50,
            yoyo: true,
            repeat: 5
        });

        // Repeat vibration
        this.time.delayedCall(1500, () => {
            if (this.scene.isActive()) {
                this.vibratePhone();
            }
        });
    }

    answerCall() {
        // Stop vibration
        this.tweens.killTweensOf(this.phoneContainer);

        // Phone stays visible, transition to conversation
        this.scene.stop();
        this.officeScene.answerCall(this.caller);
    }

    declineCall() {
        // Slide phone back down
        const { height } = this.cameras.main;

        this.tweens.add({
            targets: this.phoneContainer,
            y: height + 250,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.scene.stop();
                this.scene.resume('OfficeScene');
                this.officeScene.ignoreCall(this.caller);
            }
        });
    }
}
