/**
 * DebugHelper - WYSIWYG Level Editor for Phaser 3
 *
 * Features:
 * - Toggle debug mode with 'D' key
 * - Drag objects around the screen
 * - Output valid JSON on dragend
 * - Selection modes (1, 2, 3) for different object types
 * - Visual indicator when debug mode is active
 */

class DebugHelper {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.debugObjects = [];
        this.debugText = null;
        this.currentMode = 'all'; // 'all', 'units', 'ui', 'background'
        this.modeText = null;

        // Initialize debug mode
        this.init();
    }

    init() {
        // Add 'D' key to toggle debug mode
        this.scene.input.keyboard.on('keydown-D', () => {
            this.toggleDebugMode();
        });

        // Add number keys for selection modes
        this.scene.input.keyboard.on('keydown-ONE', () => {
            this.setSelectionMode('units');
        });

        this.scene.input.keyboard.on('keydown-TWO', () => {
            this.setSelectionMode('ui');
        });

        this.scene.input.keyboard.on('keydown-THREE', () => {
            this.setSelectionMode('background');
        });

        // Add keyboard shortcuts for scaling selected objects
        this.scene.input.keyboard.on('keydown-PLUS', () => {
            this.scaleSelectedObjects(0.1);
        });

        this.scene.input.keyboard.on('keydown-MINUS', () => {
            this.scaleSelectedObjects(-0.1);
        });

        this.scene.input.keyboard.on('keydown-OPEN_BRACKET', () => {
            this.scaleSelectedObjects(-0.05);
        });

        this.scene.input.keyboard.on('keydown-CLOSE_BRACKET', () => {
            this.scaleSelectedObjects(0.05);
        });

        console.log('[DebugHelper] Initialized. Press D to toggle debug mode.');
        console.log('[DebugHelper] Controls: Drag to move | Mouse wheel or +/- to scale | 1/2/3 for modes');
    }

    toggleDebugMode() {
        this.enabled = !this.enabled;

        if (this.enabled) {
            this.enableDebugMode();
        } else {
            this.disableDebugMode();
        }
    }

    enableDebugMode() {
        console.log('[DebugHelper] 🔧 DEBUG MODE: ON');
        console.log('[DebugHelper] Objects are now DRAGGABLE - Click and drag to move them!');

        // Create debug mode text overlay
        const { width } = this.scene.cameras.main;
        this.debugText = this.scene.add.text(width / 2, 20, 'DEBUG MODE: ON - Click & Drag Objects', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff00',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setDepth(10000) // Very high depth to appear above everything
        .setScrollFactor(0); // Fixed position even if camera moves

        // Create mode text
        this.modeText = this.scene.add.text(width / 2, 50, `Mode: ${this.currentMode.toUpperCase()}`, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffff00',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setDepth(10000)
        .setScrollFactor(0);

        // Create controls help text
        this.controlsText = this.scene.add.text(width / 2, 78, 'Wheel/+/-=Scale | [/]=Fine Scale | 1/2/3=Filter Objects', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa',
            fontStyle: 'normal',
            backgroundColor: '#000000',
            padding: { x: 10, y: 3 }
        })
        .setOrigin(0.5)
        .setDepth(10000)
        .setScrollFactor(0);

        console.log('[DebugHelper] Controls:');
        console.log('  - CLICK AND DRAG objects to move them');
        console.log('  - Mouse wheel, +/- keys to scale');
        console.log('  - [ ] keys for fine scaling');
        console.log('  - Press 1=Units, 2=UI, 3=Background to switch selection modes');
        console.log('  - JSON logged to console on dragend');

        // Enable dragging on all registered objects
        this.updateDraggableObjects();
    }

    disableDebugMode() {
        console.log('[DebugHelper] 🔧 DEBUG MODE: OFF');

        // Remove debug text overlay
        if (this.debugText) {
            this.debugText.destroy();
            this.debugText = null;
        }

        if (this.modeText) {
            this.modeText.destroy();
            this.modeText = null;
        }

        if (this.controlsText) {
            this.controlsText.destroy();
            this.controlsText = null;
        }

        // Disable dragging on all objects and remove visual feedback
        this.debugObjects.forEach(obj => {
            if (obj.gameObject) {
                if (obj.gameObject.input) {
                    obj.gameObject.input.draggable = false;
                }

                // Remove visual feedback
                if (obj.gameObject.clearTint) {
                    obj.gameObject.clearTint();
                }

                // Remove debug mode flag
                obj.gameObject._debugMode = false;
            }
        });
    }

    setSelectionMode(mode) {
        if (!this.enabled) {
            console.log('[DebugHelper] Enable debug mode first (press D)');
            return;
        }

        this.currentMode = mode;
        console.log(`[DebugHelper] Selection mode: ${mode.toUpperCase()}`);

        if (this.modeText) {
            this.modeText.setText(`Mode: ${mode.toUpperCase()}`);
        }

        // Update which objects are draggable based on mode
        this.updateDraggableObjects();
    }

    updateDraggableObjects() {
        this.debugObjects.forEach(obj => {
            const shouldBeDraggable = this.currentMode === 'all' || obj.type === this.currentMode;

            if (shouldBeDraggable && obj.gameObject) {
                // Store existing handlers
                const clickHandler = obj.gameObject._clickHandler;
                const pointerUpHandler = obj.gameObject._pointerUpHandler;
                const hoverEnterHandler = obj.gameObject._hoverEnterHandler;
                const hoverExitHandler = obj.gameObject._hoverExitHandler;

                // CRITICAL: Remove ALL pointerdown listeners (without specifying handler)
                // This removes ALL pointerdown handlers, not just the one we stored
                obj.gameObject.off('pointerdown');
                obj.gameObject.off('pointerup');
                obj.gameObject.off('pointerover');
                obj.gameObject.off('pointerout');

                // Remove and re-add interactive to enable dragging properly
                if (obj.gameObject.input) {
                    obj.gameObject.removeInteractive();
                }

                // Re-add interactive with draggable enabled
                obj.gameObject.setInteractive({
                    draggable: true,
                    useHandCursor: true
                });

                // CRITICAL FIX: Do NOT re-attach pointerdown (click) handler when draggable
                // In Phaser, pointerdown handlers prevent drag events from firing
                // We only re-attach hover and pointerup handlers
                if (pointerUpHandler) {
                    obj.gameObject.on('pointerup', pointerUpHandler);
                }
                if (hoverEnterHandler) {
                    obj.gameObject.on('pointerover', hoverEnterHandler);
                }
                if (hoverExitHandler) {
                    obj.gameObject.on('pointerout', hoverExitHandler);
                }

                console.log(`[DebugHelper] Made ${obj.id} draggable (mode: ${this.currentMode})`);
                console.log(`[DebugHelper] Draggable property: ${obj.gameObject.input.draggable}`);
                console.log(`[DebugHelper] ALL pointerdown handlers REMOVED - drag is now active`);

                // Add visual feedback (tint or outline)
                if (obj.gameObject.setTint) {
                    obj.gameObject.setTint(0x00ff00);
                }

                // Mark object as in debug mode
                obj.gameObject._debugMode = true;
            } else if (obj.gameObject && obj.gameObject.input) {
                // Store existing handlers
                const clickHandler = obj.gameObject._clickHandler;
                const pointerUpHandler = obj.gameObject._pointerUpHandler;
                const hoverEnterHandler = obj.gameObject._hoverEnterHandler;
                const hoverExitHandler = obj.gameObject._hoverExitHandler;

                // Remove ALL event listeners
                obj.gameObject.off('pointerdown');
                obj.gameObject.off('pointerup');
                obj.gameObject.off('pointerover');
                obj.gameObject.off('pointerout');

                // Disable dragging - restore original interactive
                obj.gameObject.removeInteractive();
                obj.gameObject.setInteractive({ useHandCursor: true });

                // Re-attach ALL stored handlers when not draggable (normal mode)
                if (clickHandler) {
                    obj.gameObject.on('pointerdown', clickHandler);
                }
                if (pointerUpHandler) {
                    obj.gameObject.on('pointerup', pointerUpHandler);
                }
                if (hoverEnterHandler) {
                    obj.gameObject.on('pointerover', hoverEnterHandler);
                }
                if (hoverExitHandler) {
                    obj.gameObject.on('pointerout', hoverExitHandler);
                }

                obj.gameObject.input.draggable = false;

                // Remove visual feedback
                if (obj.gameObject.clearTint) {
                    obj.gameObject.clearTint();
                }

                // Remove debug mode flag
                obj.gameObject._debugMode = false;
            }
        });
    }

    /**
     * Register an object for debug editing
     * @param {Phaser.GameObjects.GameObject} gameObject - The Phaser game object
     * @param {string} type - Object type: 'units', 'ui', 'background', or 'all'
     * @param {string} id - Unique identifier for the object
     * @param {Object} additionalData - Any additional data to include in JSON output
     */
    registerObject(gameObject, type = 'all', id = null, additionalData = {}) {
        if (!gameObject) return;

        const objectId = id || `obj_${this.debugObjects.length}`;

        const debugObject = {
            gameObject: gameObject,
            type: type,
            id: objectId,
            additionalData: additionalData
        };

        this.debugObjects.push(debugObject);

        // Track if object is being dragged
        let isDragging = false;

        // Add drag event handlers
        gameObject.on('dragstart', () => {
            isDragging = true;
            gameObject._isDragging = true;
            console.log('[DebugHelper] Started dragging:', objectId);
        });

        gameObject.on('drag', (pointer, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        gameObject.on('dragend', () => {
            isDragging = false;
            this.outputObjectJSON(debugObject);

            // Small delay before allowing clicks again
            this.scene.time.delayedCall(50, () => {
                gameObject._isDragging = false;
            });
        });

        // Add mouse wheel for scaling (when hovering over object in debug mode)
        gameObject.on('wheel', (pointer, deltaX, deltaY, deltaZ) => {
            if (this.enabled && gameObject._debugMode) {
                const scaleDelta = deltaY > 0 ? -0.05 : 0.05;
                const newScale = Math.max(0.1, gameObject.scale + scaleDelta);
                gameObject.setScale(newScale);

                console.log(`[DebugHelper] Scaled ${objectId} to ${newScale.toFixed(2)}`);
            }
        });

        // If debug mode is already enabled, make this object draggable
        if (this.enabled) {
            this.updateDraggableObjects();
        }
    }

    /**
     * Register multiple objects at once
     * @param {Array} objects - Array of {gameObject, type, id, additionalData}
     */
    registerObjects(objects) {
        objects.forEach(obj => {
            this.registerObject(obj.gameObject, obj.type, obj.id, obj.additionalData);
        });
    }

    /**
     * Output object data as valid JSON to console
     */
    outputObjectJSON(debugObject) {
        const obj = debugObject.gameObject;

        // Try to use object's toJSON method if it exists
        if (obj.toJSON && typeof obj.toJSON === 'function') {
            const json = obj.toJSON();
            console.log('[LevelData]', JSON.stringify(json, null, 2));
            return;
        }

        // Otherwise, create basic JSON structure
        const data = {
            id: debugObject.id,
            x: Math.round(obj.x),
            y: Math.round(obj.y),
            type: debugObject.type,
            texture: obj.texture ? obj.texture.key : null,
            scale: obj.scale ? { x: obj.scaleX, y: obj.scaleY } : null,
            rotation: obj.rotation || 0,
            alpha: obj.alpha || 1,
            depth: obj.depth || 0,
            ...debugObject.additionalData
        };

        console.log('[LevelData]', JSON.stringify(data, null, 2));
    }

    /**
     * Scale all objects that are currently draggable
     * @param {number} delta - Amount to change scale by (positive or negative)
     */
    scaleSelectedObjects(delta) {
        if (!this.enabled) return;

        let scaledCount = 0;
        this.debugObjects.forEach(obj => {
            const shouldBeDraggable = this.currentMode === 'all' || obj.type === this.currentMode;

            if (shouldBeDraggable && obj.gameObject) {
                const newScale = Math.max(0.1, obj.gameObject.scale + delta);
                obj.gameObject.setScale(newScale);
                scaledCount++;

                console.log(`[DebugHelper] Scaled ${obj.id} to ${newScale.toFixed(2)}`);
            }
        });

        if (scaledCount === 0) {
            console.log('[DebugHelper] No objects to scale in current mode');
        }
    }

    /**
     * Clear all registered objects
     */
    clearObjects() {
        this.debugObjects = [];
    }

    /**
     * Export all registered objects as JSON array
     */
    exportAllObjects() {
        const allData = this.debugObjects.map(debugObject => {
            const obj = debugObject.gameObject;

            if (obj.toJSON && typeof obj.toJSON === 'function') {
                return obj.toJSON();
            }

            return {
                id: debugObject.id,
                x: Math.round(obj.x),
                y: Math.round(obj.y),
                type: debugObject.type,
                texture: obj.texture ? obj.texture.key : null,
                scale: obj.scale ? { x: obj.scaleX, y: obj.scaleY } : null,
                rotation: obj.rotation || 0,
                alpha: obj.alpha || 1,
                depth: obj.depth || 0,
                ...debugObject.additionalData
            };
        });

        console.log('[LevelData] All Objects:', JSON.stringify(allData, null, 2));
        return allData;
    }

    /**
     * Destroy the debug helper
     */
    destroy() {
        if (this.debugText) {
            this.debugText.destroy();
        }
        if (this.modeText) {
            this.modeText.destroy();
        }
        this.scene.input.keyboard.off('keydown-D');
        this.scene.input.keyboard.off('keydown-ONE');
        this.scene.input.keyboard.off('keydown-TWO');
        this.scene.input.keyboard.off('keydown-THREE');
        this.debugObjects = [];
    }
}
