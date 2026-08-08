<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const heartRef = ref<HTMLElement>()
const offsetX = ref(0)
const offsetY = ref(0)
const isHovered = ref(false)
const shattered = ref(false)
const reassembling = ref(false)

function reset() {
  shattered.value = false
  reassembling.value = true
  // Remove reassembling class after animation completes
  setTimeout(() => {
    reassembling.value = false
  }, 700)
}

defineExpose({ reset })

function onMouseMove(e: MouseEvent) {
  const rect = heartRef.value?.getBoundingClientRect()
  if (!rect) return
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  // Parallax: max 12px offset
  offsetX.value = (e.clientX - centerX) * 0.04
  offsetY.value = (e.clientY - centerY) * 0.04
}

function onMouseLeave() {
  offsetX.value = 0
  offsetY.value = 0
  isHovered.value = false
}

function onClick(e: MouseEvent) {
  shattered.value = true
  emit('click', e)
}
</script>

<template>
  <div
    class="heart-container"
      :class="{ shattered, reassembling }"
      @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="isHovered = true"
    @click="onClick"
  >
    <svg
      ref="heartRef"
      class="animated-heart"
      :class="{ hovered: isHovered }"
      :style="{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
      }"
      viewBox="0 0 200 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="heartGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ff9ec4" />
          <stop offset="40%" stop-color="#ff6b9d" />
          <stop offset="80%" stop-color="#ff4081" />
          <stop offset="100%" stop-color="#e91e63" />
        </radialGradient>
        <radialGradient id="heartShine" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.4)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="heartGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Main heart shape -->
      <path
        class="heart-path"
        d="M100 175
           C100 175, 5 115, 5 60
           C5 25, 25 5, 55 5
           C75 5, 95 18, 100 32
           C105 18, 125 5, 145 5
           C175 5, 195 25, 195 60
           C195 115, 100 175, 100 175Z"
        fill="url(#heartGrad)"
        filter="url(#heartGlow)"
      />

      <!-- Shine overlay -->
      <path
        class="heart-shine"
        d="M100 175
           C100 175, 5 115, 5 60
           C5 25, 25 5, 55 5
           C75 5, 95 18, 100 32
           C105 18, 125 5, 145 5
           C175 5, 195 25, 195 60
           C195 115, 100 175, 100 175Z"
        fill="url(#heartShine)"
      />

      <!-- Inner highlight arcs for depth -->
      <path
        class="heart-detail"
        d="M60 55
           C60 35, 75 22, 95 30"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>

    <!-- Pulse rings -->
    <div class="pulse-ring ring-1"></div>
    <div class="pulse-ring ring-2"></div>
  </div>
</template>

<style scoped>
.heart-container {
  position: relative;
  z-index: 3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease-out;
}

.animated-heart {
  width: clamp(180px, 30vw, 320px);
  height: auto;
  animation: breathe 2.2s ease-in-out infinite, glow-pulse 2.2s ease-in-out infinite;
  transition: transform 0.12s ease-out;
}

.animated-heart.hovered {
  animation: breathe 1.4s ease-in-out infinite, glow-pulse 1.4s ease-in-out infinite;
  filter: drop-shadow(0 0 30px rgba(255, 107, 157, 0.8))
          drop-shadow(0 0 60px rgba(255, 64, 129, 0.5)) !important;
}

.heart-path {
  transition: all 0.3s ease;
}

.heart-detail {
  opacity: 0.6;
}

/* Pulse rings */
.pulse-ring {
  position: absolute;
  border: 2px solid rgba(255, 107, 157, 0.4);
  border-radius: 50%;
  width: clamp(180px, 30vw, 320px);
  height: clamp(160px, 26vw, 280px);
  pointer-events: none;
  animation: pulse-ring-out 2.2s ease-out infinite;
}

.ring-2 {
  animation-delay: 1.1s;
}

@keyframes pulse-ring-out {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Shatter animation */
.heart-container.shattered {
  pointer-events: none;
}

.heart-container.shattered .animated-heart {
  animation: heart-shatter 0.5s cubic-bezier(0.36, 0, 0.66, 1) forwards;
}

.heart-container.shattered .pulse-ring {
  animation: none;
  opacity: 0;
}

@keyframes heart-shatter {
  0% {
    transform: scale(1);
    opacity: 1;
    filter: drop-shadow(0 0 25px rgba(255, 107, 157, 0.7))
            drop-shadow(0 0 50px rgba(255, 64, 129, 0.4));
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
    filter: drop-shadow(0 0 40px rgba(255, 107, 157, 1))
            drop-shadow(0 0 80px rgba(255, 64, 129, 0.7));
  }
  100% {
    transform: scale(0);
    opacity: 0;
    filter: drop-shadow(0 0 60px rgba(255, 107, 157, 0))
            drop-shadow(0 0 100px rgba(255, 64, 129, 0));
  }
}

/* Reassemble animation */
.heart-container.reassembling {
  pointer-events: auto;
}

.heart-container.reassembling .animated-heart {
  animation: heart-reassemble 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.heart-container.reassembling .pulse-ring {
  animation: pulse-ring-out 2.2s ease-out infinite;
  animation-delay: 0.5s;
}

@keyframes heart-reassemble {
  0% {
    transform: scale(0);
    opacity: 0;
    filter: drop-shadow(0 0 40px rgba(255, 107, 157, 0.8))
            drop-shadow(0 0 80px rgba(255, 64, 129, 0.5));
  }
  60% {
    transform: scale(1.08);
    opacity: 1;
    filter: drop-shadow(0 0 30px rgba(255, 107, 157, 0.6))
            drop-shadow(0 0 60px rgba(255, 64, 129, 0.3));
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: drop-shadow(0 0 15px rgba(255, 107, 157, 0.4))
            drop-shadow(0 0 30px rgba(255, 64, 129, 0.2));
  }
}
</style>
