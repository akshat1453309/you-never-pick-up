# You Never Pick Up

A narrative-driven game about distress, guilt, and the impossible task of being there for everyone (including yourself).

---

## About

**You Never Pick Up** is a 5-day workshop game built for the DISTRESS theme. You're receiving multiple phone calls simultaneously from people in your life - Mom, Friend, Partner, and others. You can only talk to one person at a time. As you try to help everyone, you realize you're neglecting someone crucial: yourself.

**The Twist:** All the callers are different aspects of yourself that you've been ignoring.

---

## How to Run

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required

### Running Locally
1. Open `index.html` in your web browser
   - **Option 1:** Double-click `index.html`
   - **Option 2:** Right-click → Open With → [Browser]
   - **Option 3:** Use VS Code Live Server extension

### Development
1. Open project folder in VS Code
2. Install Live Server extension (optional, for auto-reload)
3. Right-click `index.html` → "Open with Live Server"
4. Edit files in `js/` folder
5. Refresh browser to see changes

---

## Current Status

**Development Phase:** Initial Setup
**Completion:** 0% (Day 0 of 5)

### Implemented Features
- ✅ Project structure
- ✅ Documentation system
- ⬜ Core phone UI
- ⬜ Conversation system
- ⬜ Call switching
- ⬜ Dialogue content
- ⬜ Twist reveal
- ⬜ Sound effects
- ⬜ Polish & effects

---

## Core Features (Planned)

### Gameplay
- **Call Management:** Answer and switch between multiple incoming calls
- **Conversation System:** Text-based dialogue with player choices
- **Patience Mechanic:** Ignored callers become impatient (optional)
- **Narrative Twist:** Revelation that all callers are aspects of yourself

### Technical
- Built with Phaser 3 framework
- No build process (CDN-based)
- Browser-based (HTML/CSS/JavaScript)
- Mobile-friendly touch controls

---

## Documentation

This project uses a comprehensive documentation system:

- **[RULES.md](RULES.md)** - Coding standards and conventions
- **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** - Living project state and design decisions
- **[DONT_DO.md](DONT_DO.md)** - Anti-patterns and mistakes to avoid
- **[PROGRESS_LOG.md](PROGRESS_LOG.md)** - Session-by-session changelog

---

## Development Workflow

### Starting a Session
1. Open VS Code with project folder
2. Open Claude Code extension
3. Run `/start-session` command (loads all context)
4. Work on features with Claude assistance
5. Test frequently (open index.html in browser)

### Ending a Session
1. Run `/end-session` command (updates documentation)
2. Review changes: `git status`
3. Commit: `git add . && git commit -m "type: description"`
4. Test final state before closing

---

## Project Structure

```
you-never-pick-up/
├── index.html              # Main entry point
├── js/
│   ├── main.js            # Phaser config
│   ├── scenes/            # Game scenes
│   ├── managers/          # Game logic
│   └── data/              # Dialogue content
├── assets/
│   ├── images/            # Sprites, UI, profiles
│   └── sounds/            # Audio files
├── css/                   # Styling
├── .claude/               # Claude Code config
├── RULES.md              # Coding standards
├── PROJECT_CONTEXT.md    # Project state
├── DONT_DO.md           # Anti-patterns
├── PROGRESS_LOG.md      # Changelog
└── README.md            # This file
```

---

## 5-Day Roadmap

### Day 1: Core Prototype
- [ ] Working phone UI with one complete conversation
- [ ] Answer button functionality
- [ ] Dialogue choice system

### Day 2: Multiple Calls + Switching
- [ ] 3+ conversations implemented
- [ ] Call switching UI
- [ ] Visual indicators for waiting calls

### Day 3: Weird Calls + Consequences
- [ ] All 4-5 calls with strange details
- [ ] Consequence system (patience/narrative)
- [ ] Hints of the twist emerging

### Day 4: Revelation + Polish
- [ ] Final "YOU" conversation
- [ ] Photo reveal transition
- [ ] Sound effects integrated
- [ ] Full playthrough tested

### Day 5: Balance & Present
- [ ] Playtesting and balance
- [ ] Bug fixes
- [ ] Title and credits screens
- [ ] Presentation preparation

---

## Technical Details

### Framework
- **Phaser 3.55.2** (via CDN)
- No build tools required
- Pure JavaScript (ES6+)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Audio
- Format: MP3 (primary), OGG (fallback)
- Note: Audio requires user interaction to start (browser policy)

### Assets
- Images: PNG format, <200KB per file
- Target resolution: 800x600px game canvas
- Mobile-responsive design

---

## Credits

**Game Design & Programming:** Akshat Pandey
**Framework:** Phaser 3 (photonstorm.com)
**Development Approach:** Claude Code (AI-assisted development)
**Workshop Theme:** DISTRESS

---

## License

Workshop/educational project. All rights reserved.

---

## Contact & Support

For issues or questions during development:
1. Check [DONT_DO.md](DONT_DO.md) for known problems
2. Review [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for current state
3. Consult handoff document for design decisions

---

**Last Updated:** December 8, 2024
**Version:** 0.1.0 (Initial Setup)
