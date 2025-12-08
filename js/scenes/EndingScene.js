/**
 * EndingScene - Final message and reflection
 *
 * Shows after Phase 5, delivers the core message about asking for help
 */

class EndingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene' });
    }

    init(data) {
        this.guiltLevel = data.guiltLevel || 0;
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
        const { width, height } = this.cameras.main;

        const messages = [
            {
                text: 'You spent weeks saying "I\'m fine."',
                delay: 0
            },
            {
                text: 'You weren\'t fine.',
                delay: 2000
            },
            {
                text: 'Everyone who asked knew that.',
                delay: 4000
            },
            {
                text: 'They were giving you permission to be honest.',
                delay: 6000
            },
            {
                text: 'You didn\'t take it.',
                delay: 8000
            },
            {
                text: '',
                delay: 10000
            },
            {
                text: 'It\'s not weakness to struggle.',
                delay: 11000
            },
            {
                text: 'It\'s not failure to ask for help.',
                delay: 13000
            },
            {
                text: 'It\'s not giving up to admit you\'re drowning.',
                delay: 15000
            },
            {
                text: '',
                delay: 17000
            },
            {
                text: 'The people who care about you don\'t want "I\'m fine."',
                delay: 18000
            },
            {
                text: 'They want the truth.',
                delay: 20000
            },
            {
                text: 'Even if the truth is "I\'m not okay."',
                delay: 22000
            },
            {
                text: '',
                delay: 24000
            },
            {
                text: 'Especially then.',
                delay: 25000
            }
        ];

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
