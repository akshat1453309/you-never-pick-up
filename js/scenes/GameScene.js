/**
 * GameScene - Echo/Blindness Stealth Game
 *
 * You're in complete darkness. Use echo pulses to reveal your surroundings,
 * but each pulse calls the monster to you. Stay silent and still to survive.
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Initialize or carry over timer from previous level
        this.totalTimeRemaining = data.timeRemaining !== undefined ? data.timeRemaining : 180; // 3 minutes = 180 seconds
        this.currentLevel = data.level || 1;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Enable Arcade Physics
        this.physics.world.setBounds(0, 0, width, height);

        // ======================
        // CREATE THE PLAYER
        // ======================
        // Draw player as blue circle using graphics (BIGGER for tougher gameplay)
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x4a90e2, 1);
        playerGraphics.fillCircle(0, 0, 15); // Circle with radius 15 (bigger!)
        playerGraphics.generateTexture('player', 30, 30);
        playerGraphics.destroy();

        // Create player sprite with physics
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(0); // Below darkness layer

        // ======================
        // CREATE WALLS (OBSTACLES)
        // ======================
        this.walls = this.physics.add.staticGroup();

        // Get level-specific wall layout
        const levelLayout = this.getLevelLayout(this.currentLevel);

        // Create walls from layout
        levelLayout.walls.forEach((wallData, i) => {
            // Draw wall rectangle (WHITE for better visibility)
            const wallGraphics = this.add.graphics();
            wallGraphics.fillStyle(0xffffff, 1); // White walls
            wallGraphics.fillRect(0, 0, wallData.w, wallData.h);
            wallGraphics.generateTexture(`wall${i}`, wallData.w, wallData.h);
            wallGraphics.destroy();

            // Create wall sprite
            const wall = this.walls.create(wallData.x, wallData.y, `wall${i}`);
            wall.setOrigin(0.5);
            wall.setDepth(0); // Make sure walls are below darkness layer
            wall.refreshBody();
        });

        // Set player and exit positions from layout
        this.player.setPosition(levelLayout.playerStart.x, levelLayout.playerStart.y);

        // Add collision between player and walls
        this.physics.add.collider(this.player, this.walls);

        // ======================
        // EXIT DOOR
        // ======================
        const exitGraphics = this.add.graphics();
        exitGraphics.fillStyle(0x00ff00, 1); // Bright green
        exitGraphics.fillRect(0, 0, 30, 40);
        exitGraphics.generateTexture('exitDoor', 30, 40);
        exitGraphics.destroy();

        // Place exit door based on level layout
        this.exitDoor = this.physics.add.sprite(levelLayout.exitPos.x, levelLayout.exitPos.y, 'exitDoor');
        this.exitDoor.setDepth(0);

        // Add overlap detection for reaching the exit
        this.physics.add.overlap(this.player, this.exitDoor, this.reachExit, null, this);

        // ======================
        // SHADOW COPIES (created when echoing)
        // ======================
        this.shadows = this.physics.add.staticGroup();

        // Add collision between player and shadows
        this.physics.add.collider(this.player, this.shadows);

        // Echo strength tracking (TOUGHER: faster depletion)
        this.maxEchoRadius = 300;
        this.currentMaxEchoRadius = 300;
        this.echoDepletionRate = 60; // Lose 60px range per echo (faster depletion = harder!)

        // ======================
        // CREATE DARKNESS LAYER
        // ======================
        // Create a black rectangle that covers the entire screen
        this.darknessLayer = this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setDepth(10); // High depth so it's on top

        // Create a render texture for the bitmap mask
        this.maskTexture = this.make.renderTexture({ width, height }, false);

        // Create bitmap mask with invertAlpha
        // invertAlpha = true means: where we draw = darkness is HIDDEN (creates holes)
        const mask = this.maskTexture.createBitmapMask();
        mask.invertAlpha = true;
        this.darknessLayer.setMask(mask);

        // Initialize mask with small circle around player
        this.updateMask(30);

        // ======================
        // KEYBOARD CONTROLS
        // ======================
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Track if echo is active
        this.echoActive = false;
        this.currentEchoRing = null;

        // ======================
        // VISUAL INDICATORS
        // ======================
        // Instructions
        this.add.text(10, 10, 'Arrow Keys: Move\nSPACE: Echo Pulse\nWarning: Each echo leaves a shadow copy and weakens your next echo', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setDepth(15);

        // Timer display (top center, very prominent)
        this.timerText = this.add.text(width / 2, 20, '', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(15);

        // Level indicator
        this.levelText = this.add.text(width / 2, 50, `Level ${this.currentLevel}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#888888'
        }).setOrigin(0.5).setDepth(15);

        // Echo strength meter
        const meterWidth = 200;
        const meterX = width - meterWidth - 20;
        const meterY = 80;

        this.add.text(meterX, 60, 'Echo Strength', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#888888'
        }).setOrigin(0).setDepth(15);

        this.echoMeterBg = this.add.rectangle(meterX, meterY, meterWidth, 15, 0x2a2a2a)
            .setOrigin(0, 0.5)
            .setDepth(15);

        this.echoMeter = this.add.rectangle(meterX, meterY, meterWidth, 15, 0x4a90e2)
            .setOrigin(0, 0.5)
            .setDepth(15);

        // Debug text
        this.debugText = this.add.text(10, height - 30, '', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#00ff00'
        }).setDepth(15);
    }

    /**
     * Get level-specific wall layouts with narrow corridors and DECOY PATHS
     * @param {number} level - Current level number
     */
    getLevelLayout(level) {
        const { width, height } = this.cameras.main;

        const layouts = {
            1: {
                // Level 1: Introduction with decoy paths (50px corridors)
                playerStart: { x: 60, y: 60 },
                exitPos: { x: width - 60, y: height - 60 },
                walls: [
                    // Main corridor system
                    { x: 200, y: 250, w: 20, h: 400 },
                    { x: 400, y: 450, w: 20, h: 500 },
                    { x: 600, y: 250, w: 20, h: 400 },
                    { x: 800, y: 450, w: 20, h: 500 },
                    { x: 1000, y: 250, w: 20, h: 400 },

                    // Horizontal blockers
                    { x: 300, y: 100, w: 200, h: 20 },
                    { x: 500, y: 650, w: 200, h: 20 },
                    { x: 700, y: 100, w: 200, h: 20 },
                    { x: 900, y: 650, w: 200, h: 20 },

                    // DECOY PATHS (dead ends)
                    { x: 300, y: 350, w: 150, h: 20 },  // Blocks what looks like a shortcut
                    { x: 700, y: 400, w: 150, h: 20 },  // Another fake path
                ]
            },
            2: {
                // Level 2: Complex maze with multiple decoys (45px corridors)
                playerStart: { x: 60, y: 400 },
                exitPos: { x: width - 60, y: 400 },
                walls: [
                    // Dense vertical walls
                    { x: 150, y: 300, w: 20, h: 450 },
                    { x: 250, y: 550, w: 20, h: 450 },
                    { x: 350, y: 300, w: 20, h: 450 },
                    { x: 450, y: 550, w: 20, h: 450 },
                    { x: 550, y: 300, w: 20, h: 450 },
                    { x: 650, y: 550, w: 20, h: 450 },
                    { x: 750, y: 300, w: 20, h: 450 },
                    { x: 850, y: 550, w: 20, h: 450 },
                    { x: 950, y: 300, w: 20, h: 450 },
                    { x: 1050, y: 550, w: 20, h: 400 },

                    // Top/bottom barriers
                    { x: 200, y: 150, w: 180, h: 20 },
                    { x: 400, y: 700, w: 180, h: 20 },
                    { x: 600, y: 150, w: 180, h: 20 },
                    { x: 800, y: 700, w: 180, h: 20 },
                    { x: 1000, y: 150, w: 180, h: 20 },

                    // DECOY PATHS (traps!)
                    { x: 200, y: 400, w: 80, h: 20 },   // Looks like a path, dead end
                    { x: 400, y: 350, w: 80, h: 20 },   // Another trap
                    { x: 600, y: 450, w: 80, h: 20 },   // Fake shortcut
                    { x: 800, y: 380, w: 80, h: 20 },   // Dead end
                ]
            },
            3: {
                // Level 3: BRUTAL maze with tons of decoys (40px corridors)
                playerStart: { x: 60, y: 60 },
                exitPos: { x: width - 60, y: height - 60 },
                walls: [
                    // Very tight zigzag
                    { x: 130, y: 200, w: 20, h: 350 },
                    { x: 230, y: 450, w: 20, h: 350 },
                    { x: 330, y: 200, w: 20, h: 350 },
                    { x: 430, y: 450, w: 20, h: 350 },
                    { x: 530, y: 200, w: 20, h: 350 },
                    { x: 630, y: 450, w: 20, h: 350 },
                    { x: 730, y: 200, w: 20, h: 350 },
                    { x: 830, y: 450, w: 20, h: 350 },
                    { x: 930, y: 200, w: 20, h: 350 },
                    { x: 1030, y: 450, w: 20, h: 350 },
                    { x: 1130, y: 200, w: 20, h: 300 },

                    // Horizontal blockers
                    { x: 180, y: 80, w: 120, h: 20 },
                    { x: 280, y: 720, w: 120, h: 20 },
                    { x: 380, y: 80, w: 120, h: 20 },
                    { x: 480, y: 720, w: 120, h: 20 },
                    { x: 580, y: 80, w: 120, h: 20 },
                    { x: 680, y: 720, w: 120, h: 20 },
                    { x: 780, y: 80, w: 120, h: 20 },
                    { x: 880, y: 720, w: 120, h: 20 },
                    { x: 980, y: 80, w: 120, h: 20 },

                    // MANY DECOY PATHS (nightmare mode!)
                    { x: 180, y: 300, w: 90, h: 20 },   // Dead end
                    { x: 280, y: 550, w: 90, h: 20 },   // Trap
                    { x: 380, y: 300, w: 90, h: 20 },   // Fake route
                    { x: 480, y: 550, w: 90, h: 20 },   // Dead end
                    { x: 580, y: 300, w: 90, h: 20 },   // Trap
                    { x: 680, y: 550, w: 90, h: 20 },   // Fake shortcut
                    { x: 780, y: 300, w: 90, h: 20 },   // Dead end
                    { x: 880, y: 550, w: 90, h: 20 },   // Final trap
                ]
            }
        };

        return layouts[level] || layouts[1];
    }

    /**
     * Update the bitmap mask
     * @param {number} radius - Radius of the visible area (where darkness is HIDDEN)
     */
    updateMask(radius) {
        // Clear the mask texture
        this.maskTexture.clear();

        // Create a temporary graphics object to draw the mask shape
        const graphics = this.make.graphics();

        // Draw circle at player position (creates hole in darkness)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(this.player.x, this.player.y, radius);

        // Also reveal walls, shadows, and exit door if radius is large enough (during echo)
        if (radius > 50) {
            // Reveal walls
            this.walls.children.entries.forEach(wall => {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, wall.x, wall.y);
                if (dist < radius) {
                    // Reveal this wall (create hole in darkness)
                    graphics.fillRect(
                        wall.x - wall.displayWidth / 2,
                        wall.y - wall.displayHeight / 2,
                        wall.displayWidth,
                        wall.displayHeight
                    );
                }
            });

            // Reveal shadow copies
            this.shadows.children.entries.forEach(shadow => {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, shadow.x, shadow.y);
                if (dist < radius) {
                    // Reveal this shadow (create hole in darkness) - bigger size
                    graphics.fillCircle(shadow.x, shadow.y, 18);
                }
            });

            // Reveal exit door
            const exitDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitDoor.x, this.exitDoor.y);
            if (exitDist < radius) {
                graphics.fillRect(
                    this.exitDoor.x - this.exitDoor.displayWidth / 2,
                    this.exitDoor.y - this.exitDoor.displayHeight / 2,
                    this.exitDoor.displayWidth,
                    this.exitDoor.displayHeight
                );
            }
        }

        // Draw the graphics to the mask texture
        graphics.generateTexture('maskShape', this.cameras.main.width, this.cameras.main.height);
        this.maskTexture.draw('maskShape', 0, 0);

        // Clean up
        graphics.destroy();
        this.textures.remove('maskShape');
    }

    /**
     * Trigger echo pulse
     */
    triggerEcho() {
        if (this.echoActive) return; // Prevent multiple echoes at once

        this.echoActive = true;

        // Create expanding white ring (hollow circle)
        const ring = this.add.graphics();
        ring.lineStyle(3, 0xffffff, 1);
        ring.strokeCircle(this.player.x, this.player.y, 20);
        ring.setDepth(12);

        this.currentEchoRing = {
            graphics: ring,
            radius: 20
        };

        // Tween the ring to expand outward (using current max radius)
        this.tweens.add({
            targets: this.currentEchoRing,
            radius: this.currentMaxEchoRadius, // Diminishing max echo range
            duration: 1500,
            ease: 'Quad.easeOut',
            onUpdate: () => {
                // Redraw the expanding ring
                ring.clear();
                ring.lineStyle(3, 0xffffff, 1);
                ring.strokeCircle(this.player.x, this.player.y, this.currentEchoRing.radius);

                // Update mask to reveal area within ring radius
                this.updateMask(this.currentEchoRing.radius);
            },
            onComplete: () => {
                // Ring disappears
                ring.destroy();

                // Mask shrinks back to small player visibility
                this.tweens.add({
                    targets: { radius: this.currentEchoRing.radius },
                    radius: 30,
                    duration: 500,
                    onUpdate: (tween) => {
                        const obj = tween.targets[0];
                        this.updateMask(obj.radius);
                    },
                    onComplete: () => {
                        this.echoActive = false;
                        this.currentEchoRing = null;
                    }
                });
            }
        });

        // CREATE SHADOW COPY: Freeze player's current position as a shadow
        this.createShadowCopy();

        // DIMINISH ECHO STRENGTH: Each echo reduces future echo range
        this.currentMaxEchoRadius = Math.max(100, this.currentMaxEchoRadius - this.echoDepletionRate);
    }

    /**
     * Create a shadow copy of the player at their current position
     */
    createShadowCopy() {
        // Create shadow sprite (bright red with dark core for high visibility, BIGGER)
        const shadowGraphics = this.add.graphics();

        // Outer glow (bright red)
        shadowGraphics.fillStyle(0xff4444, 0.8);
        shadowGraphics.fillCircle(0, 0, 18); // Bigger to match player size

        // Inner core (darker red)
        shadowGraphics.fillStyle(0x880000, 1);
        shadowGraphics.fillCircle(0, 0, 12); // Bigger to match player size

        shadowGraphics.generateTexture('shadow', 36, 36);
        shadowGraphics.destroy();

        // Spawn shadow at player's current position
        const shadow = this.shadows.create(this.player.x, this.player.y, 'shadow');
        shadow.setOrigin(0.5);
        shadow.setDepth(0);
        shadow.refreshBody();

        // Fade in effect with pulsing
        shadow.setAlpha(0);
        this.tweens.add({
            targets: shadow,
            alpha: 0.9,
            duration: 300,
            ease: 'Sine.easeIn'
        });

        // Add subtle pulsing effect to make it more menacing
        this.tweens.add({
            targets: shadow,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Game over - time ran out
     */
    gameOver() {
        // Flash screen red
        this.cameras.main.flash(1000, 255, 0, 0);

        // Show game over message
        const { width, height } = this.cameras.main;
        const gameOverText = this.add.text(width / 2, height / 2, 'TIME\'S UP\n\nClick to Restart', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ff4444',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(20);

        // Make it clickable to restart
        this.input.once('pointerdown', () => {
            this.scene.restart({ level: 1 });
        });
    }

    /**
     * Player reached the exit - progress to next level or win
     */
    reachExit() {
        const { width, height } = this.cameras.main;

        if (this.currentLevel >= 3) {
            // Won the game!
            this.cameras.main.flash(1000, 0, 255, 0);

            const winText = this.add.text(width / 2, height / 2,
                `YOU ESCAPED!\n\nTime Remaining: ${Math.floor(this.totalTimeRemaining)}s\n\nClick to Play Again`, {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#00ff00',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5).setDepth(20);

            this.input.once('pointerdown', () => {
                this.scene.restart({ level: 1 });
            });
        } else {
            // Next level
            this.cameras.main.flash(500, 0, 255, 0);

            const nextLevelText = this.add.text(width / 2, height / 2,
                `LEVEL ${this.currentLevel} COMPLETE!\n\nNext Level...`, {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#00ff00',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5).setDepth(20);

            this.time.delayedCall(1500, () => {
                this.scene.restart({
                    level: this.currentLevel + 1,
                    timeRemaining: this.totalTimeRemaining // Carry over remaining time
                });
            });
        }
    }

    update(time, delta) {
        // ======================
        // UPDATE TIMER
        // ======================
        this.totalTimeRemaining -= delta / 1000; // Convert ms to seconds

        if (this.totalTimeRemaining <= 0) {
            this.gameOver();
            return; // Stop updating
        }

        // Update timer display
        const minutes = Math.floor(this.totalTimeRemaining / 60);
        const seconds = Math.floor(this.totalTimeRemaining % 60);
        this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);

        // Change timer color as time runs low
        if (this.totalTimeRemaining < 30) {
            this.timerText.setColor('#ff4444'); // Red when under 30s
        } else if (this.totalTimeRemaining < 60) {
            this.timerText.setColor('#f5a623'); // Orange when under 1 min
        } else {
            this.timerText.setColor('#ffffff'); // White normally
        }

        // ======================
        // PLAYER MOVEMENT
        // ======================
        const speed = 100; // Reduced from 120 for tougher gameplay

        // Reset velocity
        this.player.setVelocity(0);

        // Arrow key movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Update mask position to follow player (when not echoing)
        if (!this.echoActive) {
            this.updateMask(30);
        }

        // ======================
        // ECHO PULSE (SPACEBAR)
        // ======================
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.triggerEcho();
        }

        // ======================
        // UPDATE ECHO STRENGTH METER
        // ======================
        const echoPercentage = this.currentMaxEchoRadius / this.maxEchoRadius;
        this.echoMeter.width = 200 * echoPercentage;

        // Change color based on remaining strength
        if (echoPercentage > 0.6) {
            this.echoMeter.setFillStyle(0x4a90e2); // Blue - healthy
        } else if (echoPercentage > 0.3) {
            this.echoMeter.setFillStyle(0xf5a623); // Orange - warning
        } else {
            this.echoMeter.setFillStyle(0xff4444); // Red - critical
        }

        // ======================
        // DEBUG INFO
        // ======================
        this.debugText.setText(
            `Echo Strength: ${this.currentMaxEchoRadius}px\n` +
            `Shadows: ${this.shadows.children.entries.length}\n` +
            `Echo Active: ${this.echoActive}`
        );
    }
}
