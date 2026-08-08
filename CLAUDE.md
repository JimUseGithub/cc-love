# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

恋爱表白墙 — a love confession wall single-page application built with Vue 3 + TypeScript. Features an animated SVG heart, starfield, meteor shower, floating hearts, Canvas particle bursts, and a popup with randomized romantic confession messages in a warm pink/purple theme.

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
│   ├── AnimatedHeart.vue         # Central SVG heart with breathe/glow CSS animations, mouse parallax, shatter/reassemble keyframes
│   ├── ConfessionTitle.vue       # Displays "{name}，我想和你一起看遍世间所有日落"
│   ├── FloatingHearts.vue        # 15 CSS-animated small hearts floating up in background
│   ├── MeteorShower.vue          # 12 CSS-animated meteors streaking diagonally across the background
│   ├── ParticleCanvas.vue        # Full-screen Canvas overlay for click/burst/reassemble particle effects
│   ├── StarrySky.vue             # 200 CSS-animated twinkling stars with varying brightness and color temperature
│   └── ConfessionPopup.vue       # Modal with random confession message, backdrop blur, Vue `<Transition>` enter/leave
├── composables/
│   └── useHeartParticles.ts      # Canvas particle system: create, update, render mini heart shapes via Path2D
└── styles/
    └── global.css                # CSS variables (color scheme), keyframe animations, base reset
```

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.app.json`).

### Vite Config

`vite.config.ts` sets `base: './'` so built assets use relative paths — required for deployment to subdirectory-based hosts like Netlify.

### TypeScript Setup

- `tsconfig.json` is a project-references root pointing to `tsconfig.app.json`
- `tsconfig.app.json` uses `strict: true` with `noUnusedLocals` and `noUnusedParameters`
- `env.d.ts` declares `*.vue` module types for TypeScript to understand SFC imports

### Data Flow

**Heart click → popup open (shatter flow):**
1. `AnimatedHeart` emits a `click` event with the native `MouseEvent`
2. `App.vue` handler computes the heart's screen center, calls `ParticleCanvas.shatterBurst(x, y, 55)` for a dramatic outward particle explosion
3. After a 600ms timeout, `showPopup` is set `true`
4. `ConfessionPopup` watches its `visible` prop — on `true`, randomly picks a message from its 8-message pool

**Popup close → heart reassemble:**
1. `ConfessionPopup` emits `close` (via overlay click or × button)
2. `App.vue` calls `ParticleCanvas.reassembleBurst(x, y, 40)` — particles spawn scattered around the heart center and fly inward
3. `App.vue` calls `AnimatedHeart.reset()` which triggers the `heart-reassemble` CSS keyframe (scale 0→1 with overshoot)

**Anywhere-click particles (ambient):**
- `ParticleCanvas` listens to `document.click` globally and spawns a small burst of 25 heart-shaped particles at the click point via `createParticles()`

### Key Patterns

- All components use `<script setup lang="ts">` with Composition API
- Animations split between CSS (breathe, float-up, glow-pulse, pop-in, twinkle, meteor-fall, heart-shatter, heart-reassemble, pulse-ring-out) and Canvas (particle system in `useHeartParticles.ts`)
- SVG hearts use `radialGradient` defs for fill, plus a white shine overlay path and `feGaussianBlur` SVG filter for glow
- No external UI/animation libraries — pure CSS + Canvas 2D
- Parent→child communication: `defineExpose` (AnimatedHeart exposes `reset()`, ParticleCanvas exposes `addBurst`/`shatterBurst`/`reassembleBurst`) + template refs in App
- Child→parent communication: `defineEmits` (AnimatedHeart emits `click`, ConfessionPopup emits `close`)

### Color Scheme (CSS Variables)

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-deep` | `#1a0a1e` | Dark romantic background |
| `--bg-mid` | `#2d1b33` | Gradient midpoint |
| `--bg-surface` | `rgba(30, 10, 30, 0.85)` | Card/popup background |
| `--pink` | `#ff6b9d` | Primary accent |
| `--pink-light` | `#ff9ec4` | Name highlight |
| `--pink-deep` | `#ff4081` | Heart gradient end |
| `--pink-dark` | `#e91e63` | Heart gradient deepest |
| `--purple-light` | `#ea80fc` | Accent variation (particles) |
| `--rose` | `#ff8a80` | Accent variation (particles) |
| `--text-primary` | `#ffe0ec` | Main text |
| `--text-dim` | `rgba(255, 224, 236, 0.6)` | Secondary/muted text |

Glow tokens are also defined: `--glow-pink` (subtle) and `--glow-strong` (intense, used on hover).

## Testing

There is no test framework configured yet. To add one, Vitest is the natural choice (same ecosystem as Vite + Vue).

## Customization Points

- **Name**: `ConfessionTitle.vue` accepts a `name` prop but the `displayName` computed hardcodes `'可可'` instead of using it. Change to `const displayName = computed(() => props.name || '可可')` and pass `<ConfessionTitle name="你的名字" />` in `App.vue`. `ConfessionPopup.vue` also defines an unused `name` prop ready for wiring.
- **Confession messages**: The 8-message pool is in `ConfessionPopup.vue`'s `messages` array
- **Particle colors**: `HEART_COLORS` array in `useHeartParticles.ts`
- **Floating heart count**: `FLOATING_HEARTS_COUNT` constant (15) in `FloatingHearts.vue`
- **Meteor count**: `METEOR_COUNT` constant (12) in `MeteorShower.vue`
- **Star count**: `STAR_COUNT` constant (200) in `StarrySky.vue`
