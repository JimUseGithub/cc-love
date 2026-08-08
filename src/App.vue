<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AnimatedHeart from './components/AnimatedHeart.vue'
import ConfessionTitle from './components/ConfessionTitle.vue'
import FloatingHearts from './components/FloatingHearts.vue'
import MeteorShower from './components/MeteorShower.vue'
import StarrySky from './components/StarrySky.vue'
import ParticleCanvas from './components/ParticleCanvas.vue'
import ConfessionPopup from './components/ConfessionPopup.vue'
import EasterEggOverlay from './components/EasterEggOverlay.vue'

const showPopup = ref(false)
const clickCount = ref(0)
const particleCanvasRef = ref<InstanceType<typeof ParticleCanvas>>()
const heartRef = ref<InstanceType<typeof AnimatedHeart>>()
const easterEggRef = ref<InstanceType<typeof EasterEggOverlay>>()
const audioRef = ref<HTMLAudioElement>()

// Store heart center for reassemble
let heartCenter = { x: 0, y: 0 }

// Start background audio on first user interaction (browser autoplay policy)
onMounted(() => {
  const startAudio = () => {
    audioRef.value?.play().catch(() => {})
    document.removeEventListener('click', startAudio)
  }
  document.addEventListener('click', startAudio)
})

function onHeartClick(e: MouseEvent) {
  clickCount.value++

  // Get heart center for the burst origin
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  heartCenter.x = rect.left + rect.width / 2
  heartCenter.y = rect.top + rect.height / 2

  // Dramatic heart-shatter burst
  particleCanvasRef.value?.shatterBurst(heartCenter.x, heartCenter.y, 55)

  // Every 5th click: trigger easter egg instead of normal popup
  if (clickCount.value % 5 === 0) {
    setTimeout(() => {
      easterEggRef.value?.play()
    }, 400)

    return
  }

  // Normal flow: show confession popup after shatter animation
  setTimeout(() => {
    showPopup.value = true
  }, 600)
}

function onEasterEggFinished() {
  particleCanvasRef.value?.reassembleBurst(heartCenter.x, heartCenter.y, 40)
  heartRef.value?.reset()
}

function onPopupClose() {
  showPopup.value = false
  // Reassemble: particles fly inward + heart scales back
  particleCanvasRef.value?.reassembleBurst(heartCenter.x, heartCenter.y, 40)
  heartRef.value?.reset()
}
</script>

<template>
  <div class="app">
    <!-- Background audio -->
    <audio ref="audioRef" loop preload="auto" src="/background.mp3"></audio>

    <!-- Background effects -->
    <StarrySky />
    <MeteorShower />
    <FloatingHearts />

    <!-- Main content -->
    <main class="main-content">
      <ConfessionTitle />
      <AnimatedHeart ref="heartRef" @click="onHeartClick" />
      <p class="click-hint">💡 点击爱心，传递心意</p>
    </main>

    <!-- Canvas particle layer -->
    <ParticleCanvas ref="particleCanvasRef" />

    <!-- Easter egg overlay (every 5th click) -->
    <EasterEggOverlay ref="easterEggRef" @finished="onEasterEggFinished" />

    <!-- Confession popup -->
    <ConfessionPopup
      :visible="showPopup"
      @close="onPopupClose"
    />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.main-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.click-hint {
  font-size: 0.9rem;
  color: var(--text-dim);
  opacity: 0.7;
  animation: fade-in-up 1s ease-out 1s both;
  letter-spacing: 0.05em;
}
</style>
