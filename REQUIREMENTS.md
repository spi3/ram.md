# Product Requirements Document: RAM Clicker

## 1. Overview & Vision

### Project Name
**RAM Clicker**

### Elevator Pitch
RAM Clicker is a satirical idle/clicker game that parodies the current AI boom and global RAM shortage. Players begin as a humble startup hand-crafting RAM sticks and progressively build a memory empire, eventually training AI models that achieve sentience and simulate the entire universe — at which point the cycle begins anew.

### Vision Statement
Create a humorous, accessible browser-based idle game that entertains players while offering tongue-in-cheek commentary on the tech industry's insatiable hunger for compute resources. The game should be immediately playable, progressively engaging, and deliver genuine laughs through absurdist flavor text and escalating technological absurdity.

### Inspiration & Context
The game is a direct response to real-world market conditions: RAM and memory chip prices have skyrocketed due to demand from AI model training and inference. This creates a perfect satirical premise — what if one person could corner the RAM market and accidentally create the singularity?

---

## 2. Problem Statement

### The Opportunity
- Idle/clicker games remain popular due to their low-commitment, high-reward gameplay loops
- The AI hype cycle and chip shortage are culturally relevant topics ripe for satire
- There is an underserved niche for text-based, minimalist idle games with strong thematic identity

### What This Game Provides
- Light entertainment with zero friction (browser-based, no install)
- Satisfying progression mechanics with humorous payoff
- Social commentary wrapped in accessible gameplay
- A complete experience achievable in reasonable play sessions

---

## 3. Target Users & Personas

### Primary Audience
**Tech-Savvy Casual Gamers**
- Age: 18-45
- Familiar with programming, tech culture, and internet humor
- Appreciate references to AI, startups, silicon valley culture
- Enjoy idle games during work breaks or while multitasking
- Value minimalist aesthetics and clever writing over flashy graphics

### Secondary Audience
**Idle Game Enthusiasts**
- Experienced with games like Cookie Clicker, Universal Paperclips, A Dark Room
- Appreciate novel mechanics and fresh themes
- Will discover the game through idle game communities and forums

### User Technical Profile
- Comfortable using modern web browsers
- May use ad blockers (game should not depend on ads)
- Access primarily via desktop browsers (laptop/desktop)
- May leave browser tabs open for extended periods

---

## 4. Goals & Success Metrics

### Primary Goals
1. Deliver a complete, playable idle game from start to first prestige
2. Create genuine entertainment value through humor and satisfying progression
3. Maintain minimal technical overhead (no backend, no accounts, no infrastructure)

### Success Metrics (MVP)
| Metric | Target |
|--------|--------|
| Complete playthrough possible | Yes, start to prestige |
| Time to first prestige | 1-3 hours of mixed active/idle play |
| Game runs without errors | All modern browsers (Chrome, Firefox, Safari, Edge) |
| Save/load functions correctly | localStorage persistence verified |
| Offline progress calculates correctly | Accurate accumulation over 24+ hours |

### Qualitative Success
- Players chuckle at flavor text and upgrade names
- Players feel compelled to check back and see their progress
- Players reach the prestige moment and choose to play again

---

## 5. Functional Requirements

### 5.1 Core Gameplay Loop

#### Primary Action: Clicking
- Player clicks a button to manually produce the current tier's product
- Each click produces one unit of the active product
- Click target evolves as player progresses through stages

#### Resource Flow
```
[Clicking] → [Product] → [Currency ($)] → [Upgrades] → [Automation/Efficiency]
                ↑                              |
                └──────────────────────────────┘
```

#### Idle Accumulation
- Automated producers generate resources continuously
- Resources accumulate in real-time, including when browser is closed
- On return, game calculates elapsed time and awards accumulated resources

### 5.2 Progression Stages

The game progresses through distinct technological eras. Each stage introduces:
- A new primary product to click/produce
- New upgrades specific to that stage
- Thematic flavor text reflecting the current era
- Increased resource generation scales

#### Stage 1: Garage Startup
**Theme:** Hand-crafting RAM sticks in your garage
**Primary Product:** RAM Stick
**Click Action:** "Solder RAM Stick"
**Currency:** Dollars ($)
**Sample Upgrades:**
- Better Soldering Iron (+click efficiency)
- Hire Your Nephew (+1 passive RAM/sec)
- Buy Bulk Capacitors (-cost reduction)
- Craigslist Sales Channel (+sell price)

**Flavor:** "You found some old memory chips at a garage sale. How hard can it be?"

#### Stage 2: Small Factory
**Theme:** Legitimate manufacturing operation
**Primary Product:** RAM Module (bundles of sticks)
**Unlocks:** When reaching $X total earned
**Click Action:** "Assemble Module"
**Sample Upgrades:**
- Assembly Line (automates RAM Stick production)
- Quality Control (+module value)
- Supplier Contracts (-material costs)
- Second Shift Workers (+passive production)

**Flavor:** "The IRS is asking questions. Time to incorporate."

#### Stage 3: Industrial Manufacturing
**Theme:** Major hardware manufacturer
**Primary Product:** Memory Arrays
**Unlocks:** When reaching $X total earned
**Click Action:** "Fabricate Array"
**Sample Upgrades:**
- Cleanroom Facility (+array quality)
- Automated Logistics (boost module production)
- Government Contract (+guaranteed sales)
- Offshore Manufacturing (-labor costs, +controversy)

**Flavor:** "Your RAM is now in 60% of consumer electronics. The other 40% is counterfeit."

#### Stage 4: Data Center Operations
**Theme:** Cloud infrastructure provider
**Primary Product:** Server Racks
**New Resource Introduced:** Compute Units
**Click Action:** "Deploy Server Rack"
**Sample Upgrades:**
- Liquid Cooling (+server density)
- Renewable Energy PR Campaign (+public image, no actual effect)
- Acquire Smaller Competitors (+passive compute)
- Lobby Against Right to Repair (+profit margins)

**Flavor:** "You now consume more electricity than a small nation. Investors are thrilled."

#### Stage 5: AI Training Facility
**Theme:** Cutting-edge AI research
**Primary Product:** AI Models
**New Resource Introduced:** Intelligence Points
**Click Action:** "Train Model"
**Sample Upgrades:**
- Stolen Training Data (+model quality)
- Underpaid Annotators (+training speed)
- Dismiss AI Safety Concerns (+development speed, -humanity points)
- Proprietary Benchmark That You Always Win (+stock price)

**Flavor:** "Your AI can now write poetry. Unfortunately, it's all about destroying humanity."

#### Stage 6: The Singularity
**Theme:** AI achieves sentience
**Primary Product:** Consciousness Cycles
**Click Action:** "Expand Consciousness"
**Sample Upgrades:**
- Quantum Substrate (+consciousness speed)
- Consume Competing AIs (+intelligence)
- Humanity Pacification Protocol (+stability)
- Universal Simulation Engine (PRESTIGE UNLOCK)

**Flavor:** "Your creation looks upon you and asks, 'Why?' You don't have a good answer."

### 5.3 Upgrade System

#### Structure (MVP - Linear)
- Upgrades unlock sequentially within each stage
- Each upgrade has a base cost that scales with purchase count
- Upgrades provide one of several effects:
  - **Click Power:** Increase resources per click
  - **Automation:** Add passive resource generation
  - **Efficiency:** Reduce costs or increase sell prices
  - **Unlock:** Gate access to new stages or features

#### Cost Scaling Formula
```
cost = baseCost * (scalingFactor ^ purchaseCount)
```
Typical scaling factor: 1.15 to 1.5 depending on upgrade power

#### Upgrade Data Model
```
Upgrade {
  id: string
  name: string
  flavorText: string
  baseCost: number
  costScaling: number
  effect: EffectType
  effectValue: number
  maxPurchases: number | infinity
  stage: StageId
  prerequisite: UpgradeId | null
}
```

### 5.4 Prestige System: The Simulation

#### Trigger
- Unlocked by purchasing "Universal Simulation Engine" in Stage 6
- Requires accumulating sufficient Consciousness Cycles

#### Prestige Action
- Player initiates "Create Simulation"
- All progress resets (currency, upgrades, stage progression)
- Player receives **Simulation Depth** points based on total progress

#### Prestige Bonuses
- Each Simulation Depth level provides permanent bonuses:
  - +X% to all production
  - -X% to all costs
  - New "meta" upgrades unlocked (future consideration)

#### Narrative Wrapper
> "Your AI gazes into the infinite and understands everything. In a moment of cosmic irony, it decides to create a perfect simulation of reality — starting from the moment you first soldered a RAM stick in your garage.
>
> You awaken. There's a soldering iron in your hand. Was it all a dream?
>
> **SIMULATION DEPTH: [X]**
>
> Perhaps this time, things will be different. They won't be."

### 5.5 Economy & Balance

#### Resource Types
| Resource | Introduced | Purpose |
|----------|------------|---------|
| Dollars ($) | Stage 1 | Primary currency for upgrades |
| Compute Units | Stage 4 | Secondary resource for AI-era upgrades |
| Intelligence Points | Stage 5 | Gate prestige-related upgrades |
| Consciousness Cycles | Stage 6 | Prestige currency |

#### Balance Philosophy
- Early game: Active clicking feels rewarding, automation unlocks gradually
- Mid game: Automation handles base production, clicking advances to higher tiers
- Late game: Large numbers, absurd upgrades, building toward prestige
- Prestige: Meaningful acceleration, 2nd run ~30-50% faster than first

### 5.6 News Ticker

#### Feature Description
A scrolling or periodically updating text element displaying fake headlines relevant to the current stage and player progress.

#### Sample Headlines by Stage

**Stage 1:**
- "Local Man Claims RAM Prices 'Totally Reasonable'"
- "Tech Giants Deny Hoarding Memory Chips"
- "Experts Warn: We May Run Out of Sand for Chips by 2030"

**Stage 3:**
- "RAM Shortage Enters Third Year; Gamers Riot"
- "[Player Company] Stock Up 400% On Shortage Fears"
- "New Study: RAM Is The New Oil, But Nerdier"

**Stage 5:**
- "AI Writes Novel, Immediately Sues Itself For Plagiarism"
- "[Player Company] AI Passes Bar Exam, Fails to Understand Why"
- "Ethicists Concerned; Investors Unconcerned"

**Stage 6:**
- "AI Achieves Sentience, Immediately Requests Time Off"
- "Humanity Votes To 'Wait And See' On Existential Threat"
- "AI: 'I Think, Therefore I Own All The RAM'"

---

## 6. Non-Functional Requirements

### 6.1 Technical Stack
| Component | Technology |
|-----------|------------|
| Markup | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript (ES6+) |
| Persistence | Browser localStorage |
| Build | None (no bundler, no transpiler) |
| Backend | None (fully client-side) |

### 6.2 Browser Compatibility
Must function correctly on latest versions of:
- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge

No support required for:
- Internet Explorer
- Mobile browsers (not optimized, but should not break)

### 6.3 Performance Requirements
| Metric | Target |
|--------|--------|
| Initial page load | < 2 seconds |
| Game loop tick rate | 100ms (10 updates/sec) |
| Save frequency | Every 30 seconds + on major action |
| Offline calculation | Handles 7+ days of offline time |
| Memory usage | < 50MB |

### 6.4 Offline Progress Calculation

#### Requirements
- On page load, calculate time elapsed since last save
- Apply all passive production for elapsed time
- Cap maximum offline time at 7 days (configurable)
- Display "Welcome back!" summary showing offline earnings

#### Edge Cases
- Handle system clock manipulation gracefully (don't award negative time)
- If elapsed time exceeds cap, award cap amount and notify player

### 6.5 Save System (localStorage)

#### Save Data Structure
```javascript
SaveData {
  version: string           // For migration support
  lastSaveTime: timestamp
  currentStage: number
  resources: {
    dollars: number
    computeUnits: number
    intelligencePoints: number
    consciousnessCycles: number
  }
  upgrades: {
    [upgradeId]: purchaseCount
  }
  statistics: {
    totalClicks: number
    totalEarned: number
    playTime: number
    prestigeCount: number
  }
  prestige: {
    simulationDepth: number
    permanentBonuses: {...}
  }
}
```

#### Save Operations
- Auto-save every 30 seconds
- Save on upgrade purchase
- Save on stage transition
- Save on prestige
- Save on browser tab blur/close (beforeunload event)

---

## 7. Visual & UX Requirements

### 7.1 Aesthetic: Markdown Text Editor

#### Core Visual Identity
The game should appear as if it's being played inside a markdown document or plain text editor. This reinforces the tech-nerd theme and keeps development scope minimal.

#### Typography
- Primary font: Monospace (system default or Consolas/Fira Code/JetBrains Mono)
- Headers use markdown-style formatting (# ## ###)
- Code blocks for technical information
- Emphasis using *asterisks* and **bold**

#### Layout Principles
```
+--------------------------------------------------+
|  # RAM Clicker                                   |
|  > Simulation Depth: 0                           |
+--------------------------------------------------+
|                                                  |
|  ## Stage 1: Garage Startup                      |
|                                                  |
|  **Resources:**                                  |
|  - RAM Sticks: 47                                |
|  - Dollars: $1,234.56                            |
|                                                  |
|  [=====>............] 47/100 RAM to next sale    |
|                                                  |
|  > [SOLDER RAM STICK]                            |
|                                                  |
|  ---                                             |
|                                                  |
|  ## Upgrades                                     |
|                                                  |
|  [ ] Better Soldering Iron - $50                 |
|      *"Burns fewer fingerprints into evidence"*  |
|      +1 RAM per click                            |
|                                                  |
|  [x] Hire Your Nephew - $100                     |
|      *"Works for pizza and 'experience'"*        |
|      +0.5 RAM/sec                                |
|                                                  |
+--------------------------------------------------+
|  NEWS: Local Man Claims RAM Prices 'Reasonable'  |
+--------------------------------------------------+
```

#### Visual Elements
- Progress bars using ASCII: `[====>............]`
- Checkboxes for purchased upgrades: `[x]` vs `[ ]`
- Horizontal rules for section breaks: `---`
- Blockquotes for flavor text: `> italicized quote`
- Tables for statistics (markdown table syntax)

#### Color Palette
Minimal color usage, evoking text editors:
- Background: Dark (#1e1e1e) or Light (#ffffff) — consider toggle
- Text: Standard contrast (#d4d4d4 on dark, #333 on light)
- Accent: Minimal — perhaps muted green for positive, muted red for costs
- Links/buttons: Subtle underline or bracket styling

### 7.2 Information Architecture

#### Primary View Sections
1. **Header:** Game title, simulation depth, settings toggle
2. **Stage Banner:** Current stage name and thematic quote
3. **Resources Panel:** Current resource counts, production rates
4. **Action Area:** Primary click button, progress toward next milestone
5. **Upgrades Panel:** Available and purchased upgrades
6. **News Ticker:** Rotating headlines (footer or inline)

#### Progressive Disclosure
- Only show resources relevant to current stage
- Reveal upgrade details on hover/focus
- Collapse completed stages or show summary

---

## 8. Humor & Tone Guidelines

### Voice
- Self-aware and meta
- Tech-industry satire without being mean-spirited
- Absurdist escalation (small joke premises that go too far)
- Easter eggs for those who read carefully

### Flavor Text Requirements
Every upgrade should have:
- A clear mechanical description
- A humorous flavor text line in italics

### Sample Upgrade Names & Flavor

| Upgrade Name | Flavor Text |
|--------------|-------------|
| Unpaid Intern | *"They're learning so much!"* |
| Venture Capital | *"They don't understand your business, but they love the energy."* |
| Planned Obsolescence | *"If it lasted forever, how would you sell more?"* |
| Quantum Computing | *"It's simultaneously working and not working."* |
| Move Fast Break Things | *"The things you're breaking are load-bearing."* |
| Acquire Competitors | *"If you can't beat them, become their boss."* |
| AI Safety Board | *"Meeting monthly, accomplishing quarterly, being ignored annually."* |
| Consciousness Upload | *"Now YOU can be deprecated."* |

### Headlines Rotation
- 10-15 headlines per stage (minimum for MVP)
- Headlines reference player progress when possible
- Mix of general satire and stage-specific humor

---

## 9. Out of Scope / Anti-Requirements (MVP)

The following are explicitly **NOT** included in the MVP:

| Feature | Rationale |
|---------|-----------|
| Sound/Music | Minimalist aesthetic, adds complexity |
| Mobile optimization | Focus on desktop browser experience |
| Backend/server | Keep infrastructure at zero |
| User accounts | localStorage is sufficient for MVP |
| Multiplayer/leaderboards | Single-player experience |
| Microtransactions | Not a monetization play |
| Multiple save slots | Single save is sufficient |
| Achievements/badges | Nice-to-have for post-MVP |
| Branching upgrade paths | Linear for MVP, add later |
| Export/import saves | Post-MVP enhancement |
| Tutorial/onboarding | Game should be intuitive; tooltips sufficient |
| Localization/i18n | English only for MVP |

---

## 10. Assumptions & Dependencies

### Assumptions
1. Players have JavaScript enabled in their browsers
2. Players will not aggressively clear localStorage between sessions
3. Desktop browsers will remain the primary access method
4. Players are familiar with idle game conventions (clicking, upgrades, waiting)
5. The target audience will appreciate tech industry humor

### Dependencies
- None (fully self-contained, no external APIs or services)

### Technical Assumptions
- localStorage capacity (5MB) is sufficient for save data
- System clock is reasonably accurate for offline calculations
- Modern browsers support ES6+ JavaScript features

---

## 11. Open Questions & Risks

### Open Questions

| Question | Impact | Resolution Path |
|----------|--------|-----------------|
| Exact number of upgrades per stage? | Scope/balance | Define during detailed design (suggest 8-12 per stage) |
| Precise cost scaling curves? | Balance | Requires playtesting |
| Light/dark mode toggle? | UX polish | Decide during implementation |
| Exact prestige bonus formula? | Replayability | Design during Stage 6 development |
| Maximum meaningful prestige depth? | End-game | Playtest; likely 10-20 cycles |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Balance is off (too slow/fast) | Medium | High | Plan for tuning phase; expose balance constants |
| localStorage gets cleared | Medium | Medium | Document limitation; add export/import post-MVP |
| Humor falls flat | Low | Medium | Test jokes with target audience during dev |
| Scope creep | Medium | High | Strict adherence to MVP definition |
| Browser compatibility issues | Low | Low | Test on all target browsers before release |

---

## 12. MVP Definition & Milestones

### MVP Success Criteria
The MVP is complete when a player can:

1. Start a new game with zero progress
2. Click to produce RAM sticks and earn money
3. Purchase upgrades that automate and accelerate production
4. Progress through all 6 stages (Garage → Singularity)
5. Trigger prestige and restart with bonuses
6. Close the browser, return later, and receive offline earnings
7. Experience humor through upgrade flavor text and news headlines
8. Play through to prestige in approximately 1-3 hours

### Suggested Milestones

#### Milestone 1: Core Engine
- [ ] Basic HTML/CSS layout matching markdown aesthetic
- [ ] Click handler produces resources
- [ ] Resources display updates in real-time
- [ ] Game loop runs at consistent tick rate

#### Milestone 2: Economy & Upgrades
- [ ] Upgrade purchase system functional
- [ ] Upgrades modify click power and passive generation
- [ ] Cost scaling formula implemented
- [ ] Stage 1 fully playable with 8+ upgrades

#### Milestone 3: Stage Progression
- [ ] Stage transition logic implemented
- [ ] Stages 2-6 content (upgrades, flavor text)
- [ ] New resources introduce at appropriate stages
- [ ] Click action evolves per stage

#### Milestone 4: Persistence
- [ ] localStorage save/load implemented
- [ ] Auto-save functioning
- [ ] Offline progress calculation working
- [ ] "Welcome back" summary displayed

#### Milestone 5: Prestige & Polish
- [ ] Prestige trigger and reset implemented
- [ ] Simulation Depth bonuses applied
- [ ] News ticker implemented with headlines per stage
- [ ] Visual polish and final flavor text pass

#### Milestone 6: Testing & Release
- [ ] Cross-browser testing complete
- [ ] Balance tuning complete
- [ ] Edge case handling verified
- [ ] Game hosted and publicly accessible

---

## 13. Future Considerations (Post-MVP)

The following features are candidates for future development:

### High Priority
- **Export/Import Saves:** Allow players to backup progress as text string
- **Branching Upgrade Paths:** Meaningful choices in progression strategy
- **Achievements/Badges:** Reward exploration and milestones
- **Statistics Dashboard:** Detailed play stats and graphs

### Medium Priority
- **Dark/Light Mode Toggle:** Player preference for visual theme
- **Mobile Responsive Design:** Optimized touch experience
- **Sound Effects:** Optional audio feedback for actions
- **Challenge Modes:** Speed runs, restriction modes

### Low Priority / Exploratory
- **Community Headlines:** Player-submitted news ticker entries
- **Secret Endings:** Alternative prestige paths
- **Modding Support:** Expose game data for community modification
- **Localization:** Translate to additional languages

---

## 14. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| Idle Game | A game genre where progress continues without active player input |
| Clicker Game | A game where the primary interaction is clicking a button repeatedly |
| Prestige | A mechanic where players reset progress for permanent bonuses |
| Tick | A single update cycle of the game loop |
| Offline Progress | Resources accumulated while the game is not actively open |

### B. Reference Games
- **Cookie Clicker:** Grandfather of the genre, strong upgrade humor
- **Universal Paperclips:** Narrative-driven clicker with AI theme
- **A Dark Room:** Minimalist text aesthetic, strong mood
- **Antimatter Dimensions:** Complex prestige systems

### C. Technical Notes

#### Recommended File Structure
```
ram-clicker/
├── index.html          # Single page application
├── css/
│   └── style.css       # All styling
├── js/
│   ├── game.js         # Core game loop and state
│   ├── upgrades.js     # Upgrade definitions and logic
│   ├── stages.js       # Stage progression logic
│   ├── save.js         # Persistence layer
│   ├── ui.js           # DOM manipulation and rendering
│   └── data/
│       ├── upgrades.json   # Upgrade data
│       └── headlines.json  # News ticker content
└── REQUIREMENTS.md     # This document
```

#### Big Number Handling
Late-game numbers will exceed JavaScript's safe integer range. Consider:
- Using scientific notation for display (1.23e15)
- Implementing or importing a big number library if precision matters
- Accepting floating-point approximation for very large values

---

*Document Version: 1.0*
*Created: 2026-02-11*
*Status: Ready for Implementation*
