<script setup lang="ts">
const FLOATING_HEARTS_COUNT = 15

const hearts = Array.from({ length: FLOATING_HEARTS_COUNT }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: `${12 + Math.random() * 18}px`,
  delay: `${Math.random() * 8}s`,
  duration: `${6 + Math.random() * 8}s`,
  opacity: 0.15 + Math.random() * 0.25,
}))
</script>

<template>
  <div class="floating-hearts-layer">
    <div
      v-for="heart in hearts"
      :key="heart.id"
      class="floating-heart"
      :style="{
        left: heart.left,
        width: heart.size,
        height: heart.size,
        animationDelay: heart.delay,
        animationDuration: heart.duration,
        opacity: heart.opacity,
      }"
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.floating-hearts-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-heart {
  position: absolute;
  bottom: -10vh;
  color: var(--pink);
  animation: float-up linear infinite;
}
</style>
