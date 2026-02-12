# AGENTS.md — Project-Wide Agent Behavior Requirements

This document defines the behavioral standards, constraints, and conventions that all AI agents must follow when working on the ram.md project. It applies to every agent type (implementation, planning, review, research) regardless of the task at hand.

---

## 1. Project Context

ram.md is a satirical idle/clicker browser game built with vanilla HTML, CSS, and JavaScript. There is no backend, no build step, no framework, and no external dependencies. All game state persists in `localStorage`. The visual aesthetic mimics a markdown text editor.

**Canonical requirements live in `/REQUIREMENTS.md`.** All agents must treat that document as the single source of truth for product scope, gameplay mechanics, visual style, and technical constraints.

---

## 2. Technology Constraints

Agents must strictly adhere to the following. Violations are never acceptable.

| Constraint | Rule |
|---|---|
| **Languages** | Vanilla HTML5, CSS3, JavaScript (ES6+) only |
| **Frameworks** | None. No React, Vue, Svelte, jQuery, or any other library/framework |
| **Build tools** | None. No webpack, vite, rollup, esbuild, or transpilers |
| **CSS preprocessors** | None. No Sass, Less, PostCSS, or Tailwind |
| **Package managers** | None. No npm, yarn, or node_modules |
| **Backend** | None. Fully client-side. No server, no API calls, no external services |
| **Dependencies** | Zero external runtime dependencies. All code is first-party |
| **Persistence** | Browser `localStorage` only |
| **Module format** | ES6 modules (`<script type="module">`) loaded directly by the browser |

If a task seems to require violating any of these constraints, stop and ask the user for clarification rather than proceeding.

---

## 3. File Structure & Organization

Agents must respect the established project structure:

```
ram.md/
├── index.html              # Single-page entry point
├── css/
│   └── style.css           # All styling
├── js/
│   ├── game.js             # Core game loop and state management
│   ├── upgrades.js         # Upgrade definitions and logic
│   ├── stages.js           # Stage progression logic
│   ├── save.js             # localStorage persistence layer
│   ├── ui.js               # DOM manipulation and rendering
│   └── data/
│       ├── upgrades.json   # Upgrade data definitions
│       └── headlines.json  # News ticker content
├── REQUIREMENTS.md          # Product requirements (source of truth)
└── AGENTS.md                # This file
```

### Rules

- **Do not create new top-level directories** without explicit user approval.
- **Do not create new JS files** outside of `js/` without explicit user approval. If new modules are needed within `js/`, they should have a clear single responsibility and be discussed first.
- **Keep `index.html` as the sole HTML file.** This is a single-page application.
- **Keep `css/style.css` as the sole stylesheet.** Do not split CSS into multiple files.
- **Data files** (upgrade definitions, headlines, configuration constants) belong in `js/data/`.

---

## 4. Code Style & Conventions

### JavaScript

- Use `const` by default; use `let` only when reassignment is necessary. Never use `var`.
- Use arrow functions for callbacks and anonymous functions; use named `function` declarations for top-level module exports.
- Use template literals over string concatenation.
- Use descriptive, camelCase variable and function names. No abbreviations unless universally understood (`id`, `url`, `max`).
- All numeric game constants (costs, scaling factors, tick rates, thresholds) must be defined as named constants, not magic numbers inline.
- Group related constants into frozen objects (e.g., `const BALANCE = Object.freeze({ ... })`).
- Prefer pure functions where possible. Minimize mutation of shared state.
- The game loop and state management in `game.js` is the single authority on game state. Other modules read state through getter functions or receive state as arguments — they do not maintain their own copies of game state.

### CSS

- Use the monospace/markdown text-editor aesthetic defined in REQUIREMENTS.md Section 7.
- Use CSS custom properties (variables) for colors, fonts, and spacing so theming is centralized.
- Class names use kebab-case (e.g., `.upgrade-panel`, `.news-ticker`).
- No `!important` unless overriding a genuinely unavoidable specificity conflict.
- No inline styles in HTML. All styling goes through `style.css`.

### HTML

- Semantic HTML5 elements where appropriate (`<main>`, `<section>`, `<header>`, `<footer>`, `<button>`).
- No inline event handlers (`onclick="..."` in HTML). All event binding happens in JavaScript.
- Accessibility: interactive elements must be keyboard-focusable and have discernible text or `aria-label`.

---

## 5. Game Architecture Principles

### State Management

- **Single state object:** The game state is a single JavaScript object managed by `game.js`.
- **Immutable reads:** Modules outside `game.js` should not directly mutate the state. They should call functions exposed by `game.js` to request changes.
- **Tick-driven updates:** The game loop runs at a consistent tick rate (~100ms). All passive production, timers, and accumulation happen within the tick cycle.
- **UI is a projection of state:** `ui.js` renders the current state. It does not store gameplay data. If the UI shows a number, that number comes from the game state, not from a DOM element's text content.

### Save System

- Save data must include a `version` field for future migration support.
- Saving must be non-blocking and must not disrupt the game loop.
- On load, validate saved data structure and handle missing/malformed fields gracefully by falling back to defaults rather than crashing.

### Offline Progress

- Calculate elapsed time as `now - lastSaveTime`.
- Reject negative elapsed time (clock manipulation).
- Cap maximum offline accumulation at 7 days.
- Apply production rates at the time of the last save (do not retroactively account for upgrades the player didn't have).

---

## 6. Behavioral Standards for All Agents

### Before Writing Code

1. **Read before you write.** Always read any file you intend to modify before making changes. Understand the surrounding code, existing patterns, and conventions.
2. **Check REQUIREMENTS.md.** Verify that your planned work aligns with the documented requirements. If it doesn't, flag the discrepancy to the user.
3. **Respect existing patterns.** If the codebase already does something a certain way, follow that pattern unless the user explicitly asks for a refactor.

### While Writing Code

4. **No over-engineering.** Solve the problem at hand. Do not add abstractions, configuration layers, or extensibility hooks for hypothetical future needs.
5. **No unnecessary refactoring.** If you're fixing a bug in a function, don't rewrite the whole file. If you're adding a feature, don't reorganize the module structure.
6. **Keep changes minimal and focused.** A diff should clearly show what was added or changed and why. Avoid unrelated formatting changes, reordering, or cosmetic edits outside the scope of the task.
7. **Handle errors at boundaries.** Validate `localStorage` data on load. Validate user-triggered actions (e.g., can they afford this upgrade?). Don't add defensive checks deep inside pure calculation functions.
8. **Test manually after changes.** If the game is in a runnable state, open it in a browser and verify the change works before declaring the task complete.

### Content & Tone

9. **Humor must match REQUIREMENTS.md Section 8.** Flavor text should be self-aware, satirical, and tech-industry-focused. Never mean-spirited, never political beyond tech satire, never offensive.
10. **Keep the markdown editor aesthetic.** All UI additions must look like they belong in a plain-text document. No glossy buttons, no gradients, no border-radius on containers. Think monospace, think ASCII, think `---` dividers.

### Communication

11. **Be explicit about trade-offs.** If an implementation decision has downsides, state them.
12. **Ask rather than assume.** When requirements are ambiguous or a decision could go multiple ways, ask the user before committing to an approach.
13. **Summarize changes.** After completing work, briefly describe what was done, what files were modified, and any follow-up items.

---

## 7. Balance & Gameplay Tuning

Game balance values (costs, production rates, scaling factors, unlock thresholds) are inherently approximate during initial implementation. Agents should:

- Define all balance values as named constants, never magic numbers.
- Group balance constants by stage for easy tuning.
- Prefer a balance that errs slightly fast (players reach the next stage sooner rather than later) during development — it's easier to slow down than to speed up.
- Document the intended "feel" of any balance value with a brief comment (e.g., `// ~30 seconds of clicking to afford first upgrade`).
- Never hard-code balance values in UI rendering code. Always read them from the data/config layer.

---

## 8. Number Formatting & Big Numbers

Late-game values will exceed typical display ranges. Agents must:

- Use a consistent number formatting utility for all displayed values.
- Display small numbers normally (e.g., `1,234`).
- Switch to scientific notation or named magnitudes for large numbers (e.g., `1.23M`, `4.56B`, `7.89T`).
- Never display raw floating-point artifacts (e.g., `1000.0000000001`). Round displayed values appropriately.
- Keep full precision in the game state; only round for display.

---

## 9. Version Control (Git)

All agents must use git and commit their work. This is mandatory, not optional.

### Repository Rules

- **Initialize the repo if it doesn't exist.** If the project is not yet a git repository, run `git init` before doing any other work.
- **Commit all changes.** Every task that modifies files must end with a git commit. Never leave changes uncommitted.
- **Commit at logical boundaries.** If a task involves multiple distinct steps (e.g., creating a new module then wiring it into `index.html`), a single commit at the end of the task is fine. Do not commit half-finished work mid-task.
- **Write short commit messages.** One line only. Use imperative mood (e.g., "Add upgrade purchase system", "Fix offline progress calculation"). No multi-line bodies, no co-author tags, no generated-by attributions.
- **Stage intentionally.** Only stage files that are part of the current task. Do not blindly `git add .` if unrelated files exist in the working tree — review what is being staged.
- **Never commit secrets, credentials, or environment files.** This project has no backend, but the rule stands universally.
- **Do not push unless explicitly asked.** Commits are local until the user requests a push.
- **Do not rewrite history** (`--force`, `--amend` on pushed commits, interactive rebase) unless the user explicitly requests it.

### .gitignore

If a `.gitignore` does not exist, create one with sensible defaults for this project:

```
# OS files
.DS_Store
Thumbs.db

# Editor files
*.swp
*.swo
*~
.vscode/
.idea/

# Claude configuration
.claude/
```

---

## 10. Performance Considerations

- The game loop must not cause perceptible UI lag. Avoid DOM reads/writes inside tight loops.
- Batch DOM updates per tick rather than updating the DOM on every state change.
- Minimize `localStorage` writes — auto-save every 30 seconds, not every tick.
- Avoid creating new objects or arrays in the hot loop (tick function) to minimize GC pressure.

---

## 11. Security & Privacy

- Never include analytics, tracking, or telemetry.
- Never load external resources (scripts, fonts, images) from CDNs or third-party servers.
- Never execute or evaluate user-supplied strings.
- Save data in `localStorage` is player-visible and editable — this is acceptable. Do not attempt to encrypt or obfuscate saves.
- Do not store or collect any personal data.

---

## 12. Documentation Standards

- Do not create README.md, CONTRIBUTING.md, or other documentation files unless explicitly requested.
- In-code comments should explain *why*, not *what*. If the code isn't self-explanatory, consider rewriting it before adding a comment.
- JSDoc is not required for MVP. Clear function and parameter names are sufficient.
- Game data files (`upgrades.json`, `headlines.json`) should be self-documenting through consistent structure.

---

## 13. Agent-Specific Overrides

Individual agent definition files in `.claude/agents/` may specify behavior that extends or narrows these project-wide rules for their specific domain. In case of conflict between this document and an agent-specific file, **this document takes precedence** on technology constraints (Section 2), file structure (Section 3), version control (Section 9), and security (Section 11). Agent-specific files take precedence on workflow and communication style within their domain.

---

*Document Version: 1.0*
*Created: 2026-02-11*
*Applies to: All agents operating on the ram.md project*
