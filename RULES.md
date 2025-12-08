# Coding Standards - You Never Pick Up

## Naming Conventions

### JavaScript
- **Variables & Functions:** camelCase
  - `let playerChoice = 0;`
  - `function showDialogue() {}`
- **Classes:** PascalCase
  - `class CallManager {}`
  - `class PhoneScene extends Phaser.Scene {}`
- **Constants:** UPPER_SNAKE_CASE
  - `const MAX_CALLS = 5;`
  - `const PATIENCE_DRAIN_RATE = 1;`

### Files
- **Scenes:** PascalCase with .js extension
  - `PhoneScene.js`
  - `ConversationScene.js`
- **Managers:** PascalCase with .js extension
  - `CallManager.js`
  - `DialogueManager.js`
- **Data:** lowercase with .js extension
  - `dialogue.js`

## Code Style

### General Principles
- **Pure functions where possible** - Avoid side effects
- **Clear, descriptive names** - Code should read like prose
- **Comments for "why", not "what"** - Explain intent, not obvious operations
- **Single responsibility** - Each function does one thing well
- **DRY (Don't Repeat Yourself)** - Extract common patterns

### Comments
```javascript
// GOOD: Explains why
// Fade to black before revealing the twist to build tension
this.cameras.main.fadeOut(1000);

// BAD: Explains what (obvious from code)
// Set x to 400
this.x = 400;
```

### Function Structure
```javascript
// Preferred structure
function updatePatience(callerId, deltaTime) {
    // Guard clauses first
    if (!callerId) return;
    if (!activeCalls[callerId]) return;

    // Main logic
    const call = activeCalls[callerId];
    call.patience -= PATIENCE_DRAIN_RATE * deltaTime;

    // Handle consequences
    if (call.patience <= 0) {
        handleHangup(callerId);
    }
}
```

## Git Commit Format

### Format
```
type: brief description

Optional longer explanation if needed
```

### Types
- **feat:** New feature
  - `feat: add call switching UI`
- **fix:** Bug fix
  - `fix: prevent double-click on answer button`
- **docs:** Documentation changes
  - `docs: update PROGRESS_LOG for session 2`
- **refactor:** Code restructure without changing behavior
  - `refactor: extract dialogue rendering to function`
- **test:** Adding or updating tests
  - `test: verify patience meter drains correctly`
- **chore:** Maintenance tasks
  - `chore: optimize asset file sizes`

### Examples
```bash
# Good commits
git commit -m "feat: implement Mom conversation dialogue"
git commit -m "fix: phone ring sound not playing on first call"
git commit -m "docs: add Day 1 entry to PROGRESS_LOG"

# Bad commits
git commit -m "stuff"
git commit -m "fixed it"
git commit -m "updates"
```

## Performance Rules

### Asset Optimization
- **Images:** Keep under 200KB per file
  - Use PNG for transparency
  - Use WebP for smaller sizes (if browser support OK)
  - Compress before adding to project
- **Audio:** MP3 or OGG format
  - Keep loops under 1MB
  - Sound effects under 100KB

### Code Optimization
- **Minimize asset preloading** - Only load what's needed for current scene
- **Reuse objects** - Don't create new objects in update loops
- **Cache frequently accessed values** - Store in variables, don't recalculate

```javascript
// BAD: Creates new array every frame
update() {
    this.calls.filter(c => c.active).forEach(call => {
        // process
    });
}

// GOOD: Cache active calls, update only when changed
updateActiveCalls() {
    this.activeCalls = this.calls.filter(c => c.active);
}

update() {
    this.activeCalls.forEach(call => {
        // process
    });
}
```

## Phaser-Specific Guidelines

### Scene Structure
```javascript
class ExampleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ExampleScene' });
    }

    init(data) {
        // Initialize scene data passed from other scenes
    }

    preload() {
        // Load assets for this scene only
    }

    create() {
        // Set up scene objects, don't update them here
    }

    update(time, delta) {
        // Game loop - keep lightweight
    }
}
```

### Asset Loading
```javascript
// Organize by type
preload() {
    // Images
    this.load.image('phone_frame', 'assets/images/phone_frame.png');
    this.load.image('profile_mom', 'assets/images/profile_mom.png');

    // Audio
    this.load.audio('ring', 'assets/sounds/phone_ring.mp3');
    this.load.audio('notification', 'assets/sounds/notification.mp3');
}
```

### Tweens and Animations
```javascript
// Use tweens for smooth transitions
this.tweens.add({
    targets: this.phoneUI,
    alpha: 0,
    duration: 500,
    ease: 'Power2',
    onComplete: () => {
        // Callback after animation
    }
});
```

## Testing Guidelines

### Manual Playtesting (Every Session)
- [ ] Test on Chrome/Firefox
- [ ] Test full playthrough (start to end)
- [ ] Check for console errors (F12)
- [ ] Verify all assets load correctly
- [ ] Test all dialogue branches
- [ ] Verify sounds play when expected

### Edge Cases to Test
- Click buttons rapidly (prevent double-clicks)
- Switch calls mid-sentence
- Ignore calls until they hang up
- Try to answer already active call
- Refresh page mid-game

### Debugging
```javascript
// Use console.log strategically
console.log('Call answered:', callerId, this.activeCalls);

// Add visual debug info if needed
this.add.text(10, 10, 'Debug Info', {
    fontSize: '12px',
    color: '#00ff00'
});
```

## Code Review Checklist

Before committing, verify:
- [ ] Code follows naming conventions
- [ ] Comments explain intent (not obvious operations)
- [ ] No console.log statements left in (unless intentional debug info)
- [ ] Assets are optimized (file sizes)
- [ ] Git commit message follows format
- [ ] Manual testing completed
- [ ] Documentation updated (PROJECT_CONTEXT, PROGRESS_LOG)

## Accessibility Considerations

### Text Readability
- Minimum font size: 16px
- High contrast text (light on dark or dark on light)
- Avoid pure white on pure black (eye strain)
- Recommended: #e0e0e0 text on #1a1a1a background

### User Experience
- Button click targets: minimum 44x44px
- Visual feedback on all interactions (hover, click)
- Clear indication of which conversation is active
- Pause button or ability to slow down (if time permits)

## Don't Do

See [DONT_DO.md](DONT_DO.md) for anti-patterns and common mistakes to avoid.

---

**Remember:** These rules serve the goal of creating an emotionally impactful game in 5 days. When in doubt, choose clarity and simplicity over cleverness.
