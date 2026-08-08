<script setup lang="ts">
import { ref, watch } from 'vue'
import messagesRaw from '../../material/messages.txt?raw'

const props = defineProps<{
  visible: boolean
  name?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const messages = messagesRaw
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0)

const currentMessage = ref('')

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      currentMessage.value = messages[Math.floor(Math.random() * messages.length)]
    }
  }
)

function onOverlayClick() {
  emit('close')
}
</script>

<template>
  <Transition name="popup">
    <div v-if="visible" class="popup-overlay" @click="onOverlayClick">
      <div class="popup-card" @click.stop>
        <button class="popup-close" @click="onOverlayClick" title="关闭">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div class="popup-heart-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                 C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                 c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#popupHeartGrad)"
            />
          </svg>
        </div>

        <p class="popup-message">{{ currentMessage }}</p>

        <div class="popup-footer">
          <span class="popup-hint">❤️ 点击任意位置关闭</span>
        </div>
      </div>

      <!-- Hidden gradient definition -->
      <svg width="0" height="0">
        <defs>
          <linearGradient id="popupHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff9ec4" />
            <stop offset="100%" stop-color="#ff4081" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </Transition>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 2, 12, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.popup-card {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid rgba(255, 107, 157, 0.25);
  border-radius: var(--radius-lg);
  padding: 40px 36px 32px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 40px rgba(255, 107, 157, 0.15),
              0 0 80px rgba(255, 64, 129, 0.08);
}

.popup-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.popup-close:hover {
  color: var(--pink);
  background: rgba(255, 107, 157, 0.1);
}

.popup-heart-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  animation: breathe 1.5s ease-in-out infinite;
}

.popup-message {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-primary);
  text-shadow: 0 0 8px rgba(255, 107, 157, 0.2);
  margin-bottom: 24px;
}

.popup-hint {
  font-size: 0.8rem;
  color: var(--text-dim);
  opacity: 0.6;
}

/* Transition */
.popup-enter-active {
  transition: opacity 0.35s ease;
}

.popup-enter-active .popup-card {
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-leave-active {
  transition: opacity 0.25s ease;
}

.popup-leave-to {
  opacity: 0;
}
</style>
