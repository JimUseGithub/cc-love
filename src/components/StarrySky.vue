<script setup lang="ts">
const STAR_COUNT = 200

/** Generate a star with random properties for a natural night sky look */
function createStar(id: number) {
  const isBright = Math.random() < 0.2 // ~20% bright stars
  return {
    id,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: isBright
      ? `${2 + Math.random() * 2.5}px`
      : `${1 + Math.random() * 1.8}px`,
    delay: `${Math.random() * 5}s`,
    // Twinkle: bright stars pulse slower, dim stars flicker faster
    twinkleDuration: isBright
      ? `${2.5 + Math.random() * 3.5}s`
      : `${1.2 + Math.random() * 1.8}s`,
    baseOpacity: isBright ? 0.7 + Math.random() * 0.3 : 0.4 + Math.random() * 0.45,
    color: pickStarColor(),
  }
}

function pickStarColor(): string {
  const r = Math.random()
  if (r < 0.6) return '#ffffff'      // white (most common)
  if (r < 0.8) return '#ffe8f0'      // warm pink-white
  if (r < 0.92) return '#fff4e0'     // warm yellow-white
  return '#e8e0ff'                    // cool blue-white (rare)
}

const stars = Array.from({ length: STAR_COUNT }, (_, i) => createStar(i))
</script>

<template>
  <div class="starry-sky">
    <div
      v-for="s in stars"
      :key="s.id"
      class="star"
      :class="{ 'star--bright': s.baseOpacity > 0.7 }"
      :style="{
        left: s.left,
        top: s.top,
        width: s.size,
        height: s.size,
        animationDelay: s.delay,
        animationDuration: s.twinkleDuration,
        '--base-opacity': s.baseOpacity,
        '--star-color': s.color,
      }"
    ></div>
  </div>
</template>

<style scoped>
.starry-sky {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: var(--star-color, #ffffff);
  opacity: var(--base-opacity, 0.5);
  animation: twinkle ease-in-out infinite;
}

.star--bright {
  box-shadow:
    0 0 2px 1px rgba(255, 255, 255, 0.6),
    0 0 6px 2px rgba(255, 200, 220, 0.3);
}

@keyframes twinkle {
  0%, 100% {
    opacity: calc(var(--base-opacity, 0.5) * 1);
  }
  30% {
    opacity: calc(var(--base-opacity, 0.5) * 1.6);
  }
  60% {
    opacity: calc(var(--base-opacity, 0.5) * 0.5);
  }
  85% {
    opacity: calc(var(--base-opacity, 0.5) * 1.3);
  }
}
</style>
