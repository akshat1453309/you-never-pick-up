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
    }

    init(data) {
        this.workDay = data.workDay || 1;
        this.money = data.money || 0;
        this.ignoredCalls = data.ignoredCalls || 0;
        this.totalCalls = data.totalCalls || 0;
        this.currentHealth = data.health || 100;
        this.usedDocuments = data.usedDocuments || [];
    }

    create() {
        const { width, height } = this.cameras.main;

        // Set background color
        this.cameras.main.setBackgroundColor('#0a0a0a');

        // Shop background image - Cover entire screen without stretching
        if (this.textures.exists('shop_bg')) {
            this.background = this.add.image(width / 2, height / 2, 'shop_bg')
                .setDepth(0);

            // Calculate scale to cover screen while maintaining aspect ratio
            const scaleX = width / this.background.width;
            const scaleY = height / this.background.height;
            const scale = Math.max(scaleX, scaleY);

            // Apply scale to cover entire screen
            this.background.setScale(scale);
        } else {
            // Fallback to solid color if image doesn't load
            this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);
        }

        // Title
        this.add.text(width / 2, 60, `End of Day ${this.workDay}`, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Money display
        this.moneyText = this.add.text(width / 2, 110, `Money: $${this.money}`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#4a90e2'
        }).setOrigin(0.5);

        // Current health (store as property so we can update it)
        this.healthDisplayText = this.add.text(width / 2, 150, `Current Health: ${Math.floor(this.currentHealth)}%`, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: this.getHealthColor(this.currentHealth)
        }).setOrigin(0.5);

        // Instructions
        this.add.text(width / 2, 190, 'Purchase items to restore health for tomorrow:', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0.5);

        // Shop items
        this.createShopItems();

        // Continue button
        this.createContinueButton();

        // Warning text
        this.warningText = this.add.text(width / 2, height - 80, '', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff6b6b',
            align: 'center'
        }).setOrigin(0.5);
    }

    createShopItems() {
        const { width, height } = this.cameras.main;

        // Price scaling - exponential growth to ensure max 7 day survival
        // Day 1: 1x, Day 2: 1.5x, Day 3: 2.25x, Day 4: 3.4x, Day 5: 5x, Day 6: 7.6x, Day 7: 11.4x
        const priceMultiplier = Math.pow(1.5, this.workDay - 1);

        const basePrices = {
            food: 30,
            utilities: 50,
            medicine: 40
        };

        const items = [
            {
                name: 'Food',
                cost: Math.floor(basePrices.food * priceMultiplier),
                healthRestore: 25,
                description: 'A proper meal\n+25 health'
            },
            {
                name: 'Utilities',
                cost: Math.floor(basePrices.utilities * priceMultiplier),
                healthRestore: 15,
                description: 'Pay bills, reduce stress\n+15 health'
            },
            {
                name: 'Medicine',
                cost: Math.floor(basePrices.medicine * priceMultiplier),
                healthRestore: 30,
                description: 'Treat your symptoms\n+30 health'
            }
        ];

        const startX = width / 2 - 250;
        const y = height / 2;

        items.forEach((item, index) => {
            const x = startX + index * 250;

            // Item box
            const box = this.add.rectangle(x, y, 200, 180, 0x1a1a2e)
                .setStrokeStyle(2, 0x4a90e2);

            // Item name
            this.add.text(x, y - 60, item.name, {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Description
            this.add.text(x, y - 20, item.description, {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#888888',
                align: 'center',
                lineSpacing: 5
            }).setOrigin(0.5);

            // Cost
            this.add.text(x, y + 35, `$${item.cost}`, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#4a90e2'
            }).setOrigin(0.5);

            // Buy button
            const button = this.add.rectangle(x, y + 70, 120, 35, 0x2ecc71)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0x27ae60);

            const buttonText = this.add.text(x, y + 70, 'Buy', {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                this.purchaseItem(item, button, buttonText);
            });

            button.on('pointerover', () => button.setFillStyle(0x27ae60));
            button.on('pointerout', () => button.setFillStyle(0x2ecc71));
        });
    }

    purchaseItem(item, button, buttonText) {
        if (this.money >= item.cost) {
            if (this.currentHealth >= 100) {
                this.warningText.setText('Your health is already at maximum!');
                return;
            }

            // Deduct money
            this.money -= item.cost;
            this.moneyText.setText(`Money: $${this.money}`);

            // Restore health (cap at 100)
            this.currentHealth = Math.min(100, this.currentHealth + item.healthRestore);

            // Update health display text
            this.healthDisplayText.setText(`Current Health: ${Math.floor(this.currentHealth)}%`);
            this.healthDisplayText.setColor(this.getHealthColor(this.currentHealth));

            // Visual feedback
            this.cameras.main.flash(200, 0, 255, 0, false, 0.2);

            // Show purchase confirmation
            this.warningText.setColor('#2ecc71');
            this.warningText.setText(`Purchased ${item.name}! Health: ${Math.floor(this.currentHealth)}%`);

            this.time.delayedCall(2000, () => {
                this.warningText.setText('');
            });
        } else {
            this.warningText.setColor('#ff6b6b');
            this.warningText.setText('Not enough money!');

            this.time.delayedCall(2000, () => {
                this.warningText.setText('');
            });
        }
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
