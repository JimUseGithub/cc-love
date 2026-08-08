<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppData } from '../composables/useAppData'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const appData = useAppData()

// Local form state — initialized from appData when panel opens
const formName = ref(appData.name.value)
const formMessages = ref(appData.messages.value.join('\n'))
const formCareWords = ref(appData.careWords.value.join('\n'))

watch(
  () => appData.name.value,
  (v) => { formName.value = v }
)
watch(
  () => appData.messages.value,
  (v) => { formMessages.value = v.join('\n') }
)
watch(
  () => appData.careWords.value,
  (v) => { formCareWords.value = v.join('\n') }
)

function onSave() {
  appData.saveName(formName.value.trim() || '{name}')
  appData.saveMessages(
    formMessages.value
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
  )
  appData.saveCareWords(
    formCareWords.value
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
  )
  emit('close')
}

function onReset() {
  formName.value = '{name}'
  formMessages.value = ''
  formCareWords.value = ''
}

function onOverlayClick() {
  emit('close')
}
</script>

<template>
  <Transition name="popup">
    <div v-if="visible" class="admin-overlay" @click="onOverlayClick">
      <div class="admin-card" @click.stop>
        <!-- Header -->
        <div class="admin-header">
          <h2 class="admin-title">⚙️ 数据管理</h2>
          <button class="admin-close" @click="onOverlayClick" title="关闭">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="admin-body">
          <!-- Name -->
          <div class="form-group">
            <label class="form-label">👤 名字设置</label>
            <input
              v-model="formName"
              type="text"
              class="form-input"
              placeholder="{name}"
            />
            <p class="form-hint">显示在标题中，默认为 {name}</p>
          </div>

          <!-- Messages -->
          <div class="form-group">
            <label class="form-label">💌 表白文案</label>
            <textarea
              v-model="formMessages"
              class="form-textarea"
              rows="6"
              placeholder="一行一条文案"
            ></textarea>
            <p class="form-hint">每行一条，点击爱心时随机展示</p>
          </div>

          <!-- Care Words -->
          <div class="form-group">
            <label class="form-label">💬 关怀短语</label>
            <textarea
              v-model="formCareWords"
              class="form-textarea"
              rows="6"
              placeholder="一行一条短语（建议5个字）"
            ></textarea>
            <p class="form-hint">每行一条，彩蛋动画中展示。建议统一字数效果更佳</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="admin-footer">
          <button class="btn-reset" @click="onReset">恢复默认</button>
          <button class="btn-save" @click="onSave">💾 保存</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.admin-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 2, 12, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.admin-card {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid rgba(255, 107, 157, 0.25);
  border-radius: var(--radius-lg);
  padding: 28px 28px 24px;
  max-width: 520px;
  width: 92%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 40px rgba(255, 107, 157, 0.15),
              0 0 80px rgba(255, 64, 129, 0.08);
}

/* ── Header ── */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.admin-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
}

.admin-close {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.admin-close:hover {
  color: var(--pink);
  background: rgba(255, 107, 157, 0.1);
}

/* ── Body ── */
.admin-body {
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
}

.admin-body::-webkit-scrollbar {
  width: 4px;
}

.admin-body::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 157, 0.2);
  border-radius: 2px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--pink-light);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 107, 157, 0.25);
  background: rgba(255, 107, 157, 0.06);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: var(--font-cn);
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--pink);
  box-shadow: 0 0 8px rgba(255, 107, 157, 0.15);
}

.form-input::placeholder {
  color: var(--text-dim);
  opacity: 0.5;
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 107, 157, 0.25);
  background: rgba(255, 107, 157, 0.06);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: var(--font-cn);
  line-height: 1.7;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: var(--pink);
  box-shadow: 0 0 8px rgba(255, 107, 157, 0.15);
}

.form-textarea::placeholder {
  color: var(--text-dim);
  opacity: 0.5;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-dim);
  opacity: 0.5;
  margin-top: 4px;
}

/* ── Footer ── */
.admin-footer {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-shrink: 0;
}

.btn-save,
.btn-reset {
  flex: 1;
  padding: 10px 0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--font-cn);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-save {
  background: linear-gradient(135deg, var(--pink), var(--pink-deep));
  color: #fff;
}

.btn-save:hover {
  box-shadow: 0 0 16px rgba(255, 107, 157, 0.4);
  transform: translateY(-1px);
}

.btn-reset {
  background: transparent;
  color: var(--text-dim);
  border: 1px solid rgba(255, 107, 157, 0.2);
}

.btn-reset:hover {
  background: rgba(255, 107, 157, 0.08);
  color: var(--text-primary);
}

/* ── Transition ── */
.popup-enter-active {
  transition: opacity 0.3s ease;
}

.popup-enter-active .admin-card {
  animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-leave-active {
  transition: opacity 0.2s ease;
}

.popup-leave-to {
  opacity: 0;
}
</style>
