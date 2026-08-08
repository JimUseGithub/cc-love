const { getStore, connectLambda } = require('@netlify/blobs')

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

const STORE_NAME = 'confession-data'
const STORE_KEY = 'config'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
  }

  // Initialize Blobs context from Lambda event
  try {
    if (event.blobs) {
      connectLambda(event)
    }
  } catch (e) {
    console.error('[data] connectLambda failed:', e.message)
  }

  let store
  try {
    store = getStore(STORE_NAME)
  } catch (e) {
    console.error('[data] getStore failed:', e.message)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Blobs storage unavailable', detail: e.message }),
    }
  }

  try {
    if (event.httpMethod === 'GET') {
      let data = await store.get(STORE_KEY, { type: 'json' })
      if (!data) {
        console.log('[data] No existing data, seeding defaults')
        data = { ...DEFAULTS }
        await store.set(STORE_KEY, JSON.stringify(data))
      }
      return { statusCode: 200, headers, body: JSON.stringify(data) }
    }

    if (event.httpMethod === 'POST') {
      if (!event.body) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing body' }) }
      }

      const payload = JSON.parse(event.body)
      const data = {
        name: typeof payload.name === 'string' && payload.name.trim()
          ? payload.name.trim() : DEFAULTS.name,
        messages: Array.isArray(payload.messages) && payload.messages.length > 0
          ? payload.messages.filter(m => m && m.trim())
          : DEFAULTS.messages,
        careWords: Array.isArray(payload.careWords) && payload.careWords.length > 0
          ? payload.careWords.filter(w => w && w.trim())
          : DEFAULTS.careWords,
      }

      await store.set(STORE_KEY, JSON.stringify(data))
      console.log('[data] Saved successfully, messages:', data.messages.length, 'careWords:', data.careWords.length)

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ...data }) }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  } catch (e) {
    console.error('[data] Handler error:', e.message, e.stack)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', detail: e.message }),
    }
  }
}
