/**
 * RevealEndingScene - Final reveal about caller identities
 *
 * Calm yet daunting reveal that all callers were aspects of yourself
 */

class RevealEndingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RevealEndingScene' });
    }

    init(data) {
        this.ignoredCalls = data.ignoredCalls || 0;
        this.totalCalls = data.totalCalls || 0;
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

        // DEBUG: Click to place green dot (uses global window.debugCoordMode)
        this.input.on('pointerdown', (pointer) => {
            if (!window.debugCoordMode) return;
            this.add.circle(pointer.x, pointer.y, 5, 0x00ff00).setDepth(9999);
            console.log(`📍 Click: x=${Math.round(pointer.x)}, y=${Math.round(pointer.y)}`);
        });

        // Pure black background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

        // Fade in from black
        this.cameras.main.fadeIn(3000, 0, 0, 0);

        // Start the reveal sequence
        this.time.delayedCall(4000, () => {
            this.startReveal();
        });
    }

    startReveal() {
        const { width, height } = this.cameras.main;

        // Opening message
        const opening = this.add.text(width / 2, height / 2, 'The calls you received...', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: opening,
            alpha: 1,
            duration: 2000
        });

        this.time.delayedCall(4000, () => {
            this.tweens.add({
                targets: opening,
                alpha: 0,
                duration: 1500
            });
        });

        this.time.delayedCall(6000, () => {
            this.showCallerReveals();
        });
    }

    showCallerReveals() {
        const { width, height } = this.cameras.main;

        const reveals = [
            { name: 'Mom', was: 'Your need for connection' },
            { name: 'Sarah', was: 'Your need for love' },
            { name: 'Professor Chen', was: 'Your need to grow' },
            { name: 'Emma', was: 'Your need for joy' },
            { name: 'Marcus', was: 'Your need for friendship' }
        ];

        let delay = 0;
        reveals.forEach((reveal, index) => {
            this.time.delayedCall(delay, () => {
                this.revealSingleCaller(reveal, width, height, index);
            });
            delay += 5000; // 5 seconds between each reveal
        });

        // Show final truth after all reveals
        this.time.delayedCall(delay + 2000, () => {
            this.showFinalTruth();
        });
    }

    revealSingleCaller(reveal, width, height, index) {
        // Calculate vertical spacing to stack them
        const yPos = height / 2 - 150 + (index * 60);

        // Get profile picture key
        const profileKey = this.getProfileKey(reveal.name);
        let profilePic = null;
        let profileBg = null;

        if (profileKey && this.textures.exists(profileKey)) {
            // Add background circle so image is visible even with dark backgrounds
            profileBg = this.add.circle(width / 2 - 100, yPos, 21, 0x333333)
                .setAlpha(0);

            // Show profile picture (small, left of name)
            profilePic = this.add.image(width / 2 - 100, yPos, profileKey)
                .setDisplaySize(40, 40)
                .setOrigin(0.5)
                .setAlpha(0);

            // Create circular mask
            const maskCircle = this.make.graphics({ x: 0, y: 0, add: false });
            maskCircle.fillStyle(0xffffff);
            maskCircle.fillCircle(width / 2 - 100, yPos, 20);
            const mask = maskCircle.createGeometryMask();
            profilePic.setMask(mask);

            // Fade in both background and profile picture
            this.tweens.add({
                targets: [profileBg, profilePic],
                alpha: 1,
                duration: 1500
            });
        }

        // Show caller name first
        const nameText = this.add.text(width / 2, yPos, reveal.name, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: nameText,
            alpha: 1,
            duration: 1500
        });

        // After 2 seconds, show "wasn't calling"
        this.time.delayedCall(2000, () => {
            const wasntText = this.add.text(width / 2, yPos + 25, 'wasn\'t calling.', {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#555555',
                align: 'center',
                fontStyle: 'italic'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: wasntText,
                alpha: 1,
                duration: 1000
            });

            // Fade out the name
            this.tweens.add({
                targets: nameText,
                alpha: 0.3,
                duration: 1000,
                delay: 500
            });
        });

        // After 3.5 seconds, reveal the truth
        this.time.delayedCall(3500, () => {
            // Fade out profile picture, background, and name
            const fadeTargets = [nameText];
            if (profilePic) {
                fadeTargets.push(profilePic);
            }
            if (profileBg) {
                fadeTargets.push(profileBg);
            }

            this.tweens.add({
                targets: fadeTargets,
                alpha: 0,
                duration: 500
            });

            // Show what it actually was
            const truthText = this.add.text(width / 2, yPos, reveal.was, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: truthText,
                alpha: 1,
                duration: 1500,
                delay: 500
            });
        });
    }

    showFinalTruth() {
        const { width, height } = this.cameras.main;

        // Fade out all previous text
        this.tweens.add({
            targets: this.children.list,
            alpha: 0,
            duration: 2500
        });

        this.time.delayedCall(3000, () => {
            // Central devastating message
            const messages = [
                { text: 'They were never calling.', delay: 0, size: '28px', color: '#ffffff' },
                { text: '', delay: 3000 },
                { text: 'You were.', delay: 4000, size: '32px', color: '#ffffff', bold: true },
                { text: '', delay: 7000 },
                { text: 'Every missed call...', delay: 8000, size: '20px', color: '#888888' },
                { text: 'Every ignored ring...', delay: 10000, size: '20px', color: '#888888' },
                { text: '', delay: 12000 },
                { text: 'Was you,', delay: 13000, size: '24px', color: '#ff6b6b' },
                { text: 'Trying to reach yourself.', delay: 15000, size: '24px', color: '#ff6b6b' },
                { text: '', delay: 18000 },
                { text: 'But work was more important.', delay: 19000, size: '18px', color: '#666666' },
                { text: '', delay: 22000 },
                { text: 'Until it killed you.', delay: 23000, size: '22px', color: '#ff4444' }
            ];

            let yPos = height / 2 - 150;

            messages.forEach(msg => {
                this.time.delayedCall(msg.delay, () => {
                    if (msg.text === '') {
                        yPos += 25;
                    } else {
                        const text = this.add.text(width / 2, yPos, msg.text, {
                            fontSize: msg.size,
                            fontFamily: 'Arial, sans-serif',
                            color: msg.color,
                            align: 'center',
                            fontStyle: msg.bold ? 'bold' : 'normal'
                        }).setOrigin(0.5).setAlpha(0);

                        this.tweens.add({
                            targets: text,
                            alpha: 1,
                            duration: 2000,
                            ease: 'Sine.easeIn'
                        });

                        yPos += 35;
                    }
                });
            });

            // Show statistics and closing
            this.time.delayedCall(27000, () => {
                this.showClosing();
            });
        });
    }

    showClosing() {
        const { width, height } = this.cameras.main;

        // Fade out everything slowly
        this.tweens.add({
            targets: this.children.list,
            alpha: 0,
            duration: 3000
        });

        this.time.delayedCall(4000, () => {
            // Statistics
            const ignoredPercent = this.totalCalls > 0 ? Math.floor((this.ignoredCalls / this.totalCalls) * 100) : 0;

            const statsText = this.add.text(width / 2, height / 2 - 80,
                `Ignored calls: ${this.ignoredCalls} of ${this.totalCalls}\n\n` +
                `${ignoredPercent}% of yourself... silenced.`, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#666666',
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: statsText,
                alpha: 1,
                duration: 2000
            });

            // Final message
            this.time.delayedCall(4000, () => {
                const finalText = this.add.text(width / 2, height / 2 + 20,
                    'Work will always be there.\n\nYou won\'t.', {
                    fontSize: '24px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#ffffff',
                    align: 'center',
                    lineSpacing: 15,
                    fontStyle: 'bold'
                }).setOrigin(0.5).setAlpha(0);

                this.tweens.add({
                    targets: finalText,
                    alpha: 1,
                    duration: 2500
                });
            });

            // Self-care message
            this.time.delayedCall(7000, () => {
                const selfCareText = this.add.text(width / 2, height / 2 + 100,
                    'Always take care of yourself.\nNothing is more important than your life.', {
                    fontSize: '20px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#4a90e2',
                    align: 'center',
                    lineSpacing: 10,
                    fontStyle: 'italic'
                }).setOrigin(0.5).setAlpha(0);

                this.tweens.add({
                    targets: selfCareText,
                    alpha: 1,
                    duration: 2500
                });
            });

            // Resources
            this.time.delayedCall(8000, () => {
                const resourceText = this.add.text(width / 2, height - 90,
                    'If you\'re struggling:\n' +
                    'National Suicide Prevention Lifeline: 988\n' +
                    'Crisis Text Line: Text HOME to 741741', {
                    fontSize: '11px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#444444',
                    align: 'center',
                    lineSpacing: 5
                }).setOrigin(0.5).setAlpha(0);

                this.tweens.add({
                    targets: resourceText,
                    alpha: 1,
                    duration: 2000
                });
            });

            // Restart option
            this.time.delayedCall(10000, () => {
                const restartText = this.add.text(width / 2, height - 30, 'Click to restart', {
                    fontSize: '13px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#4a90e2'
                }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

                this.tweens.add({
                    targets: restartText,
                    alpha: 0.7,
                    duration: 1000
                });

                // Pulse effect
                this.tweens.add({
                    targets: restartText,
                    alpha: 0.4,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    delay: 1000
                });

                restartText.on('pointerdown', () => {
                    this.scene.start('OfficeScene', {
                        workDay: 1,
                        ignoredCalls: 0,
                        totalCalls: 0,
                        health: 100
                    });
                });
            });
        });
    }
}
