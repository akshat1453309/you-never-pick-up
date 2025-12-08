# Anti-Patterns & Mistakes to Avoid

This document tracks approaches that didn't work, so we don't repeat them. Add entries as we encounter problems.

---

## Template for New Entries

```markdown
### [Date] - [Category]: [Brief Title]

**What We Tried:**
Description of the approach that failed

**Why It Failed:**
Root cause analysis

**What to Do Instead:**
Correct approach

**Related Code/Files:**
Where this applies
```

---

## Pre-Project Lessons (From Handoff Document)

### 2024-12-08 - Game Design: Signal Stability Mechanic

**What We Tried:**
Implementing a "signal stability" mechanic where players drag a slider to match a moving target to maintain call quality. Poor signal = lost words in conversation.

**Why It Failed:**
- Mechanic felt disconnected from the emotional narrative
- Added complexity without emotional payoff
- Required significant UI/interaction development time
- Didn't reinforce the guilt/overwhelm theme effectively

**What to Do Instead:**
Use simple call switching with optional patience meters. The guilt comes from choosing who to ignore, not from a dexterity challenge.

**Related Code/Files:**
N/A - Decided during design phase

---

### 2024-12-08 - Scope Management: Over-Complex Branching

**What We Tried:**
Designing multiple endings with fully branching dialogue trees based on who you save/ignore.

**Why It Failed:**
- Dilutes the core emotional message (everyone is you)
- Requires exponentially more dialogue writing
- 5-day timeline doesn't support complex branching
- Players might miss the point if endings vary too much

**What to Do Instead:**
Single core ending with three choice variants that express player emotion but lead to the same revelation. The message should be consistent: you've been neglecting yourself.

**Related Code/Files:**
dialogue.js (when implementing final conversation)

---

### 2024-12-08 - Animation: Smooth Morphing Transitions

**What We Tried:**
Planning smooth morphing animations for the photo reveal (contact photo morphs pixel-by-pixel into player photo).

**Why It Failed:**
- Beyond 5-day technical scope
- Requires advanced animation libraries or custom shaders
- Emotional impact comes from dialogue, not visual effect
- Artist bandwidth limited for complex animation frames

**What to Do Instead:**
Start with simple fade transition (fade to black, fade in new image). If Day 5 has time, upgrade to glitch effect (static overlay, distortion, resolve). Functional beats fancy.

**Related Code/Files:**
RevelationScene.js (when implementing twist reveal)

---

### 2024-12-08 - Data Storage: localStorage in Artifacts

**What We Tried (in prototypes):**
Using localStorage to persist game state between sessions.

**Why It Failed:**
- localStorage not available in some deployment contexts (e.g., Claude artifacts)
- Browser privacy settings can block localStorage
- Not necessary for 5-10 minute game experience

**What to Do Instead:**
Use in-memory state only. Game session is short enough that players will complete in one sitting. If save functionality needed later, can add but start without it.

**Related Code/Files:**
CallManager.js, main.js (state management)

---

## General Anti-Patterns to Avoid

### DON'T: Add Mechanics That Don't Serve the Emotion

**Why:**
The game's power is in its emotional message, not mechanical complexity. Every system should reinforce guilt, overwhelm, or self-recognition.

**Do Instead:**
Before adding a feature, ask: "Does this make the player feel more distressed, guilty, or lead to the revelation?" If no, cut it.

---

### DON'T: Over-Scope Visual Effects

**Why:**
Polish is nice, but a 5-day timeline demands prioritization. A simple, complete experience beats a fancy, half-finished one.

**Do Instead:**
Use Phaser's built-in tweens and simple fades. Screen shake, particles, and glitches are Day 5 enhancements only if core game is done.

---

### DON'T: Start Coding Before Design is Clear

**Why:**
Refactoring mid-project wastes precious time. The handoff document provides the design blueprint.

**Do Instead:**
Reference the handoff document and PROJECT_CONTEXT before writing code. If unsure about implementation, sketch it out or ask questions first.

---

### DON'T: Implement Features "Just in Case"

**Why:**
Speculative features add complexity and rarely get used. YAGNI (You Aren't Gonna Need It) applies heavily in time-constrained projects.

**Do Instead:**
Build the Minimum Viable Product first. Only add features that directly serve the core experience.

Examples of "just in case" to avoid:
- ❌ Settings menu (not needed for 10-minute game)
- ❌ Multiple save slots (single session game)
- ❌ Achievements system (not the point)
- ❌ Call history log (unless it serves narrative)

---

### DON'T: Perfectionism Over Progress

**Why:**
"Perfect is the enemy of done." A working prototype is infinitely better than a polished snippet.

**Do Instead:**
Get it working, then iterate. Placeholder art is fine. Simple effects are fine. Ship the core experience, polish if time permits.

---

### DON'T: Ignore Browser Console Errors

**Why:**
Silent failures lead to confusing bugs later. Phaser errors often indicate asset loading or configuration issues.

**Do Instead:**
Open DevTools (F12) after every change. Address errors immediately before moving forward.

---

### DON'T: Test Only at the End

**Why:**
Late-stage testing reveals fundamental issues when there's no time to fix them.

**Do Instead:**
Test after every feature. Open index.html in browser frequently. Playtest the current state, even if incomplete.

---

### DON'T: Write Dialogue Without Testing It

**Why:**
Text that reads well in a document might be too long, oddly paced, or emotionally flat in-game.

**Do Instead:**
Implement dialogue incrementally. Play through conversations. Read them aloud. Adjust pacing and word choice based on how they feel.

---

### DON'T: Commit Without Testing

**Why:**
Broken commits make it hard to roll back to working states.

**Do Instead:**
Use the /check-before-commit slash command. Verify the game runs before committing.

---

## When to Break These Rules

These are guidelines, not laws. Break them when:
- User testing reveals a clear need
- A feature significantly enhances emotional impact
- Time allows and core experience is complete

**But always ask:** "Does this serve the emotional core of the game?"

---

**This document will be updated as we encounter new issues during development.**
