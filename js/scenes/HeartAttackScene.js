/**
 * HeartAttackScene - Death sequence
 *
 * Player dies from overwork, heart attack at desk
 */

class HeartAttackScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HeartAttackScene' });
    }

    init(data) {
        this.ignoredCalls = data.ignoredCalls || 0;
        this.totalCalls = data.totalCalls || 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark background
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

        // Red overlay for heart attack effect
        this.redOverlay = this.add.rectangle(0, 0, width, height, 0xff0000, 0).setOrigin(0);

        console.log('HeartAttackScene starting...');

        // Sequence of events
        this.time.delayedCall(1000, () => {
            this.showChestPain();
        });
    }

    showChestPain() {
        const { width, height } = this.cameras.main;

        console.log('Showing chest pain...');

        const text1 = this.add.text(width / 2, height / 2 - 50, 'Your chest tightens.', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: text1,
            alpha: 1,
            duration: 1000
        });

        // Red flash effect using overlay
        this.time.delayedCall(2000, () => {
            this.cameras.main.shake(500, 0.02);

            // Flash red overlay
            this.tweens.add({
                targets: this.redOverlay,
                alpha: 0.3,
                duration: 200,
                yoyo: true,
                repeat: 1
            });
        });

        this.time.delayedCall(3500, () => {
            this.showBreathingDifficulty();
        });
    }

    showBreathingDifficulty() {
        const { width, height } = this.cameras.main;

        console.log('Showing breathing difficulty...');

        const text2 = this.add.text(width / 2, height / 2, 'You can\'t breathe.', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff4444',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: text2,
            alpha: 1,
            duration: 800
        });

        // More intense red flash
        this.time.delayedCall(1500, () => {
            this.cameras.main.shake(800, 0.03);

            this.tweens.add({
                targets: this.redOverlay,
                alpha: 0.5,
                duration: 300,
                yoyo: true,
                repeat: 1
            });
        });

        this.time.delayedCall(3500, () => {
            this.showCollapse();
        });
    }

    showCollapse() {
        const { width, height } = this.cameras.main;

        console.log('Showing collapse...');

        const text3 = this.add.text(width / 2, height / 2 + 50, 'You collapse at your desk.', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff0000',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: text3,
            alpha: 1,
            duration: 600
        });

        // Final shake and red pulse
        this.time.delayedCall(1000, () => {
            this.cameras.main.shake(1000, 0.04);

            this.tweens.add({
                targets: this.redOverlay,
                alpha: 0.7,
                duration: 500,
                yoyo: true
            });
        });

        this.time.delayedCall(3500, () => {
            this.showDeath();
        });
    }

    showDeath() {
        const { width, height } = this.cameras.main;

        console.log('=== SHOWING DEATH SEQUENCE ===');

        // Fade to black (fade out red overlay first)
        this.tweens.add({
            targets: this.redOverlay,
            alpha: 0,
            duration: 1000
        });

        // Fade all text to black
        this.cameras.main.fade(2000, 0, 0, 0);

        // Show final text
        const deathText = this.add.text(width / 2, height / 2, 'Everything goes dark.', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#666666',
            align: 'center',
            fontStyle: 'italic'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: deathText,
            alpha: 1,
            duration: 1500,
            delay: 300
        });

        // Fade out the text
        this.tweens.add({
            targets: deathText,
            alpha: 0,
            duration: 1500,
            delay: 2500
        });

        // CRITICAL FIX: Transition to ending reveal with full scene stop
        this.time.delayedCall(4500, () => {
            console.log('=== TRANSITIONING TO REVEAL ENDING SCENE ===');
            console.log('Data being passed:', {
                ignoredCalls: this.ignoredCalls,
                totalCalls: this.totalCalls
            });

            // Stop this scene completely before starting next
            this.scene.stop('HeartAttackScene');
            this.scene.start('RevealEndingScene', {
                ignoredCalls: this.ignoredCalls,
                totalCalls: this.totalCalls
            });
        });
    }
}
