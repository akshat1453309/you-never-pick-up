# Project Context - You Never Pick Up

**Last Updated:** December 8, 2024
**Current Status:** Initial Setup
**Current Day:** Pre-Day 1

---

## What This Game Is

"You Never Pick Up" is a narrative-driven Phaser 3 game about distress, guilt, and self-neglect. Players receive multiple phone calls simultaneously from people in their life (Mom, Friend, Partner, Unknown). They can only talk to one person at a time, creating pressure and guilt. The twist: all the callers are different aspects of yourself that you've been neglecting.

**Theme:** DISTRESS (workshop theme)
**Timeline:** 5 days
**Emotional Goal:** Create guilt through sacrifice → Recognition of self-neglect pattern

---

## Current State

### What Exists
- [x] Project folder structure created
- [x] Documentation files initialized (RULES, PROJECT_CONTEXT, DONT_DO, PROGRESS_LOG, README)
- [ ] .claude/settings.local.json with permissions
- [ ] Slash commands (/start-session, /end-session, /check-before-commit)
- [ ] index.html with Phaser CDN
- [ ] main.js with Phaser config
- [ ] Git repository initialized
- [ ] Initial commit

### What Doesn't Exist Yet
- [ ] Any Phaser scenes (PhoneScene, ConversationScene, RevelationScene)
- [ ] Call management system
- [ ] Dialogue system
- [ ] Dialogue content/writing
- [ ] Any assets (images, sounds)
- [ ] UI implementation
- [ ] Patience meter system
- [ ] Revelation/twist sequence

---

## Core Mechanics Design

### 1. Call Management
**How it works:**
- Multiple incoming calls displayed on phone UI
- Player clicks/taps to switch between conversations
- Only ONE conversation can be active at a time
- Inactive calls show notification badges

**Implementation approach (planned):**
- CallManager class tracks all active calls
- Each call has: id, name, profileImage, messages[], patience, isActive
- Switch call: pause current, activate selected, resume where left off

### 2. Patience System (OPTIONAL - decide Day 2)
**Option A - Meters (more gamey):**
- Each call has patience value (starts at 100)
- Drains slowly while ignored (e.g., -1 per second)
- Visual meter shows current patience
- At 0, person hangs up permanently

**Option B - Narrative only:**
- No meters, just increasingly desperate messages
- Emotional pressure instead of mechanical timer
- Simpler to implement

**Decision:** Start without meters, add if time permits and feels right

### 3. Conversation System
**How it works:**
- Text messages appear one at a time
- Player sees 2-4 dialogue choice buttons
- Clicking a choice advances conversation
- Choices are mostly illusion (linear narrative with branching feel)

**Implementation approach:**
- DialogueManager loads dialogue from dialogue.js
- Tracks current conversation position for each caller
- Handles choice selection → next message mapping

### 4. Revelation Sequence
**How the twist is revealed:**
1. Final call from "Unknown" becomes increasingly surreal
2. Unknown reveals personal details only YOU would know
3. Screen glitches (optional visual effect)
4. Contact photo fades out
5. Fades back in showing YOUR photo
6. Explicit dialogue: "All of them. Every voice. It was always me."

**Implementation approach:**
- Simple fade transition (Day 1-4)
- Upgrade to glitch effect if time (Day 5)
- Use Phaser tweens for smooth transitions

---

## File Structure

```
you-never-pick-up/
├── index.html                 # Main entry point, Phaser CDN
├── js/
│   ├── main.js               # Phaser config, game init
│   ├── scenes/
│   │   ├── PhoneScene.js         # Main phone UI (call list)
│   │   ├── ConversationScene.js  # Active conversation view
│   │   └── RevelationScene.js    # Final twist sequence
│   ├── managers/
│   │   ├── CallManager.js        # State management for calls
│   │   └── DialogueManager.js    # Conversation flow logic
│   └── data/
│       └── dialogue.js           # All conversation content
├── assets/
│   ├── images/
│   │   ├── phone_frame.png       # Phone UI background
│   │   ├── profile_*.png         # Contact photos (5 total)
│   │   └── backgrounds/          # Optional atmosphere
│   └── sounds/
│       ├── phone_ring.mp3        # Incoming call
│       ├── notification.mp3      # New message alert
│       ├── hangup.mp3            # Call ended
│       ├── static.mp3            # Glitch effect
│       └── ambient.mp3           # Background tension
├── css/
│   └── style.css                 # Minimal styling
├── .claude/
│   ├── commands/
│   │   ├── start-session.md      # Load context
│   │   ├── end-session.md        # Update docs
│   │   └── check-before-commit.md # Pre-commit checklist
│   └── settings.local.json       # Permissions config
├── RULES.md                      # Coding standards
├── PROJECT_CONTEXT.md            # This file
├── DONT_DO.md                    # Anti-patterns
├── PROGRESS_LOG.md               # Session changelog
└── README.md                     # Project overview
```

---

## Key Design Decisions

### Decision 1: Phaser via CDN (No Build Process)
**Reasoning:** Faster setup, simpler deployment, focus on game logic not tooling
**Trade-off:** No TypeScript, no module bundling, but acceptable for 5-day scope

### Decision 2: Call Switching Over Signal Stability Mechanic
**Reasoning:** Signal mechanics felt disconnected from emotional narrative
**Alternative considered:** Drag slider to maintain signal strength
**Chosen:** Simple call switching creates same guilt through choice prioritization

### Decision 3: 4 Core Calls (Scalable to 5-6)
**Core 4:**
1. Mom (need for approval/validation)
2. Friend (loneliness/social needs)
3. Partner (need for love/connection)
4. Unknown/You (the truth)

**Optional 5th/6th:**
5. Sibling/Child (inner child)
6. Past/Future You (time variant)

**Reasoning:** 4 creates sufficient overwhelm without exhausting player

### Decision 4: Simple Fade Transition (Upgradable)
**Day 1-4:** Use basic fade (functional, fast to implement)
**Day 5:** If time, upgrade to glitch effect for polish
**Reasoning:** Emotional impact is in dialogue, not visual effect

### Decision 5: Single Ending with Choice Variants
**Final choice options:**
1. "I promise I will." (hopeful)
2. "I don't know how." (honest/vulnerable)
3. "I'm sorry." (guilt/regret)

**All lead to same message:** Recognition of self-neglect pattern
**Reasoning:** Message is consistent, choice lets player express emotional state

---

## Immediate Next Steps

### Session 1 Goals (Day 1 - Core Prototype)
- [ ] Complete environment setup (.claude config, Git init)
- [ ] Create index.html with Phaser CDN
- [ ] Create main.js with basic Phaser config
- [ ] Create PhoneScene.js (basic structure)
- [ ] Display phone UI mockup (can be placeholder rectangle)
- [ ] Show incoming call from "Mom"
- [ ] Implement "Answer" button
- [ ] Create ConversationScene.js
- [ ] Display one conversation (Mom, 5-8 messages)
- [ ] Show 2 dialogue choice buttons
- [ ] Choices advance conversation
- [ ] Test: Full playthrough of Mom's call

**Success criteria:** Can answer a call, have a conversation, make a choice

---

## Open Questions

### Narrative
- [ ] Should self-neglect montage be specific scenes or abstract imagery?
- [ ] Do we name the player character or keep ambiguous?
- [ ] Post-credits resource link? (mental health support)

### Mechanics
- [ ] Exact patience meter drain timing (if implemented)
- [ ] Can you call someone back after they hang up?
- [ ] Show message history of missed conversations?

### Polish
- [ ] Background music or just ambient sound?
- [ ] Text-to-speech voice acting or pure text?
- [ ] Accessibility options (text size, color blind mode)?

**Decision strategy:** Start minimal, add only if enhances emotional impact

---

## Known Issues/Limitations

### Technical Constraints
- No localStorage in some deployment contexts (use in-memory state)
- Browser audio policy: sound requires user interaction first
- Mobile touch vs desktop mouse (need to handle both)

### Scope Constraints
- First-time Phaser developer (learning curve expected)
- 5-day timeline (aggressive, requires scope discipline)
- Single artist (limited asset production bandwidth)
- Must be browser-playable (no native features)

### Risks
- **Biggest risk:** Over-scoping features, not finishing core experience
- **Mitigation:** Ruthlessly cut non-essential features, focus on emotional core

---

## Success Criteria

### Minimum Viable Product
1. Answer multiple calls
2. Switch between conversations
3. Feel guilt/overwhelm from juggling
4. Final reveal: they're all you
5. One ending with self-care message

### Workshop Success
- Demonstrates clear "distress" theme interpretation
- Complete experience (start to end, no broken states)
- Shows technical competence (working Phaser game)
- Creates emotional response in players
- Well-documented process

### Nice to Have (If Time Permits)
- Patience meter system
- Sound effects and ambient audio
- Glitch transition effects
- Multiple conversation branches
- Polish animations (tweens, particles)

---

## Development Philosophy

**Core Principle:** "Constraints breed creativity"

Focus on ONE idea executed perfectly rather than many ideas half-done. The 5-day limit is a feature, not a bug.

**Priority Order:**
1. Get something playable (answer call, see conversation)
2. Add core loop (switching between calls)
3. Implement twist (revelation sequence)
4. Polish what exists (don't add new features)
5. Test and balance (make it feel right)

**When stuck:** Simplify. What's the MINIMUM to make this work?

---

**This document is living and should be updated after each session.**
