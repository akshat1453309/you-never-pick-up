# Quick Start Guide

## 🚀 Launch the Game

The server is running at: **http://localhost:3000**

## 🎮 Testing the New Features

### 1. Navigate to Shop
1. Play the game (type documents)
2. Click **"Clock Out"** (top-left)
3. You'll see the End of Day shop

### 2. Click Cigarette Box
- Click on the cigarette box image
- Modal pops up showing:
  - **+25 Health** (in green)
  - Cost and description
  - Buy/Cancel buttons

### 3. Enable Debug Mode
Press **'D'** key:
- Green "DEBUG MODE: ON" appears at top
- Yellow mode indicator shows
- Controls help text displays
- Cigarette box gets green tint (draggable)

### 4. Move Objects
- **Click and drag** the cigarette box to move it
- When you release, JSON position data logs to console
- Modal won't open while in debug mode

### 5. Resize Objects

**Method 1: Mouse Wheel**
- Hover over the cigarette box
- Scroll mouse wheel up/down to scale

**Method 2: Keyboard**
- Press **+** or **-** for large scale changes (±0.1)
- Press **[** or **]** for fine scale adjustments (±0.05)
- These scale ALL objects in current mode

### 6. Selection Modes
- Press **'1'** → Units mode only
- Press **'2'** → UI mode only
- Press **'3'** → Background mode only
- Current mode shown in yellow text

### 7. View Console Output
Press **F12** (or **Cmd+Option+I** on Mac):

```javascript
[DebugHelper] 🔧 DEBUG MODE: ON
[DebugHelper] Controls:
  - Drag objects to move them
  - Mouse wheel, +/- keys to scale
  - [ ] keys for fine scaling
  - Press 1=Units, 2=UI, 3=Background to switch selection modes
  - JSON logged to console on dragend

[DebugHelper] Started dragging: shop_item_0
[LevelData] {
  "id": "shop_item_0",
  "x": 520,
  "y": 340,
  "type": "shop_item",
  "texture": "cigerette_box",
  "scale": 0.65,
  "name": "Food",
  "label": "Cigarette Box",
  "cost": 30,
  "healthRestore": 25
}
[DebugHelper] Scaled shop_item_0 to 0.70
```

## 🎯 Key Controls Summary

| Key | Action |
|-----|--------|
| **D** | Toggle debug mode ON/OFF |
| **1** | Select Units mode |
| **2** | Select UI mode |
| **3** | Select Background mode |
| **+** | Scale up (0.1) |
| **-** | Scale down (0.1) |
| **[** | Scale down (0.05 fine) |
| **]** | Scale up (0.05 fine) |
| **Mouse Drag** | Move object |
| **Mouse Wheel** | Scale hovered object |

## ✅ What's Working Now

1. ✅ **Click cigarette box** → Opens modal with +25 health
2. ✅ **Debug mode prevents modal** → Can drag without triggering buy screen
3. ✅ **Drag to move** → JSON logged on release
4. ✅ **Resize with mouse wheel** → Hover + scroll
5. ✅ **Resize with keyboard** → +/- or [ ] keys
6. ✅ **Visual feedback** → Green tint in debug mode
7. ✅ **Console logging** → All actions logged
8. ✅ **Selection modes** → 1/2/3 to filter object types

## 🐛 Troubleshooting

### Modal keeps opening when I try to drag
- Make sure debug mode is ON (press D)
- Look for "DEBUG MODE: ON" in green at top
- Cigarette box should have green tint

### Can't resize with mouse wheel
- Hover directly over the object first
- Make sure debug mode is ON
- Try keyboard +/- instead

### Objects not draggable
- Check console for "[DebugHelper] Initialized" message
- Refresh page (Ctrl+R or Cmd+R)
- Check you're in correct selection mode (try pressing 2 for UI)

### JSON not showing in console
- Open console: F12 or Cmd+Option+I
- Drag and RELEASE object (JSON appears on dragend)
- Look for lines starting with [LevelData]

## 🎨 Next Steps

### Add More Shop Item Images
1. Add PNG files to `assets/shop/`:
   - `utilities_item.png`
   - `medicine_item.png`

2. Update `EndOfDayScene.js` preload (line 17-20):
```javascript
this.load.image('utilities_item', 'assets/shop/utilities_item.png');
this.load.image('medicine_item', 'assets/shop/medicine_item.png');
```

3. Update shop items array (line 128, 136):
```javascript
texture: 'utilities_item',  // Change from null
texture: 'medicine_item',   // Change from null
```

### Use in Other Scenes
Add to any scene's `create()` method:
```javascript
if (typeof DebugHelper !== 'undefined') {
    this.debugHelper = new DebugHelper(this);
    this.debugHelper.registerObject(myObject, 'ui', 'my_obj_id');
}
```

## 📋 Copy JSON to Level Files

1. Enable debug mode (D)
2. Drag objects to desired positions
3. Resize with mouse wheel or keyboard
4. Open console (F12)
5. Find `[LevelData]` entries
6. Copy JSON (right-click → Copy object)
7. Paste directly into your level data files

**Example JSON output:**
```json
{
  "id": "shop_item_0",
  "x": 520,
  "y": 340,
  "type": "shop_item",
  "texture": "cigerette_box",
  "scale": 0.65,
  "name": "Food",
  "label": "Cigarette Box",
  "cost": 30,
  "healthRestore": 25
}
```

This is valid JSON that can be copied directly into your game's level data configuration files!

## 🛑 Stop Server

When done testing:
```bash
lsof -ti:3000 | xargs kill
```

Or just close the terminal window.

---

**All features working!** 🎉 Enjoy your WYSIWYG level editor!
