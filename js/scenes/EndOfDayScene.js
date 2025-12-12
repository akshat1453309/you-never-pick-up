/**
 * EndOfDayScene - End of day shop for food, utilities, medicine
 *
 * Player spends money to maintain health for next day
 */

class EndOfDayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndOfDayScene' });
    }

    preload() {
        // Load shop background image
        this.load.image('shop_bg', 'assets/images/shop_background.png');

        // Load shop item images
        this.load.image('cigerette_box', 'assets/shop/cigerette_box.png');
        // Add more shop items here as needed
        // this.load.image('utilities_item', 'assets/shop/utilities_item.png');
        // this.load.image('medicine_item', 'assets/shop/medicine_item.png');
    }

    init(data) {
        this.workDay = data.workDay || 1;
        this.money = data.money || 0;
        this.ignoredCalls = data.ignoredCalls || 0;
        this.totalCalls = data.totalCalls || 0;
        this.currentHealth = data.health || 100;
        this.usedDocuments = data.usedDocuments || [];

        // Track which item is currently open
        this.selectedItem = null;
        this.upgradeModal = null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Set background color
        this.cameras.main.setBackgroundColor('#0a0a0a');

        // Shop background image - Cover entire screen
        if (this.textures.exists('shop_bg')) {
            this.background = this.add.image(width / 2, height / 2, 'shop_bg')
                .setDepth(0);

            // Calculate scale to cover entire screen (no black borders)
            const scaleX = width / this.background.width;
            const scaleY = height / this.background.height;
            const scale = Math.max(scaleX, scaleY);

            // Apply scale to cover entire screen
            this.background.setScale(scale);
        } else {
            // Fallback to solid color if image doesn't load
            this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);
        }

        // Title - Top left
        this.add.text(30, 30, `End of Day ${this.workDay}`, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0);

        // Money display - Top right
        this.moneyText = this.add.text(width - 30, 30, `Money: $${this.money}`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2',
            fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Current health - Top right, below money
        this.healthDisplayText = this.add.text(width - 30, 85, `Health: ${Math.floor(this.currentHealth)}%`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: this.getHealthColor(this.currentHealth),
            fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Instructions - Bottom left
        this.add.text(30, height - 120, 'Purchase items to restore health for tomorrow', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc'
        }).setOrigin(0);

        // Shop items
        this.createShopItems();

        // Continue button
        this.createContinueButton();

        // Warning text - Bottom center
        this.warningText = this.add.text(width / 2, height - 70, '', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff6b6b',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Initialize Debug Helper (if DebugHelper class is available)
        if (typeof DebugHelper !== 'undefined') {
            this.debugHelper = new DebugHelper(this);
            console.log('[EndOfDayScene] DebugHelper initialized. Press D to toggle debug mode.');
        } else {
            console.warn('[EndOfDayScene] DebugHelper not found. Debug mode unavailable.');
        }
    }

    createShopItems() {
        const { width, height } = this.cameras.main;

        // Fixed prices - no price scaling
        this.shopItems = [
            {
                name: 'Food',
                cost: 30,
                healthRestore: 25,
                description: 'A proper meal',
                texture: 'cigerette_box', // Using cigarette box for now
                label: 'Cigarette Box'
            },
            {
                name: 'Utilities',
                cost: 50,
                healthRestore: 15,
                description: 'Pay bills, reduce stress',
                texture: null, // No texture yet, will use placeholder
                label: 'Utilities'
            },
            {
                name: 'Medicine',
                cost: 40,
                healthRestore: 30,
                description: 'Treat your symptoms',
                texture: null, // No texture yet, will use placeholder
                label: 'Medicine'
            }
        ];

        const startX = width / 2 - 300;
        const y = height / 2;

        this.shopItems.forEach((item, index) => {
            const x = startX + index * 300;

            // Create image or placeholder for item
            let itemSprite;
            if (item.texture && this.textures.exists(item.texture)) {
                itemSprite = this.add.image(x, y, item.texture)
                    .setInteractive({ useHandCursor: true })
                    .setScale(0.5); // Scale down the image
            } else {
                // Fallback to blue box if no texture
                itemSprite = this.add.rectangle(x, y, 150, 150, 0x3366ff)
                    .setInteractive({ useHandCursor: true })
                    .setStrokeStyle(3, 0x4a90e2);
            }

            // Item label below the image
            const labelText = this.add.text(x, y + 100, item.label || item.name, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Store reference for debug mode
            itemSprite.itemData = item;
            itemSprite.itemType = 'shop_item';

            // Add toJSON method for debug helper
            itemSprite.toJSON = function() {
                return {
                    id: `shop_item_${index}`,
                    x: Math.round(this.x),
                    y: Math.round(this.y),
                    type: 'shop_item',
                    texture: this.texture ? this.texture.key : null,
                    scale: this.scale,
                    name: item.name,
                    label: item.label,
                    cost: item.cost,
                    healthRestore: item.healthRestore
                };
            };

            // Store event handlers that will be reattached by debug helper
            itemSprite._clickHandler = (pointer, localX, localY, event) => {
                // Skip if debug mode is active
                if (itemSprite._debugMode) {
                    console.log('[Shop] Debug mode active - click handler ignored');
                    return;
                }

                // Skip if modal is already open
                if (this.upgradeModal) {
                    console.log('[Shop] Modal already open - ignoring click');
                    return;
                }

                // Stop event propagation to prevent multiple triggers
                if (event) {
                    event.stopPropagation();
                }

                // Open the upgrade modal
                this.openUpgradeModal(item, x, y);
            };

            itemSprite._pointerUpHandler = () => {
                if (itemSprite._isDragging) {
                    console.log('[Shop] Just finished dragging - preventing click');
                }
            };

            itemSprite._hoverEnterHandler = () => {
                // Hover effects disabled when in debug mode
                if (!itemSprite._debugMode) {
                    // itemSprite.setScale(itemSprite.texture ? 0.55 : 1.05);
                    labelText.setColor('#4a90e2');
                }
            };

            itemSprite._hoverExitHandler = () => {
                // Hover effects disabled when in debug mode
                if (!itemSprite._debugMode) {
                    // itemSprite.setScale(itemSprite.texture ? 0.5 : 1);
                    labelText.setColor('#ffffff');
                }
            };

            // Attach initial event handlers
            itemSprite.on('pointerdown', itemSprite._clickHandler);
            itemSprite.on('pointerup', itemSprite._pointerUpHandler);
            itemSprite.on('pointerover', itemSprite._hoverEnterHandler);
            itemSprite.on('pointerout', itemSprite._hoverExitHandler);

            // Register with debug helper if available
            if (this.debugHelper) {
                this.debugHelper.registerObject(itemSprite, 'ui', `shop_item_${index}`, {
                    itemName: item.name,
                    cost: item.cost,
                    healthRestore: item.healthRestore
                });
            }
        });
    }

    openUpgradeModal(item, x, y) {
        console.log('[Shop] 📂 Opening upgrade modal for:', item.name);

        // Close existing modal if open
        if (this.upgradeModal) {
            console.log('[Shop] Closing existing modal first...');
            this.closeUpgradeModal();
        }

        const { width, height } = this.cameras.main;

        this.selectedItem = item;
        console.log('[Shop] Creating modal elements...');

        // Create modal overlay (semi-transparent background)
        const modalOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setDepth(1000)
            .setInteractive(); // Blocks clicks behind it

        // Modal box
        const modalBox = this.add.rectangle(width / 2, height / 2, 450, 300, 0x1a1a2e)
            .setStrokeStyle(3, 0x4a90e2)
            .setDepth(1001);

        // Item name title
        const titleText = this.add.text(width / 2, height / 2 - 120, item.label || item.name, {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1002);

        // Description
        const descText = this.add.text(width / 2, height / 2 - 70, item.description, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5).setDepth(1002);

        // Health restore info
        const healthText = this.add.text(width / 2, height / 2 - 30, `+${item.healthRestore} Health`, {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#2ecc71',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1002);

        // Cost
        const costText = this.add.text(width / 2, height / 2 + 10, `Cost: $${item.cost}`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2'
        }).setOrigin(0.5).setDepth(1002);

        // Buy button
        const buyButton = this.add.rectangle(width / 2 - 60, height / 2 + 70, 140, 45, 0x2ecc71)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0x27ae60)
            .setDepth(1002);

        const buyButtonText = this.add.text(width / 2 - 60, height / 2 + 70, 'Buy', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1003);

        buyButton.on('pointerdown', () => {
            console.log('[Shop] 🖱️ Buy button clicked!');
            try {
                this.purchaseItem(item);
                console.log('[Shop] Purchase attempt completed');
            } catch (error) {
                console.error('[Shop] ❌ Error during purchase:', error);
                console.error('[Shop] Error stack:', error.stack);
            } finally {
                // Always close the modal, even if purchase fails
                console.log('[Shop] About to close modal...');
                this.closeUpgradeModal();
            }
        });

        buyButton.on('pointerover', () => buyButton.setFillStyle(0x27ae60));
        buyButton.on('pointerout', () => buyButton.setFillStyle(0x2ecc71));

        // Cancel button
        const cancelButton = this.add.rectangle(width / 2 + 60, height / 2 + 70, 140, 45, 0xff6b6b)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xcc5555)
            .setDepth(1002);

        const cancelButtonText = this.add.text(width / 2 + 60, height / 2 + 70, 'Cancel', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1003);

        cancelButton.on('pointerdown', () => {
            this.closeUpgradeModal();
        });

        cancelButton.on('pointerover', () => cancelButton.setFillStyle(0xcc5555));
        cancelButton.on('pointerout', () => cancelButton.setFillStyle(0xff6b6b));

        // Store modal elements for cleanup
        this.upgradeModal = {
            overlay: modalOverlay,
            box: modalBox,
            title: titleText,
            desc: descText,
            health: healthText,
            cost: costText,
            buyButton: buyButton,
            buyText: buyButtonText,
            cancelButton: cancelButton,
            cancelText: cancelButtonText
        };

        // Log to console for debug mode
        console.log(`[Shop] Opened upgrade modal for: ${item.name}`);
        console.log(`[Shop] Cost: $${item.cost}, Health Restore: +${item.healthRestore}`);
    }

    closeUpgradeModal() {
        console.log('[Shop] Closing upgrade modal...');

        if (!this.upgradeModal) {
            console.log('[Shop] No modal to close');
            return;
        }

        try {
            // Destroy all modal elements
            Object.values(this.upgradeModal).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            console.log('[Shop] ✅ Modal elements destroyed');
        } catch (error) {
            console.error('[Shop] Error destroying modal elements:', error);
        }

        this.upgradeModal = null;
        this.selectedItem = null;
        console.log('[Shop] ✅ Modal closed successfully');
    }

    purchaseItem(item) {
        console.log(`[Shop] Attempting to purchase ${item.name}`);
        console.log(`[Shop] Current money: $${this.money}, Cost: $${item.cost}`);
        console.log(`[Shop] Current health: ${this.currentHealth}%`);

        // Check if health is already at max
        if (this.currentHealth >= 100) {
            this.warningText.setColor('#ffaa00');
            this.warningText.setText('Your health is already at maximum!');
            console.log('[Shop] Purchase cancelled - health already at max');

            this.time.delayedCall(3000, () => {
                this.warningText.setText('');
            });
            return;
        }

        // Check if player has enough money
        if (this.money < item.cost) {
            this.warningText.setColor('#ff6b6b');
            this.warningText.setText('Not enough money!');
            console.log(`[Shop] Cannot afford ${item.name}. Need $${item.cost}, have $${this.money}`);

            this.time.delayedCall(3000, () => {
                this.warningText.setText('');
            });
            return;
        }

        // Perform the purchase
        this.money -= item.cost;
        this.moneyText.setText(`Money: $${this.money}`);

        // Restore health (cap at 100)
        this.currentHealth = Math.min(100, this.currentHealth + item.healthRestore);

        // Update health display text
        this.healthDisplayText.setText(`Current Health: ${Math.floor(this.currentHealth)}%`);
        this.healthDisplayText.setColor(this.getHealthColor(this.currentHealth));

        // Visual feedback - green flash
        this.cameras.main.flash(200, 0, 255, 0);

        // Show purchase confirmation
        this.warningText.setColor('#2ecc71');
        this.warningText.setText(`Purchased ${item.name}! Health: ${Math.floor(this.currentHealth)}%`);

        // Log to console
        console.log(`[Shop] ✅ Purchased ${item.name} for $${item.cost}`);
        console.log(`[Shop] Health restored: +${item.healthRestore}% (Current: ${Math.floor(this.currentHealth)}%)`);
        console.log(`[Shop] Money remaining: $${this.money}`);

        this.time.delayedCall(3000, () => {
            this.warningText.setText('');
        });
    }

    createContinueButton() {
        const { width, height } = this.cameras.main;

        const continueBtn = this.add.rectangle(width / 2, height - 40, 200, 45, 0x4a90e2)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0x2e6ba8);

        this.add.text(width / 2, height - 40, 'Continue to Next Day', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        continueBtn.on('pointerdown', () => {
            this.goToNextDay();
        });

        continueBtn.on('pointerover', () => continueBtn.setFillStyle(0x2e6ba8));
        continueBtn.on('pointerout', () => continueBtn.setFillStyle(0x4a90e2));
    }

    goToNextDay() {
        const nextDay = this.workDay + 1;

        console.log('=== TRANSITIONING TO NEXT DAY ===');
        console.log('Current Health:', this.currentHealth);
        console.log('Money:', this.money);
        console.log('Next Day:', nextDay);

        if (nextDay > 7) {
            // Survived 7 days - trigger ending
            console.log('Player survived 7 days - triggering ending');
            this.scene.stop('EndOfDayScene');
            this.scene.start('HeartAttackScene', {
                ignoredCalls: this.ignoredCalls,
                totalCalls: this.totalCalls
            });
        } else {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                console.log('Starting OfficeScene with health:', this.currentHealth);
                // CRITICAL FIX: Ensure health is passed correctly
                this.scene.stop('EndOfDayScene');
                this.scene.start('OfficeScene', {
                    workDay: nextDay,
                    money: this.money,
                    ignoredCalls: this.ignoredCalls,
                    totalCalls: this.totalCalls,
                    health: this.currentHealth, // This should restore purchased health
                    usedDocuments: this.usedDocuments
                });
            });
        }
    }

    getHealthColor(health) {
        if (health > 70) return '#00ff00';
        if (health > 40) return '#ff9900';
        return '#ff0000';
    }
}
