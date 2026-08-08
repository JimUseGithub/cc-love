<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  type Particle,
  createParticles,
  createReassembleBurst,
  createShatterBurst,
  updateParticles,
} from '../composables/useHeartParticles'

const canvasRef = ref<HTMLCanvasElement>()
let particles: Particle[] = []
let animFrameId: number = 0
let lastTime = 0
let ctx: CanvasRenderingContext2D | null = null

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function animate(time: number) {
  if (!ctx || !canvasRef.value) return
  const delta = lastTime ? time - lastTime : 0
  lastTime = time
  particles = updateParticles(particles, ctx, canvasRef.value, delta)
  animFrameId = requestAnimationFrame(animate)
}

function onDocumentClick(e: MouseEvent) {
  const newParticles = createParticles(e.clientX, e.clientY, 25)
  particles.push(...newParticles)
}

onMounted(() => {
  resize()
  ctx = canvasRef.value!.getContext('2d')!
  window.addEventListener('resize', resize)
  document.addEventListener('click', onDocumentClick)
  animFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', resize)
  document.removeEventListener('click', onDocumentClick)
})

defineExpose({
  addBurst(x: number, y: number, count?: number) {
    const newParticles = createParticles(x, y, count ?? 30)
    particles.push(...newParticles)
  },
  shatterBurst(x: number, y: number, count?: number) {
    const newParticles = createShatterBurst(x, y, count ?? 50)
    particles.push(...newParticles)
  },
  reassembleBurst(x: number, y: number, count?: number) {
    const newParticles = createReassembleBurst(x, y, count ?? 40)
    particles.push(...newParticles)
  },
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<style scoped>
.particle-canvas {
  position: fixed;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}
</style>
