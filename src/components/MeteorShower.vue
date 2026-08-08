<script setup lang="ts">
const METEOR_COUNT = 12

const meteors = Array.from({ length: METEOR_COUNT }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 50}%`,
  delay: `${Math.random() * 6}s`,
  duration: `${1.2 + Math.random() * 2.0}s`,
  size: `${60 + Math.random() * 120}px`,
  opacity: 0.15 + Math.random() * 0.35,
  angle: 25 + Math.random() * 15,
}))
</script>

<template>
  <div class="meteor-layer">
    <div
      v-for="m in meteors"
      :key="m.id"
      class="meteor"
      :style="{
        left: m.left,
        top: m.top,
        width: m.size,
        opacity: m.opacity,
      }"
    >
      <div
        class="meteor-body"
        :style="{
          animationDelay: m.delay,
          animationDuration: m.duration,
          '--angle': `${m.angle}deg`,
        }"
      >
        <div class="meteor-head"></div>
        <div class="meteor-trail"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meteor-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.meteor {
  position: absolute;
}

.meteor-body {
  display: flex;
  align-items: center;
  animation: meteor-fall linear infinite;
  will-change: transform;
}

.meteor-head {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 0 6px 2px rgba(255, 255, 255, 0.9),
    0 0 12px 4px rgba(255, 158, 196, 0.7),
    0 0 20px 6px rgba(255, 107, 157, 0.4);
  flex-shrink: 0;
  z-index: 1;
}

.meteor-trail {
  height: 1.5px;
  flex: 1;
  background: linear-gradient(
    to left,
    rgba(255, 255, 255, 0.9),
    rgba(255, 158, 196, 0.5) 30%,
    rgba(255, 107, 157, 0.15) 70%,
    transparent 100%
  );
  border-radius: 1px;
}

@keyframes meteor-fall {
  0% {
    transform: rotate(var(--angle, 30deg)) translateX(0);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  70% {
    opacity: 0.8;
  }
  100% {
    transform: rotate(var(--angle, 30deg)) translateX(120vw);
    opacity: 0;
  }
}
</style>
