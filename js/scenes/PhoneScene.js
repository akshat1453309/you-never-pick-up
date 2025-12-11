/**
 * PhoneScene - "You Never Pick Up"
 *
 * A phone conversation game about guilt, self-neglect, and isolation.
 * All callers are aspects of yourself calling out to you.
 */

class PhoneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PhoneScene' });
    }

    init(data) {
        this.callNumber = data.callNumber || 1;
        this.ignoredCalls = data.ignoredCalls || 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark, isolating background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Get current caller data
        const caller = this.getCallerData(this.callNumber);

        // Phone display (like a phone screen)
        const phoneX = width / 2;
        const phoneY = height / 2;

        // Phone screen background
        this.add.rectangle(phoneX, phoneY, 400, 600, 0x0f0f1e)
            .setStrokeStyle(4, 0x16213e);

        // Caller info
        this.add.text(phoneX, phoneY - 150, caller.name, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(phoneX, phoneY - 100, caller.label, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0.5);

        // Ringing animation
        this.ringText = this.add.text(phoneX, phoneY, 'Ringing...', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.ringText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buttons
        const buttonY = phoneY + 150;

        // Answer button (green)
        const answerButton = this.add.rectangle(phoneX - 80, buttonY, 140, 50, 0x2ecc71)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0x27ae60);

        this.add.text(phoneX - 80, buttonY, 'Answer', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Ignore button (red)
        const ignoreButton = this.add.rectangle(phoneX + 80, buttonY, 140, 50, 0xe74c3c)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xc0392b);

        this.add.text(phoneX + 80, buttonY, 'Ignore', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stats at bottom
        this.add.text(phoneX, height - 40, `Call ${this.callNumber} | Ignored: ${this.ignoredCalls}`, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#666666'
        }).setOrigin(0.5);

        // Button interactions
        answerButton.on('pointerdown', () => {
            this.answerCall(caller);
        });

        ignoreButton.on('pointerdown', () => {
            this.ignoreCall(caller);
        });

        // Hover effects
        answerButton.on('pointerover', () => answerButton.setFillStyle(0x27ae60));
        answerButton.on('pointerout', () => answerButton.setFillStyle(0x2ecc71));

        ignoreButton.on('pointerover', () => ignoreButton.setFillStyle(0xc0392b));
        ignoreButton.on('pointerout', () => ignoreButton.setFillStyle(0xe74c3c));
    }

    getCallerData(callNumber) {
        const callers = [
            {
                name: 'Inner Voice',
                label: 'The part of you that knows',
                dialogue: [
                    { speaker: 'Inner Voice', text: 'Hey... it\'s me. You know, the part of you that knows you\'re not okay.' },
                    { speaker: 'Inner Voice', text: 'I\'ve been trying to reach you for weeks now.' },
                    { speaker: 'Inner Voice', text: 'You can\'t keep ignoring this. Ignoring me. Ignoring yourself.' }
                ]
            },
            {
                name: 'Hope',
                label: 'The part of you that still believes',
                dialogue: [
                    { speaker: 'Hope', text: 'I know you\'re there. I know you can hear me.' },
                    { speaker: 'Hope', text: 'Things can get better. They really can.' },
                    { speaker: 'Hope', text: 'But you have to let me in. You have to want to feel better.' }
                ]
            },
            {
                name: 'Fear',
                label: 'The part of you that\'s scared',
                dialogue: [
                    { speaker: 'Fear', text: 'What if you never get better?' },
                    { speaker: 'Fear', text: 'What if everyone finds out how much you\'re struggling?' },
                    { speaker: 'Fear', text: 'What if asking for help makes it worse?' }
                ]
            },
            {
                name: 'Self-Care',
                label: 'The part of you that wants to heal',
                dialogue: [
                    { speaker: 'Self-Care', text: 'You haven\'t eaten properly in days.' },
                    { speaker: 'Self-Care', text: 'When was the last time you did something just because it made you feel good?' },
                    { speaker: 'Self-Care', text: 'You deserve to take care of yourself. Please.' }
                ]
            },
            {
                name: 'Guilt',
                label: 'The part of you that remembers',
                dialogue: [
                    { speaker: 'Guilt', text: 'You said you\'d call mom back. You didn\'t.' },
                    { speaker: 'Guilt', text: 'Your friends keep asking if you\'re okay. You keep lying.' },
                    { speaker: 'Guilt', text: 'How long can you keep this up?' }
                ]
            },
            {
                name: 'Truth',
                label: 'The part of you that sees clearly',
                dialogue: [
                    { speaker: 'Truth', text: 'This is the last call.' },
                    { speaker: 'Truth', text: 'You\'ve been running from yourself for so long.' },
                    { speaker: 'Truth', text: 'The only person you\'re really ignoring... is you.' }
                ]
            }
        ];

        return callers[Math.min(callNumber - 1, callers.length - 1)];
    }

    answerCall(caller) {
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('ConversationScene', {
                caller: caller,
                callNumber: this.callNumber,
                ignoredCalls: this.ignoredCalls
            });
        });
    }

    ignoreCall(caller) {
        // Visual feedback
        this.cameras.main.flash(200, 100, 0, 0);

        // Show consequence text
        const consequenceTexts = [
            'It\'s easier not to answer.',
            'You tell yourself you\'ll deal with it later.',
            'The silence is comforting. And terrifying.',
            'Another call ignored.',
            'You feel the weight of it.',
            'How many more can you ignore?'
        ];

        const text = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100,
            consequenceTexts[Math.min(this.ignoredCalls, consequenceTexts.length - 1)], {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#e74c3c',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 500,
            hold: 1500,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.nextCall(true);
            }
        });
    }

    nextCall(wasIgnored) {
        const nextCallNumber = this.callNumber + 1;
        const newIgnoredCount = wasIgnored ? this.ignoredCalls + 1 : this.ignoredCalls;

        if (nextCallNumber > 6) {
            // Game over
            this.scene.start('EndingScene', { ignoredCalls: newIgnoredCount });
        } else {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.restart({
                    callNumber: nextCallNumber,
                    ignoredCalls: newIgnoredCount
                });
            });
        }
    }
}
