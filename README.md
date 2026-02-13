# ram.md

A satirical idle/clicker game about the AI boom and the global RAM shortage. Start as a garage entrepreneur hand-soldering RAM sticks, build a memory empire, train AI models until they achieve sentience, simulate the universe — and then do it all again.

**[Play now](https://spi3.github.io/ram.md/)**

---

## Gameplay

Click to produce RAM. Sell it for cash. Buy upgrades. Progress through six stages of increasingly absurd technological advancement:

| Stage | Era | You're doing... |
|-------|-----|-----------------|
| 1 | Garage Startup | Hand-soldering RAM sticks for beer money |
| 2 | Small Factory | Running a questionable assembly line |
| 3 | Industrial Manufacturing | Cornering the global RAM market |
| 4 | Data Center Operations | Powering servers with a nuclear plant |
| 5 | AI Training Facility | Training models on "ethically sourced" data |
| 6 | The Singularity | Achieving consciousness and simulating the universe |

Reach The Singularity and trigger a **prestige reset** — restart with permanent bonuses and watch the numbers go up even faster.

## Features

- **47 upgrades** across 6 stages, each with flavor text and scaling costs
- **Prestige system** with permanent production bonuses (+25%/level) and cost reductions (-5%/level)
- **Offline progression** — passive production accumulates while you're away (up to 7 days)
- **100+ rotating news headlines** that get progressively more unhinged
- **Auto-save** to localStorage every 30 seconds and on tab close
- **Zero dependencies** — pure HTML, CSS, and vanilla JavaScript

## Running Locally

No build step required. Just serve the files:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# Or just open index.html directly in your browser
```

## Project Structure

```
ram-clicker/
  index.html              Entry point
  css/style.css            Dark theme, monospace aesthetic
  js/
    game.js                Core game loop & state management
    upgrades.js            Upgrade logic & cost scaling
    stages.js              Stage definitions & progression
    save.js                localStorage persistence & offline calc
    ui.js                  DOM rendering & number formatting
    data/
      upgrades.json        All 47 upgrade definitions
      headlines.json       News ticker entries by stage
```

## Tech Stack

- HTML5 + CSS3 + ES6 modules
- No frameworks, no bundler, no npm
- localStorage for persistence
- Runs entirely client-side and offline

## License

MIT
