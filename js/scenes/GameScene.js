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

    create() {
        const { width, height } = this.cameras.main;

        // Enable Arcade Physics
        this.physics.world.setBounds(0, 0, width, height);

        // ======================
        // CREATE THE PLAYER
        // ======================
        // Draw player as blue circle using graphics
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x4a90e2, 1);
        playerGraphics.fillCircle(0, 0, 10); // Circle with radius 10
        playerGraphics.generateTexture('player', 20, 20);
        playerGraphics.destroy();

        // Create player sprite with physics
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(0); // Below darkness layer

        // ======================
        // CREATE WALLS (OBSTACLES)
        // ======================
        this.walls = this.physics.add.staticGroup();

        // Generate 10 random rectangular obstacles
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);
            const w = Phaser.Math.Between(40, 100);
            const h = Phaser.Math.Between(40, 100);

            // Draw wall rectangle (WHITE for better visibility)
            const wallGraphics = this.add.graphics();
            wallGraphics.fillStyle(0xffffff, 1); // White walls
            wallGraphics.fillRect(0, 0, w, h);
            wallGraphics.generateTexture(`wall${i}`, w, h);
            wallGraphics.destroy();

            // Create wall sprite
            const wall = this.walls.create(x, y, `wall${i}`);
            wall.setOrigin(0.5);
            wall.setDepth(0); // Make sure walls are below darkness layer
            wall.refreshBody();
        }

        // Add collision between player and walls
        this.physics.add.collider(this.player, this.walls);

        // ======================
        // CREATE THE ENEMY (MONSTER)
        // ======================
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0xff4444, 1);
        enemyGraphics.fillRect(0, 0, 20, 20);
        enemyGraphics.generateTexture('enemy', 20, 20);
        enemyGraphics.destroy();

        // Spawn enemy in random location
        const enemyX = Phaser.Math.Between(50, width - 50);
        const enemyY = Phaser.Math.Between(50, height - 50);
        this.enemy = this.physics.add.sprite(enemyX, enemyY, 'enemy');
        this.enemy.setCollideWorldBounds(true);

        // Enemy state
        this.enemyDetectedPlayer = false;
        this.enemyDetectionTimer = 0;
        this.enemyWanderTimer = 0;

        // Collision between enemy and walls
        this.physics.add.collider(this.enemy, this.walls);

        // Collision between enemy and player (game over)
        this.physics.add.overlap(this.player, this.enemy, this.gameOver, null, this);

        // ======================
        // CREATE DARKNESS LAYER
        // ======================
        // Create a black rectangle that covers the entire screen
        this.darknessLayer = this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setDepth(10); // High depth so it's on top

        // Create geometry for the mask (initially small circle around player)
        this.maskGraphics = this.make.graphics();
        this.maskGraphics.setDepth(11); // Above darkness layer

        // Create a small circle mask around player so they're always slightly visible
        this.updateMask(30); // Small visibility radius

        // Apply the mask to the darkness layer
        // The mask works by showing ONLY the masked area as transparent
        const mask = this.maskGraphics.createGeometryMask();
        this.darknessLayer.setMask(mask);

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
        this.add.text(10, 10, 'Arrow Keys: Move\nSPACE: Echo Pulse (reveals environment but calls the monster)', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setDepth(15);

        // Debug text
        this.debugText = this.add.text(10, height - 30, '', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#00ff00'
        }).setDepth(15);
    }

    /**
     * Update the geometry mask
     * @param {number} radius - Radius of the visible area
     */
    updateMask(radius) {
        this.maskGraphics.clear();

        // Draw circles at player position (makes player area visible)
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillCircle(this.player.x, this.player.y, radius);

        // Also reveal walls if radius is large enough (during echo)
        if (radius > 50) {
            this.walls.children.entries.forEach(wall => {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, wall.x, wall.y);
                if (dist < radius) {
                    // Reveal this wall
                    this.maskGraphics.fillRect(
                        wall.x - wall.displayWidth / 2,
                        wall.y - wall.displayHeight / 2,
                        wall.displayWidth,
                        wall.displayHeight
                    );
                }
            });
        }
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

        // Tween the ring to expand outward
        this.tweens.add({
            targets: this.currentEchoRing,
            radius: 300, // Max echo range
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

        // ENEMY DETECTION: Enemy hears the echo and rushes toward player
        this.enemyDetectedPlayer = true;
        this.enemyDetectionTimer = 2000; // Chase for 2 seconds
    }

    /**
     * Update enemy AI
     * @param {number} delta - Time since last frame
     */
    updateEnemyAI(delta) {
        // If enemy detected player (via echo), rush toward them
        if (this.enemyDetectedPlayer) {
            this.enemyDetectionTimer -= delta;

            if (this.enemyDetectionTimer <= 0) {
                this.enemyDetectedPlayer = false;
                this.enemy.setVelocity(0, 0);
            } else {
                // Calculate vector from enemy to player
                const angle = Phaser.Math.Angle.Between(
                    this.enemy.x, this.enemy.y,
                    this.player.x, this.player.y
                );

                // Move toward player quickly
                const speed = 150;
                this.enemy.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        } else {
            // Check if player is moving (enemy can "hear" movement)
            const playerMoving = Math.abs(this.player.body.velocity.x) > 0 ||
                                Math.abs(this.player.body.velocity.y) > 0;

            if (playerMoving) {
                // Player is moving - enemy slowly moves toward them
                const angle = Phaser.Math.Angle.Between(
                    this.enemy.x, this.enemy.y,
                    this.player.x, this.player.y
                );

                const speed = 30; // Slow movement
                this.enemy.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            } else {
                // Player is still - enemy wanders randomly
                this.enemyWanderTimer -= delta;

                if (this.enemyWanderTimer <= 0) {
                    // Choose new random direction
                    const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                    const wanderSpeed = 20;

                    this.enemy.setVelocity(
                        Math.cos(randomAngle) * wanderSpeed,
                        Math.sin(randomAngle) * wanderSpeed
                    );

                    this.enemyWanderTimer = Phaser.Math.Between(1000, 3000);
                }
            }
        }
    }

    /**
     * Game over - player caught by enemy
     */
    gameOver() {
        // Flash screen red
        this.cameras.main.flash(500, 255, 0, 0);

        // Restart scene after delay
        this.time.delayedCall(500, () => {
            this.scene.restart();
        });
    }

    update(time, delta) {
        // ======================
        // PLAYER MOVEMENT
        // ======================
        const speed = 120;

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
        // ENEMY AI
        // ======================
        this.updateEnemyAI(delta);

        // ======================
        // DEBUG INFO
        // ======================
        this.debugText.setText(
            `Echo Active: ${this.echoActive}\n` +
            `Walls Visible: ${this.echoActive || (this.currentEchoRing && this.currentEchoRing.radius > 50)}`
        );
    }
}
