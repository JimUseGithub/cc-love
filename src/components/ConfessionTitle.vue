<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{
  name?: string
}>()

const displayName = computed(() => '可可')

const nameParts = displayName.value.split('')
</script>

<template>
  <div class="title-wrapper">
    <h1 class="confession-title">
      <span class="name-highlight">{{ displayName }}</span>
      <span class="title-text">，我想和你一起看遍世间所有日落</span>
    </h1>
  </div>
</template>

<style scoped>
.title-wrapper {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 20px;
  animation: fade-in-up 1.2s ease-out 0.3s both;
}

.confession-title {
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  font-weight: 600;
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(255, 107, 157, 0.3);
  line-height: 1.6;
  letter-spacing: 0.05em;
}

.name-highlight {
  color: var(--pink-light);
  font-size: 1.15em;
  font-weight: 700;
  text-shadow: 0 0 15px rgba(255, 158, 196, 0.6),
               0 0 30px rgba(255, 107, 157, 0.3);
  position: relative;
}

.name-highlight::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--pink-light), transparent);
  border-radius: 1px;
}

.title-text {
  color: var(--text-dim);
  font-weight: 400;
}
</style>
