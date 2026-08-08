import { ref, provide, inject, type InjectionKey, type Ref } from 'vue'
import messagesRaw from '../../material/messages.txt?raw'
import careWordsRaw from '../../material/care-words.txt?raw'

// ── Default values from material files ──
function parseLines(raw: string): string[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

const defaultMessages = parseLines(messagesRaw)
const defaultCareWords = parseLines(careWordsRaw)
const defaultName = '{name}'

// ── localStorage helpers ──
function loadString(key: string, fallback: string): string {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) return stored
  } catch { /* localStorage unavailable */ }
  return fallback
}

function saveString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch { /* localStorage unavailable */ }
}

function loadLines(key: string, fallback: string[]): string[] {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      return parseLines(stored)
    }
  } catch { /* localStorage unavailable */ }
  return [...fallback]
}

function saveLines(key: string, value: string[]): void {
  try {
    localStorage.setItem(key, value.join('\n'))
  } catch { /* localStorage unavailable */ }
}

// ── Type ──
export interface AppData {
  name: Ref<string>
  messages: Ref<string[]>
  careWords: Ref<string[]>
  saveName: (v: string) => void
  saveMessages: (v: string[]) => void
  saveCareWords: (v: string[]) => void
  resetAll: () => void
}

export const APP_DATA_KEY: InjectionKey<AppData> = Symbol('appData')

// ── Provider (called once in App.vue setup) ──
export function provideAppData(): AppData {
  const name = ref(loadString('confession_name', defaultName))
  const messages = ref(loadLines('confession_messages', defaultMessages))
  const careWords = ref(loadLines('confession_carewords', defaultCareWords))

  function saveName(v: string) {
    name.value = v
    saveString('confession_name', v)
  }

  function saveMessages(v: string[]) {
    messages.value = [...v]
    saveLines('confession_messages', v)
  }

  function saveCareWords(v: string[]) {
    careWords.value = [...v]
    saveLines('confession_carewords', v)
  }

  function resetAll() {
    saveName(defaultName)
    saveMessages(defaultMessages)
    saveCareWords(defaultCareWords)
  }

  const data: AppData = { name, messages, careWords, saveName, saveMessages, saveCareWords, resetAll }
  provide(APP_DATA_KEY, data)
  return data
}

// ── Consumer (called in child components) ──
export function useAppData(): AppData {
  const data = inject(APP_DATA_KEY)
  if (!data) {
    throw new Error('useAppData() must be called inside a component tree with provideAppData()')
  }
  return data
}
