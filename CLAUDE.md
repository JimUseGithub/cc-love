# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

恋爱表白墙 — a love confession wall single-page application built with Vue 3 + TypeScript. Features animated hearts, particle effects, and romantic confession messages in a warm pink/purple theme.

## Commands

```bash
# Install dependencies
npm install

# Start dev server (--host 0.0.0.0 needed for WSL / external access)
npx vite --host 0.0.0.0

# Build for production (includes type-checking via vue-tsc)
npm run build

# Build without type-checking (useful on WSL/UNC paths where vue-tsc fails)
npx vite build

# Type check only
npx vue-tsc -p tsconfig.app.json --noEmit
```

**WSL note:** If working on a UNC path (`//wsl$/...`), `vue-tsc` may fail. Work around this by either moving the repo to a local Linux path, or using `npx vite build` directly (skipping type checking). The `postinstall` script may also fail on UNC paths; use `npm install --ignore-scripts && node node_modules/esbuild/install.js` if needed.

## Architecture

```
src/
├── main.ts                       # Entry point, mounts Vue app
├── App.vue                       # Root: state management, layout, event orchestration
├── components/
│   ├── AnimatedHeart.vue         # Central SVG heart with CSS breathe + glow animations, mouse parallax
│   ├── ConfessionTitle.vue       # Displays "{name}，我想和你一起看遍世间所有日落"
│   ├── FloatingHearts.vue        # 15 CSS-animated small hearts floating up in background
│   ├── MeteorShower.vue           # 12 CSS-animated meteors streaking diagonally across the background
│   ├── ParticleCanvas.vue        # Full-screen Canvas overlay for click-triggered heart burst particles
│   ├── StarrySky.vue              # 200 CSS-animated twinkling stars with varying brightness and color
│   └── ConfessionPopup.vue       # Modal with random confession message, backdrop blur
├── composables/
│   └── useHeartParticles.ts      # Canvas particle system: create, update, render mini heart shapes
└── styles/
    └── global.css                # CSS variables (color scheme), keyframe animations, base reset
```

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.app.json`).

### Data Flow

- `App.vue` owns `showPopup` state and a template ref to `ParticleCanvas`
- `AnimatedHeart` emits click events → App triggers `ParticleCanvas.addBurst()` + sets `showPopup = true`
- `ParticleCanvas` listens to `document.click` globally for anywhere-click particle effects (separate from the heart-click burst, which comes via `addBurst()`)
- `ConfessionPopup` watches `visible` prop to randomly select a message from the pool on open

### Key Patterns

- All components use `<script setup lang="ts">` with Composition API
- Animations split between CSS (breathe, float-up, glow-pulse, pop-in, pulse-ring-out) and Canvas (particle system)
- SVG hearts use gradient fills with `radialGradient` defs and `drop-shadow` SVG filters for glow
- No external UI/animation libraries — pure CSS + Canvas 2D

### Color Scheme (CSS Variables)

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-deep` | `#1a0a1e` | Dark romantic background |
| `--bg-mid` | `#2d1b33` | Gradient midpoint |
| `--bg-surface` | `rgba(30, 10, 30, 0.85)` | Card/popup background |
| `--pink` | `#ff6b9d` | Primary accent |
| `--pink-light` | `#ff9ec4` | Name highlight |
| `--pink-deep` | `#ff4081` | Heart gradient end |
| `--text-primary` | `#ffe0ec` | Main text |
| `--text-dim` | `rgba(255, 224, 236, 0.6)` | Secondary/muted text |

## Customization Points

- **Name**: Replace the `{名字}` placeholder in `ConfessionTitle.vue`'s `displayName` computed. (The component defines a `name` prop but it isn't wired to the template — you'll want to replace the computed with `const displayName = computed(() => props.name || '{名字}')` then pass `<ConfessionTitle name="你的名字" />` in `App.vue`.)
- **Confession messages**: The 8-message pool is in `ConfessionPopup.vue`'s `messages` array
- **Particle colors**: `HEART_COLORS` array in `useHeartParticles.ts`
- **Floating heart count/density**: `FLOATING_HEARTS_COUNT` constant in `FloatingHearts.vue`
