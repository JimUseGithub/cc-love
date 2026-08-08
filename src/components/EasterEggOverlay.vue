<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useAppData } from '../composables/useAppData'

// ── Constants ──
const DOT_COUNT = 100
const DOT_INTERVAL = 1.0      // seconds between each dot appearing in center
const CENTER_READ_TIME = 1.0  // seconds a dot stays large in center for reading
const FLY_DURATION = 0.4      // seconds to fly from center to heart position
const PULSE_DURATION = 1.5    // seconds for heart pulse
const SCATTER_DURATION = 1.5  // seconds to scatter to fill screen
const FINAL_DURATION = 0.8    // seconds for final message
const FADE_OUT = 0.4          // seconds for overlay fade-out

const PINK_PALETTE = ['#ff9ec4', '#ff6b9d', '#ff8a80', '#ea80fc', '#ff4081', '#ffb3c6', '#e91e63', '#ffb3c6']

// ── Build phrase pool ──
const appData = useAppData()

function buildPhrasePool(): string[] {
  const phrases = appData.careWords.value

  if (phrases.length === 0) return Array.from({ length: DOT_COUNT }, () => '❤️')

  const pool: string[] = []
  while (pool.length < DOT_COUNT) {
    for (const p of phrases) {
      pool.push(p)
      if (pool.length >= DOT_COUNT) break
    }
  }
  return pool.slice(0, DOT_COUNT)
}

// ── Heart shape math ──
function heartPoint(t: number): { x: number; y: number } {
  const st = Math.sin(t)
  const x = 16 * st * st * st
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
  return { x, y }
}

// ── Per-dot state ──
interface TextDot {
  el: HTMLSpanElement
  heartX: number; heartY: number
  scatterX: number; scatterY: number
  appearOrder: number
}

// ── Module-level state ──
let container: HTMLDivElement | null = null
let finalMsg: HTMLDivElement | null = null
let dots: TextDot[] = []
let animFrameId = 0
let startTime = 0
let active = false
let heartCX = 0
let heartCY = 0

// Phase transition times (computed from constants)
let phase1End = 0   // last dot arrives at heart
let phase2End = 0   // pulse ends
let phase3End = 0   // scatter ends
let totalTime = 0   // animation ends

// ── Easings ──
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ── Emit for parent notification ──
const emit = defineEmits<{ finished: [] }>()

// ── Setup overlay & dots ──
function setup() {
  const phrases = buildPhrasePool()

  // Compute phase timings
  const lastDotOrder = DOT_COUNT - 1
  const lastAppear = lastDotOrder * DOT_INTERVAL
  const lastFlyStart = lastAppear + CENTER_READ_TIME
  const lastArrival = lastFlyStart + FLY_DURATION
  phase1End = lastArrival
  phase2End = phase1End + PULSE_DURATION
  phase3End = phase2End + SCATTER_DURATION
  totalTime = phase3End + FINAL_DURATION

  // Create overlay container
  container = document.createElement('div')
  container.className = 'easter-egg-overlay'
  Object.assign(container.style, {
    position: 'fixed', inset: '0', zIndex: '8',
    pointerEvents: 'none', overflow: 'hidden', opacity: '1',
  })

  // Final message (hidden until Phase 4)
  finalMsg = document.createElement('div')
  finalMsg.textContent = '宝宝~我喜欢你'
  Object.assign(finalMsg.style, {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%) scale(0.5)',
    fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '700',
    fontFamily: "var(--font-cn, 'PingFang SC', 'Microsoft YaHei', sans-serif)",
    color: '#ff9ec4',
    textShadow: '0 0 30px rgba(255,107,157,0.8), 0 0 60px rgba(255,64,129,0.5), 0 0 100px rgba(255,107,157,0.3)',
    zIndex: '9', opacity: '0', textAlign: 'center',
    whiteSpace: 'nowrap', letterSpacing: '0.08em',
  })
  container.appendChild(finalMsg)

  // Compute heart geometry
  const vw = window.innerWidth
  const vh = window.innerHeight
  const scale = Math.min(vw, vh) * 0.018
  heartCX = vw / 2
  heartCY = vh / 2 - vh * 0.03

  // Create dots
  dots = phrases.map((text, i) => {
    const t = (i / DOT_COUNT) * Math.PI * 2
    const hp = heartPoint(t)
    const heartX = heartCX + hp.x * scale
    const heartY = heartCY + hp.y * scale

    const scatterX = Math.random() * vw * 0.94 + vw * 0.03
    const scatterY = Math.random() * vh * 0.94 + vh * 0.03

    const colorIdx = Math.floor((i / DOT_COUNT) * PINK_PALETTE.length)
    const color = PINK_PALETTE[colorIdx]
    const bgAlpha = 0.12 + (i / DOT_COUNT) * 0.1
    const borderAlpha = 0.35 + (i / DOT_COUNT) * 0.25

    const el = document.createElement('span')
    el.textContent = text
    Object.assign(el.style, {
      position: 'fixed', left: '0', top: '0',
      transform: `translate(${heartCX}px, ${heartCY}px) scale(2.0)`,
      fontSize: '13px', fontWeight: '600',
      fontFamily: "var(--font-cn, 'PingFang SC', 'Microsoft YaHei', sans-serif)",
      color,
      background: `rgba(255, 107, 157, ${bgAlpha})`,
      border: `1px solid rgba(255, 158, 196, ${borderAlpha})`,
      borderRadius: '14px', padding: '3px 9px',
      textShadow: '0 0 6px rgba(255,107,157,0.35)',
      boxShadow: '0 1px 4px rgba(255,64,129,0.12)',
      opacity: '0',
      willChange: 'transform, opacity',
      pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      backdropFilter: 'blur(1px)',
    })
    container!.appendChild(el)

    return { el, heartX, heartY, scatterX, scatterY, appearOrder: i }
  })

  document.body.appendChild(container)
}

function teardown() {
  cancelAnimationFrame(animFrameId)
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
  container = null
  finalMsg = null
  dots = []
  active = false
}

// ── Animation loop ──
function animate(timestamp: number) {
  if (!active) return
  if (!startTime) startTime = timestamp

  const elapsed = (timestamp - startTime) / 1000

  if (elapsed >= totalTime + FADE_OUT) {
    teardown()
    emit('finished')
    return
  }

  if (elapsed >= totalTime) {
    // Fade out overlay
    if (container) {
      container.style.opacity = '0'
      container.style.transition = 'opacity 0.4s ease'
    }
    animFrameId = requestAnimationFrame(animate)
    return
  }

  for (const dot of dots) {
    const appearTime = dot.appearOrder * DOT_INTERVAL
    const flyStart = appearTime + CENTER_READ_TIME
    const heartArrival = flyStart + FLY_DURATION

    if (elapsed < appearTime) {
      dot.el.style.opacity = '0'
      continue
    }

    if (elapsed < flyStart) {
      // ── Center display: large, readable ──
      const appearT = Math.min(1, (elapsed - appearTime) / 0.15) // quick fade-in
      dot.el.style.opacity = String(easeOutCubic(appearT))
      dot.el.style.transform = `translate(${heartCX}px, ${heartCY}px) scale(2.0)`
      dot.el.style.textShadow = '0 0 12px rgba(255,107,157,0.6)'
      dot.el.style.zIndex = '10' // bring to front while reading

    } else if (elapsed < heartArrival) {
      // ── Flying: center → heart position ──
      const flyT = easeInOutCubic((elapsed - flyStart) / FLY_DURATION)
      const x = heartCX + (dot.heartX - heartCX) * flyT
      const y = heartCY + (dot.heartY - heartCY) * flyT
      const s = 2.0 - 1.0 * flyT // scale 2.0 → 1.0
      dot.el.style.opacity = '1'
      dot.el.style.transform = `translate(${x}px, ${y}px) scale(${s})`
      dot.el.style.textShadow = '0 0 6px rgba(255,107,157,0.35)'
      dot.el.style.zIndex = ''

    } else if (elapsed < phase2End) {
      // ── Heart pulse ──
      const phaseT = (elapsed - phase1End) / PULSE_DURATION
      const pulse = 1 + Math.sin(phaseT * Math.PI * 2.5) * 0.03
      const x = heartCX + (dot.heartX - heartCX) * pulse
      const y = heartCY + (dot.heartY - heartCY) * pulse
      dot.el.style.opacity = String(0.85 + Math.sin(phaseT * Math.PI * 2.5) * 0.15)
      dot.el.style.transform = `translate(${x}px, ${y}px) scale(1)`
      dot.el.style.textShadow = '0 0 6px rgba(255,107,157,0.35)'
      dot.el.style.zIndex = ''

    } else if (elapsed < phase3End) {
      // ── Scatter to fill screen ──
      const t = easeInOutCubic((elapsed - phase2End) / SCATTER_DURATION)
      const x = dot.heartX + (dot.scatterX - dot.heartX) * t
      const y = dot.heartY + (dot.scatterY - dot.heartY) * t
      dot.el.style.opacity = String(1 - t * 0.7)
      dot.el.style.transform = `translate(${x}px, ${y}px) scale(1)`
      dot.el.style.textShadow = '0 0 6px rgba(255,107,157,0.35)'

    } else {
      // ── Final: fade out ──
      const t = Math.min(1, (elapsed - phase3End) / 0.5)
      dot.el.style.opacity = String(Math.max(0, (1 - t) * 0.3))
      dot.el.style.transform = `translate(${dot.scatterX}px, ${dot.scatterY}px) scale(1)`
    }
  }

  // Final message
  if (elapsed >= phase3End && finalMsg) {
    const t = Math.min(1, (elapsed - phase3End) / 0.4)
    finalMsg.style.opacity = String(easeOutCubic(t))
    finalMsg.style.transform = `translate(-50%, -50%) scale(${0.5 + 0.5 * easeOutCubic(t)})`
  }

  animFrameId = requestAnimationFrame(animate)
}

// ── Public API ──
function play() {
  if (active) return
  active = true
  startTime = 0
  setup()
  animFrameId = requestAnimationFrame(animate)
}

defineExpose({ play })

onUnmounted(() => {
  active = false
  cancelAnimationFrame(animFrameId)
  teardown()
})
</script>

<template>
  <div style="display: none"></div>
</template>
