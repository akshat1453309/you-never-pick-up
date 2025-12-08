/**
 * TypingScene - Main game scene for "I'm Fine"
 *
 * Student burnout typing game where you lie about being okay
 * until you can't anymore.
 */

class TypingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TypingScene' });
    }

    init() {
        // Game state
        this.currentPhase = 0;
        this.currentPromptIndex = 0;
        this.guiltLevel = 0;

        // Typing state
        this.targetText = '';
        this.typedText = '';
        this.timeLimit = 5;
        this.timeRemaining = 5;
        this.isTypingActive = false;

        // Phase tracking
        this.phases = [];

        // Input handling
        this.isProcessingInput = false;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.backgroundRect = this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);

        // Vignette effect (darker edges)
        this.vignette = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0)
            .setDepth(5);

        // Load game data
        this.loadGameData();

        // Create UI elements
        this.createUI();

        // Create background stress indicators
        this.createStressIndicators();

        // Create guilt meter
        this.createGuiltMeter();

        // Set up keyboard input
        this.setupInput();

        // Start the game
        this.time.delayedCall(1000, () => {
            this.startNextPrompt();
        });
    }

    /**
     * Load phases and prompts from dialogue data
     */
    loadGameData() {
        if (typeof GAME_DATA === 'undefined') {
            console.error('GAME_DATA not loaded!');
            return;
        }

        this.phases = GAME_DATA.phases;
    }

    /**
     * Create UI elements
     */
    createUI() {
        const { width, height } = this.cameras.main;

        // Title area
        this.askerText = this.add.text(width/2, 80, '', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);

        // Question display
        this.questionText = this.add.text(width/2, 150, '', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);

        // What you need to type (target)
        this.targetTextDisplay = this.add.text(width/2, 280, '', {
            fontSize: '18px',
            fontFamily: 'Courier, monospace',
            color: '#666666',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);

        // What you've typed so far
        this.typedTextDisplay = this.add.text(width/2, 320, '', {
            fontSize: '18px',
            fontFamily: 'Courier, monospace',
            color: '#4a90e2',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);

        // Timer bar background
        this.timerBarBg = this.add.rectangle(width/2, 400, 600, 20, 0x2a2a2a)
            .setStrokeStyle(2, 0x4a4a4a);

        // Timer bar fill
        this.timerBar = this.add.rectangle(width/2 - 300, 400, 600, 20, 0x4a90e2)
            .setOrigin(0, 0.5);

        // Timer text
        this.timerText = this.add.text(width/2, 430, '', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888'
        }).setOrigin(0.5);

        // Response text (after you finish typing)
        this.responseText = this.add.text(width/2, height - 120, '', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#888888',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5).setAlpha(0);

        // Instruction text
        this.instructionText = this.add.text(width/2, height - 60, 'Type the text above before time runs out', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#666666'
        }).setOrigin(0.5);
    }

    /**
     * Create background stress indicators
     */
    createStressIndicators() {
        const { width, height } = this.cameras.main;

        this.stressContainer = this.add.container(0, 0);

        // Create text elements that will show student stress
        this.stressTexts = [];

        const indicators = [
            { text: '', x: 50, y: height - 100 },
            { text: '', x: 50, y: height - 70 },
            { text: '', x: 50, y: height - 40 },
            { text: '', x: width - 50, y: height - 100 },
            { text: '', x: width - 50, y: height - 70 }
        ];

        indicators.forEach((indicator, index) => {
            const text = this.add.text(indicator.x, indicator.y, indicator.text, {
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
                color: '#444444',
                alpha: 0.6
            }).setOrigin(index < 3 ? 0 : 1, 0);

            this.stressTexts.push(text);
            this.stressContainer.add(text);
        });

        this.stressContainer.setAlpha(0);
    }

    /**
     * Update stress indicators based on phase
     */
    updateStressIndicators(phase) {
        const phaseData = this.phases[phase];
        if (!phaseData || !phaseData.stressIndicators) return;

        const indicators = phaseData.stressIndicators;

        indicators.forEach((text, index) => {
            if (this.stressTexts[index]) {
                this.stressTexts[index].setText(text);
            }
        });

        // Fade in stress indicators
        this.tweens.add({
            targets: this.stressContainer,
            alpha: 1,
            duration: 1000,
            ease: 'Sine.easeIn'
        });
    }

    /**
     * Create guilt meter
     */
    createGuiltMeter() {
        const { width } = this.cameras.main;

        // Guilt label
        this.guiltLabel = this.add.text(width/2, 30, 'GUILT', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#666666',
            letterSpacing: 2
        }).setOrigin(0.5).setAlpha(0);

        // Guilt bar background
        this.guiltBarBg = this.add.rectangle(width/2, 50, 400, 10, 0x2a2a2a)
            .setAlpha(0);

        // Guilt bar fill
        this.guiltBar = this.add.rectangle(width/2 - 200, 50, 0, 10, 0xff4444)
            .setOrigin(0, 0.5)
            .setAlpha(0);
    }

    /**
     * Update guilt meter
     */
    updateGuiltMeter(amount) {
        this.guiltLevel = Phaser.Math.Clamp(this.guiltLevel + amount, 0, 100);

        // Show guilt meter if not visible
        if (this.guiltBar.alpha === 0 && this.guiltLevel > 0) {
            this.tweens.add({
                targets: [this.guiltLabel, this.guiltBarBg, this.guiltBar],
                alpha: 1,
                duration: 500
            });
        }

        // Update width
        this.tweens.add({
            targets: this.guiltBar,
            width: (this.guiltLevel / 100) * 400,
            duration: 500,
            ease: 'Sine.easeOut'
        });

        // Change vignette darkness based on guilt
        this.tweens.add({
            targets: this.vignette,
            alpha: this.guiltLevel / 100 * 0.3,
            duration: 500
        });
    }

    /**
     * Set up keyboard input
     */
    setupInput() {
        this.input.keyboard.on('keydown', (event) => {
            if (!this.isTypingActive || this.isProcessingInput) return;

            const key = event.key;

            if (key === 'Backspace') {
                // Remove last character
                this.typedText = this.typedText.slice(0, -1);
                this.updateTypedDisplay();
            } else if (key.length === 1) {
                // Add character
                this.typedText += key;
                this.updateTypedDisplay();

                // Check if complete
                if (this.typedText === this.targetText) {
                    this.onTypingComplete(true);
                }
            }
        });
    }

    /**
     * Update typed text display
     */
    updateTypedDisplay() {
        // Show what's been typed
        let displayText = '';

        for (let i = 0; i < this.targetText.length; i++) {
            if (i < this.typedText.length) {
                // Character typed
                if (this.typedText[i] === this.targetText[i]) {
                    // Correct
                    displayText += this.typedText[i];
                } else {
                    // Wrong character - show in red (we'll handle this later)
                    displayText += this.typedText[i];
                }
            } else {
                // Not typed yet - show as underscore
                displayText += '_';
            }
        }

        this.typedTextDisplay.setText(displayText);
    }

    /**
     * Start next prompt
     */
    startNextPrompt() {
        const phaseData = this.phases[this.currentPhase];

        if (!phaseData) {
            // No more phases - game over
            this.endGame();
            return;
        }

        const prompts = phaseData.prompts;

        if (this.currentPromptIndex >= prompts.length) {
            // Move to next phase
            this.currentPhase++;
            this.currentPromptIndex = 0;

            // Update stress indicators for new phase
            this.updateStressIndicators(this.currentPhase);

            this.startNextPrompt();
            return;
        }

        const prompt = prompts[this.currentPromptIndex];

        // Display prompt
        this.askerText.setText(prompt.asker);
        this.questionText.setText(prompt.question);
        this.targetText = prompt.response;
        this.typedText = '';
        this.timeLimit = prompt.timeLimit || 5;
        this.timeRemaining = this.timeLimit;

        // Update displays
        this.targetTextDisplay.setText(this.targetText);
        this.typedTextDisplay.setText('_'.repeat(this.targetText.length));
        this.responseText.setAlpha(0);

        // Start typing
        this.isTypingActive = true;

        // Start timer
        this.startTimer();
    }

    /**
     * Start countdown timer
     */
    startTimer() {
        // Clear any existing timer
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        this.timerEvent = this.time.addEvent({
            delay: 100,
            callback: () => {
                this.timeRemaining -= 0.1;
                this.updateTimerDisplay();

                if (this.timeRemaining <= 0) {
                    this.onTypingComplete(false);
                }
            },
            loop: true
        });
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const percentage = this.timeRemaining / this.timeLimit;
        this.timerBar.width = 600 * percentage;

        // Change color as time runs out
        if (percentage > 0.5) {
            this.timerBar.setFillStyle(0x4a90e2);
        } else if (percentage > 0.25) {
            this.timerBar.setFillStyle(0xf5a623);
        } else {
            this.timerBar.setFillStyle(0xff4444);
        }

        this.timerText.setText(`${this.timeRemaining.toFixed(1)}s`);
    }

    /**
     * Handle typing completion (success or failure)
     */
    onTypingComplete(success) {
        this.isTypingActive = false;
        this.isProcessingInput = true;

        // Stop timer
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        const prompt = this.phases[this.currentPhase].prompts[this.currentPromptIndex];

        if (success) {
            // Successfully typed the lie
            this.responseText.setText(prompt.feedback || '"..."');

            this.tweens.add({
                targets: this.responseText,
                alpha: 1,
                duration: 500
            });

            // Increase guilt
            this.updateGuiltMeter(prompt.guiltAmount || 15);

            // Move to next prompt after delay
            this.time.delayedCall(2000, () => {
                this.currentPromptIndex++;
                this.isProcessingInput = false;
                this.startNextPrompt();
            });

        } else {
            // Failed to type in time
            this.typedTextDisplay.setColor('#ff4444');
            this.responseText.setText('(You stayed silent...)');
            this.responseText.setColor('#ff4444');

            this.tweens.add({
                targets: this.responseText,
                alpha: 1,
                duration: 500
            });

            // Even more guilt for failing
            this.updateGuiltMeter(prompt.guiltAmount * 1.5 || 25);

            // Retry or move on
            this.time.delayedCall(2000, () => {
                this.currentPromptIndex++;
                this.isProcessingInput = false;
                this.typedTextDisplay.setColor('#4a90e2');
                this.responseText.setColor('#888888');
                this.startNextPrompt();
            });
        }
    }

    /**
     * End game sequence
     */
    endGame() {
        // Transition to ending scene (to be created)
        this.scene.start('EndingScene', {
            guiltLevel: this.guiltLevel
        });
    }

    update() {
        // Game loop (if needed for continuous updates)
    }
}
