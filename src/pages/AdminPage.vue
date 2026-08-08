<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppData } from '../composables/useAppData'

const router = useRouter()
const appData = useAppData()

const formName = ref(appData.name.value)
const formMessages = ref(appData.messages.value.join('\n'))
const formCareWords = ref(appData.careWords.value.join('\n'))

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
}

function onReset() {
  formName.value = '{name}'
  formMessages.value = ''
  formCareWords.value = ''
}

function onBack() {
  router.push('/')
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header">
        <button class="back-btn" @click="onBack" title="返回首页">
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
        </button>
        <h1 class="admin-title">⚙️ 数据管理</h1>
        <div class="spacer"></div>
      </div>

      <!-- Form -->
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
          <p class="form-hint">显示在首页标题中，留空则使用默认值 {name}</p>
        </div>

        <!-- Messages -->
        <div class="form-group">
          <label class="form-label">💌 表白文案</label>
          <textarea
            v-model="formMessages"
            class="form-textarea"
            rows="10"
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
            rows="10"
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
</template>

<style scoped>
.admin-page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.admin-container {
  width: 100%;
  max-width: 520px;
  background: var(--bg-surface);
  border: 1px solid rgba(255, 107, 157, 0.25);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: 0 0 40px rgba(255, 107, 157, 0.15),
              0 0 80px rgba(255, 64, 129, 0.08);
  max-height: 90vh;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.admin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.admin-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  text-align: center;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  width: 36px;
  height: 36px;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-btn:hover {
  color: var(--pink);
  background: rgba(255, 107, 157, 0.1);
}

.spacer {
  width: 36px;
  flex-shrink: 0;
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
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--pink-light);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 157, 0.25);
  background: rgba(255, 107, 157, 0.06);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: var(--font-cn);
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--pink);
  box-shadow: 0 0 10px rgba(255, 107, 157, 0.15);
}

.form-input::placeholder {
  color: var(--text-dim);
  opacity: 0.5;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
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
  box-shadow: 0 0 10px rgba(255, 107, 157, 0.15);
}

.form-textarea::placeholder {
  color: var(--text-dim);
  opacity: 0.5;
}

.form-hint {
  font-size: 0.78rem;
  color: var(--text-dim);
  opacity: 0.5;
  margin-top: 6px;
}

/* ── Footer ── */
.admin-footer {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-shrink: 0;
}

.btn-save,
.btn-reset {
  flex: 1;
  padding: 12px 0;
  border-radius: 12px;
  font-size: 0.95rem;
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
  box-shadow: 0 0 20px rgba(255, 107, 157, 0.4);
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
</style>
