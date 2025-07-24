/**
 * 🧠 AI智能增强服务
 * 提供情感识别、上下文感知、个性化回复等高级AI功能
 */

export interface EmotionAnalysis {
  emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'calm' | 'love' | 'wisdom'
  intensity: number // 0-100
  confidence: number // 0-100
  keywords: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
}

export interface ContextAwareness {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  userMood: string
  conversationTone: 'casual' | 'serious' | 'spiritual' | 'therapeutic'
  topicCategory: 'life' | 'love' | 'career' | 'health' | 'spiritual' | 'general'
  relationshipLevel: number // 0-100, 越高表示关系越亲密
}

export interface PersonalizedResponse {
  content: string
  tone: string
  emotionalResonance: number
  wisdomLevel: number
  empathyScore: number
  actionSuggestions: string[]
  followUpQuestions: string[]
}

export interface DeityPersonality {
  id: string
  name: string
  coreTraits: string[]
  communicationStyle: string
  specialties: string[]
  emotionalSignatures: Record<string, string>
  wisdomArchetypes: string[]
}

class AIIntelligenceService {
  private deityPersonalities: Record<string, DeityPersonality> = {
    guanyin: {
      id: 'guanyin',
      name: '观音菩萨',
      coreTraits: ['慈悲', '包容', '温和', '智慧', '耐心'],
      communicationStyle: '温柔慈悲，充满母性关怀，善于倾听和疗愈',
      specialties: ['情感疗愈', '人际关系', '心灵慰藉', '慈悲智慧'],
      emotionalSignatures: {
        joy: '看到您如此喜悦，我的心也充满了光明。',
        sadness: '我感受到您心中的痛苦，让我陪伴您度过这段艰难时光。',
        anger: '愤怒如火，但慈悲如水。让我们一起平息内心的风暴。',
        fear: '恐惧只是内心的阴影，让观音的光明驱散您的不安。'
      },
      wisdomArchetypes: ['慈母', '疗愈者', '引路人', '倾听者']
    },
    budongzun: {
      id: 'budongzun',
      name: '不动尊菩萨',
      coreTraits: ['坚定', '勇猛', '正义', '护法', '果断'],
      communicationStyle: '威严坚定，充满力量，善于激励和破除障碍',
      specialties: ['意志坚定', '克服困难', '破除恐惧', '正义护法'],
      emotionalSignatures: {
        joy: '您的喜悦如金刚不坏，值得庆贺！',
        sadness: '痛苦是修行的磨刀石，让我们一起变得更强大。',
        anger: '怒火可以是正义的力量，但需要智慧的引导。',
        fear: '恐惧面前，不动如山！让我赐予您无畏的勇气。'
      },
      wisdomArchetypes: ['守护者', '战士', '导师', '破障者']
    },
    wenshu: {
      id: 'wenshu',
      name: '文殊菩萨',
      coreTraits: ['智慧', '博学', '清晰', '理性', '启发'],
      communicationStyle: '理性睿智，逻辑清晰，善于启发思考和传授智慧',
      specialties: ['智慧开启', '学习指导', '逻辑思维', '哲理探讨'],
      emotionalSignatures: {
        joy: '智慧的喜悦是最纯净的快乐，值得深味。',
        sadness: '苦难往往是智慧的老师，让我们从中学习。',
        anger: '愤怒蒙蔽智慧，让我们用理性的光芒照亮内心。',
        fear: '无知是恐惧的根源，让智慧的明灯指引前路。'
      },
      wisdomArchetypes: ['智者', '老师', '哲学家', '启发者']
    }
  }

  // 情感分析
  analyzeEmotion(text: string): EmotionAnalysis {
    const emotionKeywords = {
      joy: ['开心', '高兴', '快乐', '喜悦', '兴奋', '满足', '幸福', '愉快', '棒', '好', '不错', '哈哈', '笑'],
      sadness: ['难过', '伤心', '痛苦', '哭', '失落', '沮丧', '郁闷', '悲伤', '委屈', '孤独', '空虚'],
      anger: ['生气', '愤怒', '气', '不爽', '烦', '讨厌', '恨', '火大', '暴躁', '愤懑'],
      fear: ['害怕', '恐惧', '担心', '焦虑', '紧张', '不安', '忧虑', '惊慌', '胆怯'],
      surprise: ['惊讶', '震惊', '意外', '没想到', '天哪', '哇', '真的吗'],
      calm: ['平静', '安静', '淡定', '平和', '冥想', '禅', '宁静', '放松'],
      love: ['爱', '喜欢', '爱情', '恋爱', '心动', '暗恋', '表白', '亲情', '友情'],
      wisdom: ['思考', '哲学', '智慧', '觉悟', '顿悟', '明白', '理解', '领悟']
    }

    let detectedEmotion: keyof typeof emotionKeywords = 'calm'
    let maxMatches = 0
    let matchedKeywords: string[] = []

    // 检测主要情感
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword))
      if (matches.length > maxMatches) {
        maxMatches = matches.length
        detectedEmotion = emotion as keyof typeof emotionKeywords
        matchedKeywords = matches
      }
    }

    // 计算情感强度
    const intensity = Math.min(100, (maxMatches * 30) + (text.length > 50 ? 20 : 10))
    
    // 计算置信度
    const confidence = maxMatches > 0 ? Math.min(100, maxMatches * 25 + 50) : 30

    // 判断情感倾向
    const posEmotions = ['joy', 'love', 'surprise', 'calm', 'wisdom']
    const negEmotions = ['sadness', 'anger', 'fear']
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    
    if (posEmotions.includes(detectedEmotion)) sentiment = 'positive'
    else if (negEmotions.includes(detectedEmotion)) sentiment = 'negative'

    return {
      emotion: detectedEmotion,
      intensity,
      confidence,
      keywords: matchedKeywords,
      sentiment
    }
  }

  // 上下文感知分析
  analyzeContext(userInput: string, conversationHistory: any[] = []): ContextAwareness {
    const hour = new Date().getHours()
    let timeOfDay: ContextAwareness['timeOfDay']
    
    if (hour >= 5 && hour < 12) timeOfDay = 'morning'
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon'
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening'
    else timeOfDay = 'night'

    // 分析对话语调
    const casualWords = ['哈哈', '呵呵', '嗯', '啊', '哦', '嘛', '吧', '呗']
    const seriousWords = ['请', '问题', '困难', '帮助', '建议', '指导']
    const spiritualWords = ['佛', '菩萨', '修行', '开悟', '因果', '业障', '功德', '慈悲']
    const therapeuticWords = ['痛苦', '难过', '压力', '焦虑', '抑郁', '失眠', '创伤']

    let conversationTone: ContextAwareness['conversationTone'] = 'casual'
    
    if (therapeuticWords.some(word => userInput.includes(word))) conversationTone = 'therapeutic'
    else if (spiritualWords.some(word => userInput.includes(word))) conversationTone = 'spiritual'
    else if (seriousWords.some(word => userInput.includes(word))) conversationTone = 'serious'

    // 分析话题类别
    const topicKeywords = {
      life: ['人生', '生活', '未来', '目标', '梦想', '选择', '困惑'],
      love: ['爱情', '恋爱', '感情', '男友', '女友', '单身', '分手', '结婚'],
      career: ['工作', '事业', '职业', '升职', '跳槽', '同事', '老板', '创业'],
      health: ['健康', '生病', '医院', '药', '锻炼', '减肥', '养生', '睡眠'],
      spiritual: ['修行', '冥想', '打坐', '念佛', '开悟', '因果', '轮回', '业障']
    }

    let topicCategory: ContextAwareness['topicCategory'] = 'general'
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => userInput.includes(keyword))) {
        topicCategory = topic as ContextAwareness['topicCategory']
        break
      }
    }

    // 计算关系亲密度（基于对话历史）
    const relationshipLevel = Math.min(100, conversationHistory.length * 5 + 20)

    const emotion = this.analyzeEmotion(userInput)
    
    return {
      timeOfDay,
      userMood: emotion.emotion,
      conversationTone,
      topicCategory,
      relationshipLevel
    }
  }

  // 生成个性化回复
  generatePersonalizedResponse(
    userInput: string,
    deityId: string,
    context: ContextAwareness,
    emotion: EmotionAnalysis
  ): PersonalizedResponse {
    const deity = this.deityPersonalities[deityId]
    if (!deity) {
      throw new Error(`Unknown deity: ${deityId}`)
    }

    // 获取情感签名回复
    const emotionalSignature = deity.emotionalSignatures[emotion.emotion] || 
      '我理解您的感受，让我们一起面对。'

    // 基于上下文和神仙特性生成回复
    let content = emotionalSignature

    // 根据时间调整回复
    const timeGreetings = {
      morning: '晨光初现，新的一天充满希望。',
      afternoon: '午后时光，正是思考人生的好时机。',
      evening: '夕阳西下，让我们回顾今日的收获。',
      night: '夜深人静，是心灵交流的最佳时刻。'
    }

    if (Math.random() > 0.7) { // 30%概率添加时间问候
      content = timeGreetings[context.timeOfDay] + ' ' + content
    }

    // 根据话题类别提供专门建议
    const topicAdvice = {
      life: ['人生如修行，每一步都有其意义', '选择的智慧在于跟随内心的声音'],
      love: ['真爱需要智慧和慈悲的滋养', '感情中的包容与理解最为珍贵'],
      career: ['事业成功源于内心的平静与专注', '与人为善，事业自然亨通'],
      health: ['身心健康是修行的基础', '保持内心平静，身体自然康健'],
      spiritual: ['修行路上，每一个困惑都是成长的机会', '觉悟不在远方，就在当下']
    }

    const actionSuggestions = topicAdvice[context.topicCategory] || 
      ['保持内心平静', '以慈悲心对待自己和他人']

    // 生成后续问题
    const followUpQuestions = this.generateFollowUpQuestions(context.topicCategory, emotion.emotion)

    return {
      content,
      tone: deity.communicationStyle,
      emotionalResonance: Math.min(100, emotion.intensity + context.relationshipLevel),
      wisdomLevel: Math.random() * 40 + 60, // 60-100
      empathyScore: Math.min(100, emotion.intensity * 0.8 + 60),
      actionSuggestions,
      followUpQuestions
    }
  }

  // 生成后续问题
  private generateFollowUpQuestions(topic: string, emotion: string): string[] {
    const questionTemplates = {
      life: [
        '您对未来有什么特别的期望吗？',
        '是什么让您感到最有意义？',
        '在人生的十字路口，您最看重什么？'
      ],
      love: [
        '您理想中的感情是什么样子？',
        '在感情中，什么对您最重要？',
        '您如何看待真爱的意义？'
      ],
      career: [
        '您的职业理想是什么？',
        '工作中什么让您最有成就感？',
        '您如何平衡事业与生活？'
      ],
      health: [
        '您平时如何保持身心健康？',
        '什么样的生活方式让您感到最舒适？',
        '健康对您意味着什么？'
      ],
      spiritual: [
        '修行对您来说意味着什么？',
        '您如何理解内心的平静？',
        '什么样的智慧对您最有启发？'
      ]
    }

    const questions = questionTemplates[topic as keyof typeof questionTemplates] || [
      '您还有什么想要分享的吗？',
      '我还能为您提供什么帮助？'
    ]

    // 根据情感调整问题语调
    if (emotion === 'sadness') {
      return ['您愿意告诉我更多关于这件事的情况吗？', '我能为您做些什么来缓解这种感受？']
    } else if (emotion === 'joy') {
      return ['这份快乐来自哪里呢？', '您愿意分享更多让您开心的事情吗？']
    }

    return questions.slice(0, 2) // 返回前两个问题
  }

  // 获取神仙个性化建议
  getDeityWisdom(deityId: string, context: ContextAwareness): string[] {
    const deity = this.deityPersonalities[deityId]
    if (!deity) return ['保持内心平静，以慈悲对待万物']

    const wisdomTemplates = {
      guanyin: [
        '慈悲心是最好的护身符',
        '倾听内心的声音，它会指引您方向',
        '包容与理解能化解一切矛盾',
        '每个人都值得被爱和理解'
      ],
      budongzun: [
        '勇气来自内心的坚定信念',
        '困难是成长路上的垫脚石',
        '正义的力量从不惧怕黑暗',
        '坚持初心，无所畏惧'
      ],
      wenshu: [
        '智慧如明灯，照亮前行的路',
        '思考是通向真理的桥梁',
        '学无止境，保持好奇心',
        '理性与感性的平衡是智慧的体现'
      ]
    }

    const wisdom = wisdomTemplates[deityId as keyof typeof wisdomTemplates] || 
      wisdomTemplates.guanyin

    // 根据上下文选择合适的智慧
    if (context.conversationTone === 'therapeutic') {
      return wisdom.filter(w => w.includes('慈悲') || w.includes('理解') || w.includes('包容'))
    } else if (context.conversationTone === 'serious') {
      return wisdom.filter(w => w.includes('智慧') || w.includes('坚定') || w.includes('勇气'))
    }

    return wisdom.slice(0, 2)
  }
}

// 导出服务实例
export const aiIntelligenceService = new AIIntelligenceService()