import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'

const DATA_FILE = path.resolve(__dirname, 'material/data.json')

// Default data fallback (used when data.json doesn't exist yet)
const DEFAULTS = {
  name: '{name}',
  messages: [
    '遇见你，是我这辈子最美丽的意外。',
    '你笑起来的样子，比世间所有风景都好看。',
    '如果可以，我想把所有的温柔都给你。',
    '我不贪心，只想和你有一个很长很长的未来。',
    '你知道你和星星的区别吗？星星在天上，而你在我心里。',
    '山野万里，你是我藏在微风里的欢喜。',
    '所有的遗憾都被你填满，所有的期待都与你有关。',
    '这个世界很大，但我的心很小，小到只能装下你一个人。',
    '我本将心向明月，奈何明月照沟渠。 —— 可后来我才明白，那晚的明月不是照了沟渠，是只照了你。',
    '沾衣欲湿杏花雨，吹面不寒杨柳风。 —— 那场杏花雨其实没能沾湿我的衣裳，倒是你拂过我身畔的那阵风，至今让我心头微烫。',
    '众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。 —— 从前的千百次回头，我都只看见了灯火；唯独这次回头，看见了你的眼睛，才发现灯火其实也不阑珊。',
    '玲珑骰子安红豆，入骨相思知不知。 —— 我不喜欢赌博，但如果是你，我愿赌上这一生的相思，入骨的那种。',
    '若教眼底无离恨，不信人间有白头。 —— 可你说，若眼底都是你，没有离恨，那这一头白发是不是就来得慢一些？',
    '今晚的月色并不怎么好看，星星也稀疏，但只要你在我旁边，我就觉得这人间偷来的这一秒，格外划算。',
  ],
  careWords: [
    '吃早餐了吗', '多喝热水呀', '早安大宝贝', '晚安好梦啦', '记得加衣哦',
    '别太累了哦', '我想你了呢', '路上小心点', '今天开心吗', '注意多休息',
    '天冷多穿点', '按时吃饭呀', '早点睡觉哦', '工作别太累', '照顾好自己',
    '下雨要带伞', '别再熬夜啦', '要多笑一笑', '我会一直在', '你最棒了啦',
    '别感冒了哦', '记得吃早餐', '有啥烦心事', '今天过得好', '有事跟我说',
  ],
}

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      return {
        name: parsed.name || DEFAULTS.name,
        messages: Array.isArray(parsed.messages) && parsed.messages.length > 0
          ? parsed.messages : DEFAULTS.messages,
        careWords: Array.isArray(parsed.careWords) && parsed.careWords.length > 0
          ? parsed.careWords : DEFAULTS.careWords,
      }
    }
  } catch { /* file missing or corrupt — use defaults */ }
  return { ...DEFAULTS, messages: [...DEFAULTS.messages], careWords: [...DEFAULTS.careWords] }
}

function writeData(data: { name: string; messages: string[]; careWords: string[] }) {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function parseBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    {
      name: 'data-api',
      configureServer(server) {
        // GET  /api/data — read persisted data (re-reads file every request)
        // POST /api/data — write data to file
        server.middlewares.use('/api/data', async (req, res) => {
          // CORS headers (in case accessed from other devices on LAN)
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

          if (req.method === 'OPTIONS') {
            res.writeHead(204)
            res.end()
            return
          }

          if (req.method === 'GET') {
            try {
              const data = readData()
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.writeHead(200)
              res.end(JSON.stringify(data))
            } catch (e) {
              res.writeHead(500)
              res.end(JSON.stringify({ error: 'Failed to read data' }))
            }
            return
          }

          if (req.method === 'POST') {
            try {
              const body = await parseBody(req)
              const { name, messages, careWords } = JSON.parse(body)
              const data = {
                name: typeof name === 'string' ? name : DEFAULTS.name,
                messages: Array.isArray(messages) ? messages.filter(m => m.trim()) : DEFAULTS.messages,
                careWords: Array.isArray(careWords) ? careWords.filter(w => w.trim()) : DEFAULTS.careWords,
              }
              writeData(data)
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.writeHead(200)
              res.end(JSON.stringify({ ok: true, ...data }))
            } catch (e) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.writeHead(400)
              res.end(JSON.stringify({ error: 'Invalid request body' }))
            }
            return
          }

          res.writeHead(405)
          res.end(JSON.stringify({ error: 'Method not allowed' }))
        })
      },
    },
  ],
})
