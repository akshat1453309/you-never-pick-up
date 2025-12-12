# Debug Mode Guide

## Overview
This game now includes a powerful Debug Level Editor Tool that allows you to drag objects around the screen and copy their positions as valid JSON.

## Features

### 1. Shop Screen with PNG Images
- The shop now uses PNG images instead of blue boxes
- Currently, the cigarette box image is used for the first shop item (Food/Cigarette Box)
- Click on any shop item image to open an upgrade modal
- The modal shows:
  - Item name and description
  - Health restoration amount (+25 for Cigarette Box)
  - Cost
  - Buy and Cancel buttons
- All purchases are logged to the browser console with detailed information

### 2. Debug Mode

#### Activating Debug Mode
Press **D** key to toggle debug mode ON/OFF

When debug mode is active:
- Green "DEBUG MODE: ON" text appears at the top of the screen
- Yellow mode indicator shows current selection mode
- All registered objects become draggable (with visual tint)
- Console logs all debug operations

#### Selection Modes
Press number keys to switch between different object types:
- **1** = Units mode (only unit objects are draggable)
- **2** = UI mode (only UI objects are draggable)
- **3** = Background mode (only background objects are draggable)
- Default = All objects are draggable

#### Dragging and JSON Output
1. Enable debug mode with **D**
2. Drag any registered object to a new position
3. Release the mouse button (dragend event)
4. Check the browser console for JSON output

Example console output:
```json
[LevelData] {
  "id": "shop_item_0",
  "x": 450,
  "y": 300,
  "type": "shop_item",
  "texture": "cigerette_box",
  "scale": 0.5,
  "name": "Food",
  "label": "Cigarette Box",
  "cost": 30,
  "healthRestore": 25
}
```

#### Console Commands
The debug helper provides extensive console logging:
- `[DebugHelper]` - Debug mode status messages
- `[Shop]` - Shop interaction logs (purchases, modal opens, etc.)
- `[LevelData]` - JSON position data for dragged objects
- `[EndOfDayScene]` - Scene initialization logs

## How to Use Debug Mode for Level Design

### Step 1: Enable Debug Mode
1. Launch the game
2. Navigate to the shop screen (End of Day scene)
3. Press **D** to enable debug mode

### Step 2: Position Objects
1. Select the appropriate mode (1, 2, or 3) or leave in default mode
2. Click and drag objects to desired positions
3. Each time you release an object, JSON data is logged to console

### Step 3: Copy JSON Data
1. Open browser console (F12)
2. Look for `[LevelData]` entries
3. Copy the JSON output
4. Paste directly into your level data files

### Step 4: Disable Debug Mode
Press **D** again to turn off debug mode and return to normal gameplay

## Custom Object Registration

To add debug support to other game objects:

```javascript
// In your scene's create() method
if (typeof DebugHelper !== 'undefined') {
    this.debugHelper = new DebugHelper(this);
}

// Register a game object
this.debugHelper.registerObject(
    gameObject,     // The Phaser game object
    'ui',           // Type: 'units', 'ui', 'background', or 'all'
    'unique_id',    // Unique identifier
    {               // Additional data to include in JSON
        customProp1: 'value1',
        customProp2: 'value2'
    }
);

// Add toJSON method to your object
gameObject.toJSON = function() {
    return {
        id: 'unique_id',
        x: Math.round(this.x),
        y: Math.round(this.y),
        type: 'my_object_type',
        texture: this.texture.key,
        // Add any custom properties
    };
};
```

## Shop Console Debugging

All shop operations are logged to console:

### Opening Items
```
[Shop] Opened upgrade modal for: Food
[Shop] Cost: $30, Health Restore: +25
```

### Purchasing Items
```
[Shop] Purchased Food for $30
[Shop] Health restored: +25% (Current: 85%)
[Shop] Money remaining: $70
```

### Purchase Failures
```
[Shop] Cannot afford Food. Need $30, have $20
```

## Tips
- Use debug mode to fine-tune object positions
- Copy JSON directly from console - no manual coordinate entry needed
- Selection modes help prevent accidentally moving the wrong objects
- All console logs are prefixed for easy filtering
- Debug mode persists across scene changes until toggled off

## Browser Console Tips
- **F12** - Open developer console
- **Ctrl+L** (or **Cmd+K**) - Clear console
- **Right-click on log** → "Copy object" - Copy JSON objects
- Filter logs by typing "[DebugHelper]" or "[Shop]" in console filter
