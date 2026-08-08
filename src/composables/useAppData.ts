import { ref, provide, inject, type InjectionKey, type Ref } from 'vue'
import messagesRaw from '../../material/messages.txt?raw'
import careWordsRaw from '../../material/care-words.txt?raw'

// ── Default values from material files (build-time fallback) ──
function parseLines(raw: string): string[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

const defaultMessages = parseLines(messagesRaw)
const defaultCareWords = parseLines(careWordsRaw)
const defaultName = '{name}'

// ── API helpers ──
interface DataPayload {
  name: string
  messages: string[]
  careWords: string[]
}

async function fetchData(): Promise<DataPayload> {
  const res = await fetch('/api/data')
  if (!res.ok) throw new Error(`GET /api/data failed: ${res.status}`)
  return res.json()
}

async function pushData(data: DataPayload): Promise<DataPayload> {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`POST /api/data failed: ${res.status}`)
  return res.json()
}

// ── Type ──
export interface AppData {
  name: Ref<string>
  messages: Ref<string[]>
  careWords: Ref<string[]>
  ready: Ref<boolean>
  loadData: () => Promise<void>
  saveName: (v: string) => Promise<void>
  saveMessages: (v: string[]) => Promise<void>
  saveCareWords: (v: string[]) => Promise<void>
  saveAll: (name: string, messages: string[], careWords: string[]) => Promise<boolean>
  resetAll: () => Promise<boolean>
}

export const APP_DATA_KEY: InjectionKey<AppData> = Symbol('appData')

// ── Provider (called once in App.vue setup) ──
export function provideAppData(): AppData {
  const name = ref(defaultName)
  const messages = ref<string[]>([...defaultMessages])
  const careWords = ref<string[]>([...defaultCareWords])
  const ready = ref(false)

  /** Fetch persisted data from server file — call on mount */
  async function loadData() {
    try {
      const data = await fetchData()
      name.value = data.name || defaultName
      messages.value = data.messages.length > 0 ? data.messages : [...defaultMessages]
      careWords.value = data.careWords.length > 0 ? data.careWords : [...defaultCareWords]
    } catch {
      // API unavailable — keep defaults from ?raw imports
    }
    ready.value = true
  }

  async function saveAll(
    newName: string,
    newMessages: string[],
    newCareWords: string[],
  ): Promise<boolean> {
    try {
      const data = await pushData({
        name: newName || defaultName,
        messages: newMessages.length > 0 ? newMessages : [...defaultMessages],
        careWords: newCareWords.length > 0 ? newCareWords : [...defaultCareWords],
      })
      name.value = data.name
      messages.value = data.messages
      careWords.value = data.careWords
      return true
    } catch {
      return false
    }
  }

  async function saveName(v: string) {
    name.value = v
    try {
      await pushData({
        name: v || defaultName,
        messages: messages.value,
        careWords: careWords.value,
      })
    } catch { /* ignore */ }
  }

  async function saveMessages(v: string[]) {
    messages.value = [...v]
    try {
      await pushData({
        name: name.value,
        messages: v.length > 0 ? v : [...defaultMessages],
        careWords: careWords.value,
      })
    } catch { /* ignore */ }
  }

  async function saveCareWords(v: string[]) {
    careWords.value = [...v]
    try {
      await pushData({
        name: name.value,
        messages: messages.value,
        careWords: v.length > 0 ? v : [...defaultCareWords],
      })
    } catch { /* ignore */ }
  }

  async function resetAll(): Promise<boolean> {
    try {
      const data = await pushData({
        name: defaultName,
        messages: [...defaultMessages],
        careWords: [...defaultCareWords],
      })
      name.value = data.name
      messages.value = data.messages
      careWords.value = data.careWords
      return true
    } catch {
      name.value = defaultName
      messages.value = [...defaultMessages]
      careWords.value = [...defaultCareWords]
      return false
    }
  }

  const data: AppData = {
    name, messages, careWords, ready,
    loadData, saveName, saveMessages, saveCareWords, saveAll, resetAll,
  }
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
