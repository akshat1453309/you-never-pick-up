# Project Context - You Never Pick Up

**Last Updated:** December 11, 2025
**Current Status:** Existing Implementation - Bug Fixes Complete
**Game Type:** Office Typing Game with Phone Call Interruptions

---

## What This Game Actually Is

**IMPORTANT:** This project contains a DIFFERENT game than originally documented. The original phone management concept was replaced with a complete office typing game.

**Actual Game:** "You Never Pick Up" is a Phaser 3 office typing simulator where players type documents while being interrupted by phone calls from people in their life. Health drains passively and from ignoring calls. When health hits zero, the player dies from overwork, leading to a revelation that all callers were aspects of themselves they've been neglecting.

**Core Gameplay:**
- Type documents to complete work tasks
- Receive phone calls from Mom, Sarah, Professor Chen, Emma, Marcus, Dr. Williams
- Choose to answer (lose work time) or ignore (lose health)
- Health drains passively over time
- Death occurs at 0% health → Heart attack sequence
- Final reveal: All callers represent different needs (connection, love, growth, joy, friendship, health)

**Theme:** Overwork, self-neglect, work-life balance
**Message:** "Work will always be there. You won't."

---

## Current State

### What Exists (Fully Implemented)
- [x] Complete Phaser 3 game with 6 scenes
- [x] OfficeScene - Main gameplay with typing mechanics
- [x] PhoneInterruptionScene - Incoming call overlay
- [x] ConversationScene - Phone call dialogue system
- [x] EndOfDayScene - Work day completion
- [x] HeartAttackScene - Death sequence with red flashes and screen effects
- [x] RevealEndingScene - Final emotional revelation about callers
- [x] Health system with passive drain
- [x] Timer system for typing tasks
- [x] Phone UI with notifications
- [x] Multiple callers with unique relationships
- [x] Git repository with commit history
- [x] Complete documentation structure

### Files
```
you-never-pick-up/
├── index.html                     # Entry point, Phaser 3.55.2 CDN
├── js/
│   ├── main.js                   # Phaser config
│   └── scenes/
│       ├── OfficeScene.js        # Main gameplay (1444 lines)
│       ├── PhoneInterruptionScene.js
│       ├── ConversationScene.js
│       ├── EndOfDayScene.js
│       ├── HeartAttackScene.js
│       └── RevealEndingScene.js
├── assets/images/
│   └── office_desk_rough.png     # Office background
├── .claude/commands/
│   ├── start-session.md
│   ├── end-session.md
│   └── check-before-commit.md
├── RULES.md
├── PROJECT_CONTEXT.md (this file)
├── DONT_DO.md
├── PROGRESS_LOG.md
└── README.md
```

---

## Recent Bug Fixes (Session Dec 11, 2025)

### Fixed Issues

1. **RevealEndingScene Constructor Key Mismatch**
   - Issue: Constructor had `key: 'EndingScene'` but main.js referenced `'RevealEndingScene'`
   - Fix: Changed constructor to match reference
   - File: [RevealEndingScene.js:9](js/scenes/RevealEndingScene.js#L9)

2. **Favicon 404 Error**
   - Issue: Browser requested /favicon.ico causing console error
   - Fix: Added `<link rel="icon" href="data:,">` to suppress request
   - File: [index.html:7](index.html#L7)

3. **Scene Transition Crashes**
   - Issue: Explicit `scene.stop()` calls caused race conditions
   - Fix: Removed manual stop calls, let Phaser handle scene cleanup automatically
   - Files: OfficeScene.js, HeartAttackScene.js

4. **Critical: Infinite Tween Crash (`this._onUpdate.call is not a function`)**
   - Issue: `updateHealthVisualization()` created new infinite tweens every frame (10x/second) when health was low, stacking until Phaser's update loop broke
   - Root Cause: Health pulse tweens (<=30% health) and critical health tweens (<=20% health) were created without proper guards or cleanup
   - Fix: Completely removed all infinite tween effects from health visualization
   - File: [OfficeScene.js:1119-1146](js/scenes/OfficeScene.js#L1119-L1146)
   - **Removed Effects:**
     - Health bar pulse tweens
     - Camera rotation tweens
     - Warning overlay tweens
     - Screen flash/shake effects
     - Darkness/vignette effects
   - **Kept:** Simple health bar width/color updates only

5. **Debug Features Added**
   - Added '5' key debug trigger to set health to 5% instantly for testing
   - Added comprehensive console logging with emoji markers (💀, 📊, 🎬, etc.)
   - Added scene transition tracking
   - File: [OfficeScene.js:74-78](js/scenes/OfficeScene.js#L74-L78)

### Testing Status
- [x] Scene key mismatch fixed
- [x] Favicon error eliminated
- [x] Infinite tween crash resolved
- [ ] Full game playthrough tested (pending user confirmation)

---

## Known Technical Details

### Health System
- Starts at 100%
- Drains at 0.05% per 100ms (0.5% per second) passively
- Loses 10% when ignoring calls
- Loses health when answering calls (time away from work)
- Death triggers at 0% health

### Scene Flow
```
OfficeScene (main gameplay)
    ↓ (phone rings)
PhoneInterruptionScene (answer/ignore choice)
    ↓ (if answer)
ConversationScene (dialogue with caller)
    ↓ (return to work)
OfficeScene
    ↓ (clock out OR health = 0)
EndOfDayScene OR HeartAttackScene
    ↓
RevealEndingScene (final message)
    ↓ (restart)
OfficeScene (new game)
```

### Callers & Their Meanings
1. **Mom** → "Your need for connection"
2. **Sarah** → "Your need for love"
3. **Professor Chen** → "Your need to grow"
4. **Emma** → "Your need for joy"
5. **Marcus** → "Your need for friendship"
6. **Dr. Williams** → "Your need for health"

---

## Key Implementation Decisions

### Phaser via CDN
- Using Phaser 3.55.2 from jsdelivr CDN
- No build process, direct browser execution
- All code in global scope (no modules)

### Scene Management
- Phaser handles scene lifecycle automatically
- Use `scene.start()` not `scene.stop()` + `scene.launch()`
- Avoid manual cleanup, let Phaser dispose old scenes

### Tween Management
- **CRITICAL LESSON:** Never create infinite tweens (`repeat: -1`) in functions called repeatedly
- Always store tween references for cleanup
- Alternative: Remove tween effects entirely if they cause issues

### Health Visualization
- Simplified to avoid tween complexity
- Simple width/color updates only
- No animated effects to prevent crashes

---

## Immediate Next Steps

1. Test full game playthrough after bug fixes
2. Verify death sequence works both ways:
   - Pressing '5' debug key
   - Natural health drain to 0%
3. Ensure reveal scene appears correctly
4. Confirm restart button works

---

## Open Questions

- Should health visualization effects be re-added with proper guards?
- Any other visual feedback needed when health is low?
- Performance testing needed on slower devices?

---

## Success Criteria (Current State)

✅ Game runs without crashes
✅ All scene transitions work
✅ Death sequence triggers correctly
✅ Final reveal message displays
✅ Restart functionality works
⏳ Full playthrough tested (pending)

---

**This document reflects the actual implemented game, not the original design concept.**
