# PoE 2 Crafting Simulator

A fully interactive, browser-based crafting simulator for **Path of Exile 2**.  
Simulate the crafting system using realistic game data with weight-based RNG, prefix/suffix limits, and mod tier gating.

---

## Features

- **Item Base Selector** — searchable list of weapons, armour, jewellery, and flasks with tag/class filtering
- **Currency Tray** — drag-and-drop (or click) currency orbs onto your item to apply crafting actions
- **Weight-Based RNG** — all modifier rolls use spawn weights, respect item tags and item-level gating
- **Prefix / Suffix System** — correct 3-prefix / 3-suffix limits and mod group exclusion
- **Full Currency Support** — Transmutation, Alteration, Augmentation, Alchemy, Chaos, Exalted, Annulment, Divine, Scouring, Blessed
- **Crafting History & Undo** — 20-step undo stack per session
- **Statistics Panel** — live probability estimate and average Chaos Orb cost to hit the current mod combination
- **Session-Seeded RNG** — reproducible results with a configurable seed
- **Data Refresh Script** — fetch updated data from poe2db.tw

---

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Framework | React 19 + TypeScript + Vite          |
| Styling   | Tailwind CSS v4 (PoE dark theme)      |
| State     | Zustand                               |
| DnD       | @dnd-kit/core                         |
| RNG       | seedrandom                            |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/H2OING/Poe-2-craft.git
cd Poe-2-craft
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview   # serve the built output
```

---

## Refreshing Game Data

The bundled `src/data/items.json` and `src/data/mods.json` contain a curated set of PoE 2 item bases and modifiers.

To attempt to pull updated data from [poe2db.tw](https://poe2db.tw):

```bash
npm run scrape
```

The script will:
1. Try to fetch live data from poe2db.tw and transform it into the internal JSON format
2. Fall back gracefully to the existing bundled data if the remote is unavailable
3. Print a summary of what was written / validated

> **Note:** poe2db.tw does not have a public documented API. The scraper uses endpoints observed from browser network traffic and may break if the site changes its structure. The bundled data is always a safe fallback.

---

## Project Structure

```
/
├── scripts/
│   └── scrape-poe2db.ts     # Data scraping/refresh script
├── src/
│   ├── data/
│   │   ├── items.json        # Item bases (tags, implicits, requirements)
│   │   ├── mods.json         # Modifiers (weights, tiers, groups)
│   │   └── currency.ts       # Currency orb definitions
│   ├── components/
│   │   ├── ItemCard.tsx      # In-game style item tooltip
│   │   ├── ItemSelector.tsx  # Searchable item base picker
│   │   ├── CurrencyTray.tsx  # Draggable currency orbs
│   │   ├── CraftingBench.tsx # Drop target + crafting logic + action log
│   │   ├── ModList.tsx       # Modifier list display
│   │   └── StatsPanel.tsx    # Probability & cost statistics
│   ├── hooks/
│   │   └── useCrafting.ts    # Core crafting logic hook
│   ├── store/
│   │   └── craftingStore.ts  # Zustand state store
│   ├── utils/
│   │   ├── modRoller.ts      # Weight-based RNG modifier selection
│   │   └── currencyActions.ts# Per-currency crafting functions
│   ├── types.ts              # TypeScript domain types
│   └── App.tsx               # Root layout component
└── package.json
```

---

## Currency Behaviour Reference

| Currency             | Behaviour                                              |
|----------------------|--------------------------------------------------------|
| Orb of Transmutation | Normal → Magic, adds 1–2 mods                         |
| Orb of Alteration    | Re-rolls magic item mods (1–2 mods)                   |
| Orb of Augmentation  | Adds 1 mod to magic item with < 2 mods                |
| Orb of Alchemy       | Normal → Rare, adds 4–6 mods                          |
| Chaos Orb            | Re-rolls rare item mods (4–6 mods)                    |
| Exalted Orb          | Adds 1 mod to rare item with < 6 mods                 |
| Orb of Annulment     | Removes 1 random explicit mod                         |
| Divine Orb           | Re-rolls numeric values of existing mods              |
| Orb of Scouring      | Rare/Magic → Normal (removes all explicit mods)       |
| Blessed Orb          | Re-rolls implicit mod values                          |

---

## RNG & Reproducibility

All modifier rolls use `seedrandom` for deterministic, seed-based RNG.  
The session seed is shown in the top bar. You can change it via `store.setSeed(n)` in the browser console for reproducible testing.

---

## Disclaimer

This is a fan-made simulator for educational and entertainment purposes.  
Path of Exile 2 is developed and owned by Grinding Gear Games.  
All game data is sourced from [poe2db.tw](https://poe2db.tw).
