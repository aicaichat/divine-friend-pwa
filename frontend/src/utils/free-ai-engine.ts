/**
 * 免费AI神仙对话引擎
 * 基于本地智能响应系统，无需付费API
 */

interface DeityPersonality {
  id: string
  name: string
  traits: string[]
  specialties: string[]
  greeting: string
  mood: string
  responseStyle: 'gentle' | 'firm' | 'wise' | 'mystical' | 'scholarly' | 'compassionate'
}

interface ResponseTemplate {
  keywords: string[]
  responses: string[]
  category: 'emotion' | 'wisdom' | 'guidance' | 'blessing' | 'general'
}

interface ChatContext {
  previousMessages: string[]
  currentEmotion: 'happy' | 'sad' | 'confused' | 'angry' | 'peaceful' | 'neutral'
  topics: string[]
}

// 神仙角色配置
const DEITY_PERSONALITIES: Record<string, DeityPersonality> = {
  guanyin: {
    id: 'guanyin',
    name: '观音菩萨',
    traits: ['慈悲', '包容', '温柔', '智慧'],
    specialties: ['情感疗愈', '人际关系', '内心平静'],
    greeting: '阿弥陀佛，善信有何心事需要倾诉？观音在此聆听。',
    mood: '慈悲',
    responseStyle: 'compassionate'
  },
  budongzun: {
    id: 'budongzun',
    name: '不动尊菩萨',
    traits: ['坚定', '勇敢', '果断', '护法'],
    specialties: ['克服困难', '意志力', '突破障碍'],
    greeting: '不动如山，勇往直前！有何困难需要破除？',
    mood: '坚定',
    responseStyle: 'firm'
  },
  dashizhi: {
    id: 'dashizhi',
    name: '大势至菩萨',
    traits: ['智慧', '光明', '理性', '开悟'],
    specialties: ['智慧开启', '学业事业', '人生规划'],
    greeting: '智慧之光照耀前程，有何问题需要指点？',
    mood: '智慧',
    responseStyle: 'wise'
  },
  wenshu: {
    id: 'wenshu',
    name: '文殊菩萨',
    traits: ['博学', '文雅', '启发', '创新'],
    specialties: ['学问精进', '思维开发', '文化修养'],
    greeting: '文殊智慧如海深，有何学问需要探讨？',
    mood: '博学',
    responseStyle: 'scholarly'
  },
  xukong: {
    id: 'xukong',
    name: '虚空藏菩萨',
    traits: ['包容', '神秘', '富足', '成就'],
    specialties: ['财富智慧', '心愿成就', '福德修行'],
    greeting: '虚空藏纳万物，今日有何心愿需要成就？',
    mood: '神秘',
    responseStyle: 'mystical'
  },
  amitabha: {
    id: 'amitabha',
    name: '阿弥陀佛',
    traits: ['慈悲', '安详', '接引', '净化'],
    specialties: ['内心平静', '放下执着', '心灵安慰'],
    greeting: '南无阿弥陀佛，慈悲无量。有何烦恼需要化解？',
    mood: '慈悲',
    responseStyle: 'gentle'
  }
}

// 智能响应模板库
const RESPONSE_TEMPLATES: Record<string, ResponseTemplate[]> = {
  emotion: [
    {
      keywords: ['难过', '伤心', '痛苦', '失落', '沮丧', '郁闷'],
      responses: [
        '人生如四季轮回，此刻的寒冬终会过去，春天必将到来。',
        '痛苦如云雾，看似厚重，实则无根。静心观照，它自会散去。',
        '泪水洗净心灵的尘垢，每一滴都是成长的甘露。',
        '烦恼如浮云遮月，月亮从未消失，只是暂时被遮蔽。'
      ],
      category: 'emotion'
    },
    {
      keywords: ['开心', '快乐', '高兴', '兴奋', '喜悦'],
      responses: [
        '快乐如花开，美好而珍贵。愿你常保这份纯真喜悦。',
        '喜悦是心灵的阳光，照亮自己也温暖他人。',
        '真正的快乐来自内心的宁静，而非外在的得失。',
        '分享快乐能让它倍增，愿你的喜悦感染更多人。'
      ],
      category: 'emotion'
    },
    {
      keywords: ['焦虑', '担心', '害怕', '恐惧', '紧张'],
      responses: [
        '恐惧如影子，你越逃避它越紧跟。勇敢面对，它便消散。',
        '担忧明日，失去今日。活在当下，心自安宁。',
        '心如止水，波澜不惊。深呼吸，让内心回归平静。',
        '未来虽不可知，但你有智慧和勇气去面对一切。'
      ],
      category: 'emotion'
    }
  ],
  wisdom: [
    {
      keywords: ['人生', '意义', '目标', '方向', '迷茫'],
      responses: [
        '人生如河流，有急流也有缓滩，关键是保持前行的勇气。',
        '真正的方向不在远方，而在当下每一步的用心与坚持。',
        '生命的意义不在于长度，而在于深度和宽度。',
        '迷茫是成长的必经之路，它让我们学会思考和选择。'
      ],
      category: 'wisdom'
    },
    {
      keywords: ['成功', '失败', '挫折', '困难', '挑战'],
      responses: [
        '成功与失败如太极两仪，相互转化，关键在于保持平衡。',
        '挫折是人生的老师，它教给我们课本上学不到的智慧。',
        '困难如砺石，能让钝刀变锋利，让弱者变强者。',
        '真正的成功不是没有失败，而是在失败中不断成长。'
      ],
      category: 'wisdom'
    }
  ],
  guidance: [
    {
      keywords: ['工作', '事业', '职业', '升职', '创业'],
      responses: [
        '事业如种树，需要耐心浇灌，时机成熟自然开花结果。',
        '真正的成就来自于对工作的热爱，而非仅仅为了金钱。',
        '在职场中保持初心，以诚待人，以勤治事。',
        '机会总是青睐有准备的人，持续学习是最好的投资。'
      ],
      category: 'guidance'
    },
    {
      keywords: ['感情', '爱情', '关系', '婚姻', '家庭'],
      responses: [
        '真爱如甘露，滋润心田；假爱如露水，朝起夕散。',
        '相爱容易相处难，包容理解是长久之道。',
        '家和万事兴，温暖的家庭是人生最大的财富。',
        '爱是给予而非索取，懂得付出的人才能收获真情。'
      ],
      category: 'guidance'
    },
    {
      keywords: ['学习', '考试', '知识', '智慧', '进步'],
      responses: [
        '学而时习之，不亦说乎。知识的积累需要持续的努力。',
        '智慧如明灯，照亮前行的道路。勤奋学习，必有所获。',
        '书山有路勤为径，学海无涯苦作舟。坚持就是胜利。',
        '真正的智慧不仅是知识的积累，更是品格的修养。'
      ],
      category: 'guidance'
    }
  ],
  blessing: [
    {
      keywords: ['祝福', '保佑', '平安', '健康', '顺利'],
      responses: [
        '愿你身心安康，诸事顺遂，福慧双增。',
        '祝愿你如意吉祥，心想事成，法喜充满。',
        '愿佛光普照，护佑你平安喜乐，智慧增长。',
        '祝福你六时吉祥，四季平安，生活美满。'
      ],
      category: 'blessing'
    }
  ]
}

// 通用回复模板
const GENERAL_RESPONSES = [
  '善信所言甚有道理，这确实需要深思。',
  '人生路上多磨砺，保持内心的平静最为重要。',
  '每个人的经历都是独特的，相信你能找到属于自己的答案。',
  '静心思考，答案往往就在心中。',
  '缘起缘灭，一切都有其因果。顺其自然，尽人事听天命。',
  '修行在日常，智慧在生活。愿你在平凡中发现不凡。'
]

// 情感分析
function analyzeEmotion(message: string): ChatContext['currentEmotion'] {
  const emotionKeywords = {
    sad: ['难过', '伤心', '痛苦', '失落', '沮丧', '郁闷', '绝望'],
    happy: ['开心', '快乐', '高兴', '兴奋', '喜悦', '满足'],
    confused: ['迷茫', '困惑', '不知道', '怎么办', '不明白'],
    angry: ['生气', '愤怒', '气愤', '不爽', '讨厌'],
    peaceful: ['平静', '安详', '宁静', '放松', '舒适']
  }

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return emotion as ChatContext['currentEmotion']
    }
  }
  
  return 'neutral'
}

// 关键词提取
function extractKeywords(message: string): string[] {
  const keywords: string[] = []
  
  // 简单的关键词提取逻辑
  const commonWords = ['的', '了', '在', '是', '我', '你', '他', '她', '它', '和', '与', '或', '但', '可是', '然而']
  const words = message.replace(/[，。！？；：""''（）【】]/g, ' ').split(/\s+/)
  
  words.forEach(word => {
    if (word.length > 1 && !commonWords.includes(word)) {
      keywords.push(word)
    }
  })
  
  return keywords
}

// 找到最匹配的响应模板
function findBestResponse(message: string, deityId: string, context: ChatContext): string {
  const deity = DEITY_PERSONALITIES[deityId]
  const keywords = extractKeywords(message)
  const emotion = analyzeEmotion(message)
  
  // 更新上下文
  context.currentEmotion = emotion
  context.topics.push(...keywords)
  
  let bestMatch: { response: string; score: number } = { response: '', score: 0 }
  
  // 遍历所有响应模板
  Object.values(RESPONSE_TEMPLATES).flat().forEach(template => {
    let score = 0
    
    // 关键词匹配评分
    template.keywords.forEach(keyword => {
      if (message.includes(keyword)) {
        score += 10
      }
      if (keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
        score += 5
      }
    })
    
    // 情感匹配评分
    if (template.category === 'emotion' && emotion !== 'neutral') {
      score += 5
    }
    
    // 专业领域匹配评分
    if (deity.specialties.some(specialty => 
      template.keywords.some(keyword => specialty.includes(keyword))
    )) {
      score += 8
    }
    
    if (score > bestMatch.score) {
      const responses = template.responses
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      bestMatch = { response: randomResponse, score }
    }
  })
  
  // 如果没有好的匹配，使用通用回复
  if (bestMatch.score < 5) {
    bestMatch.response = GENERAL_RESPONSES[Math.floor(Math.random() * GENERAL_RESPONSES.length)]
  }
  
  // 根据神仙的风格调整回复
  return personalizeResponse(bestMatch.response, deity)
}

// 个性化回复
function personalizeResponse(response: string, deity: DeityPersonality): string {
  const prefixes = {
    compassionate: ['慈悲为怀，', '善信，', '阿弥陀佛，'],
    firm: ['', '当断则断，', '勇者，'],
    wise: ['智者，', '从智慧观之，', ''],
    mystical: ['虚空之中，', '因缘际会，', '神秘莫测，'],
    scholarly: ['古语云，', '据经典所载，', '博学之士，'],
    gentle: ['善信，', '慈悲为怀，', '安详地说，']
  }
  
  const suffixes = {
    compassionate: ['愿你心安。', '南无观世音菩萨。', '慈悲与你同在。'],
    firm: ['勇往直前！', '无所畏惧！', '坚定前行！'],
    wise: ['智慧指引方向。', '明心见性。', '觉悟在即。'],
    mystical: ['缘起缘灭。', '妙不可言。', '天机难测。'],
    scholarly: ['温故知新。', '学而有得。', '博学笃行。'],
    gentle: ['愿你安好。', '心如止水。', '法喜充满。']
  }
  
  const style = deity.responseStyle
  const prefix = prefixes[style][Math.floor(Math.random() * prefixes[style].length)]
  const suffix = suffixes[style][Math.floor(Math.random() * suffixes[style].length)]
  
  return `${prefix}${response}${suffix}`
}

// 打字效果模拟
function simulateTyping(callback: (char: string) => void, text: string, speed: number = 50): Promise<void> {
  return new Promise((resolve) => {
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        callback(text[index])
        index++
      } else {
        clearInterval(interval)
        resolve()
      }
    }, speed)
  })
}

// 免费AI引擎类
export class FreeAIEngine {
  private context: ChatContext
  
  constructor() {
    this.context = {
      previousMessages: [],
      currentEmotion: 'neutral',
      topics: []
    }
  }
  
  // 获取神仙信息
  getDeityInfo(deityId: string): DeityPersonality | null {
    return DEITY_PERSONALITIES[deityId] || null
  }
  
  // 获取所有神仙列表
  getAllDeities(): DeityPersonality[] {
    return Object.values(DEITY_PERSONALITIES)
  }
  
  // 生成AI回复
  async generateResponse(message: string, deityId: string): Promise<string> {
    // 模拟AI思考延迟
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    
    // 更新消息历史
    this.context.previousMessages.push(message)
    if (this.context.previousMessages.length > 10) {
      this.context.previousMessages = this.context.previousMessages.slice(-10)
    }
    
    // 生成回复
    const response = findBestResponse(message, deityId, this.context)
    
    return response
  }
  
  // 获取神仙问候语
  getGreeting(deityId: string): string {
    const deity = DEITY_PERSONALITIES[deityId]
    return deity ? deity.greeting : '欢迎来到神仙朋友！'
  }
  
  // 获取快速建议
  getQuickSuggestions(deityId: string): string[] {
    const deity = DEITY_PERSONALITIES[deityId]
    if (!deity) return []
    
    const suggestions = {
      guanyin: [
        '我最近心情很低落，该怎么办？',
        '人际关系让我很困扰',
        '如何保持内心的平静？',
        '请给我一些安慰的话'
      ],
      budongzun: [
        '我遇到很大的困难，想要放弃',
        '如何变得更坚强？',
        '面对挑战时该怎么办？',
        '请给我勇气和力量'
      ],
      dashizhi: [
        '我对未来很迷茫',
        '如何做出正确的决定？',
        '人生的意义是什么？',
        '请指导我的人生方向'
      ],
      wenshu: [
        '我想提高学习效率',
        '如何开发智慧？',
        '学习遇到瓶颈怎么办？',
        '请分享一些学习心得'
      ],
      xukong: [
        '我想实现心中的愿望',
        '如何获得财富智慧？',
        '什么是真正的富足？',
        '请帮我实现梦想'
      ],
      amitabha: [
        '我想要内心平静',
        '如何放下执着？',
        '生活压力太大了',
        '请给我心灵安慰'
      ]
    }
    
    return suggestions[deityId as keyof typeof suggestions] || suggestions.guanyin
  }
  
  // 重置对话上下文
  resetContext(): void {
    this.context = {
      previousMessages: [],
      currentEmotion: 'neutral',
      topics: []
    }
  }
  
  // 获取对话统计
  getStats(): { messageCount: number; topics: string[]; emotion: string } {
    return {
      messageCount: this.context.previousMessages.length,
      topics: [...new Set(this.context.topics)].slice(0, 5),
      emotion: this.context.currentEmotion
    }
  }
}

// 导出单例实例
export const freeAI = new FreeAIEngine()

// 导出类型
export type { DeityPersonality, ChatContext } 