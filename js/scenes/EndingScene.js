/**
 * EndingScene - Final message about self-care and reaching out
 *
 * Different messages based on how many calls you ignored
 */

class EndingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene' });
    }

    init(data) {
        this.ignoredCalls = data.ignoredCalls || 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

        // Fade in from black
        this.cameras.main.fadeIn(2000, 0, 0, 0);

        // Show message after fade
        this.time.delayedCall(2500, () => {
            this.showMessage();
        });
    }

    showMessage() {
        const { width, height} = this.cameras.main;

        let messages;

        if (this.ignoredCalls >= 4) {
            // Ignored most calls
            messages = [
                { text: 'You ignored most of the calls.', delay: 0 },
                { text: 'It\'s easier that way, isn\'t it?', delay: 2000 },
                { text: '', delay: 4000 },
                { text: 'But those weren\'t strangers calling.', delay: 5000 },
                { text: 'They were parts of you.', delay: 7000 },
                { text: 'Trying to reach you.', delay: 9000 },
                { text: '', delay: 11000 },
                { text: 'When you ignore yourself...', delay: 12000 },
                { text: 'Who\'s left to answer?', delay: 14000 }
            ];
        } else if (this.ignoredCalls >= 2) {
            // Ignored some calls
            messages = [
                { text: 'You answered some of the calls.', delay: 0 },
                { text: 'But not all of them.', delay: 2000 },
                { text: '', delay: 4000 },
                { text: 'Some parts of yourself...', delay: 5000 },
                { text: 'You still keep at arm\'s length.', delay: 7000 },
                { text: '', delay: 9000 },
                { text: 'That\'s okay.', delay: 10000 },
                { text: 'Listening is hard.', delay: 12000 },
                { text: 'But you\'re trying.', delay: 14000 }
            ];
        } else {
            // Answered all calls
            messages = [
                { text: 'You answered every call.', delay: 0 },
                { text: 'Even the hard ones.', delay: 2000 },
                { text: '', delay: 4000 },
                { text: 'You listened to every part of yourself.', delay: 5000 },
                { text: 'The fear. The hope. The guilt.', delay: 7000 },
                { text: 'All of it.', delay: 9000 },
                { text: '', delay: 11000 },
                { text: 'That takes courage.', delay: 12000 }
            ];
        }

        // Common ending message
        messages.push(
            { text: '', delay: 16000 },
            { text: 'You are all these voices.', delay: 17000 },
            { text: 'The scared one. The hopeful one.', delay: 19000 },
            { text: 'The one that wants to heal.', delay: 21000 },
            { text: '', delay: 23000 },
            { text: 'You don\'t have to pick up every call.', delay: 24000 },
            { text: 'But you have to listen to yourself.', delay: 26000 },
            { text: '', delay: 28000 },
            { text: 'You deserve that.', delay: 29000 }
        );

        let yOffset = height / 2 - 150;

        messages.forEach((msg, index) => {
            this.time.delayedCall(msg.delay, () => {
                if (msg.text === '') {
                    yOffset += 40; // Skip line
                } else {
                    const text = this.add.text(width / 2, yOffset, msg.text, {
                        fontSize: '18px',
                        fontFamily: 'Arial, sans-serif',
                        color: '#ffffff',
                        align: 'center',
                        wordWrap: { width: 600 }
                    }).setOrigin(0.5).setAlpha(0);

                    this.tweens.add({
                        targets: text,
                        alpha: 1,
                        duration: 1000,
                        ease: 'Sine.easeIn'
                    });

                    yOffset += 30;
                }
            });
        });

        // Show resources after all messages
        this.time.delayedCall(27000, () => {
            this.showResources();
        });
    }

    showResources() {
        const { width, height } = this.cameras.main;

        const resourceText = this.add.text(width / 2, height - 120,
            'If you\'re struggling:\n\n' +
            'Campus Counseling Services\n' +
            'Crisis Text Line: Text HOME to 741741\n' +
            'National Suicide Prevention Lifeline: 988', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: resourceText,
            alpha: 1,
            duration: 1500
        });

        // Restart option
        const restartText = this.add.text(width / 2, height - 30, 'Click to restart', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2'
        }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: restartText,
            alpha: 1,
            duration: 1500,
            delay: 1000
        });

        restartText.on('pointerdown', () => {
            this.scene.start('TypingScene');
        });
    }
}
