/**
 * 用户画像和个性化学习引擎
 * 基于对话数据构建用户画像，实现个性化体验
 */

interface UserProfile {
  id: string
  basicInfo: {
    preferredName?: string
    age?: number
    gender?: 'male' | 'female' | 'other'
    location?: string
    occupation?: string
  }
  personality: {
    mbti?: string // Myers-Briggs类型
    bigFive: {
      openness: number // 开放性 0-100
      conscientiousness: number // 尽责性 0-100
      extraversion: number // 外向性 0-100
      agreeableness: number // 宜人性 0-100
      neuroticism: number // 神经质 0-100
    }
    communicationStyle: 'analytical' | 'emotional' | 'practical' | 'creative'
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  }
  interests: {
    categories: string[]
    topics: Map<string, number> // 话题->兴趣度分数
    keywords: Map<string, number> // 关键词->出现频率
  }
  behavioral: {
    chatFrequency: 'daily' | 'weekly' | 'occasional'
    sessionDuration: number // 平均会话时长(分钟)
    preferredTimeSlots: string[] // 偏好的聊天时间段
    responseSpeed: 'fast' | 'medium' | 'slow'
    messageLength: 'short' | 'medium' | 'long'
  }
  emotional: {
    dominantEmotions: string[]
    emotionalStability: number // 情绪稳定性 0-100
    stressLevels: number[] // 历史压力水平
    copingStrategies: string[]
    supportNeeds: string[]
  }
  spiritual: {
    beliefSystem?: string
    practiceLevel: 'beginner' | 'intermediate' | 'advanced'
    interests: string[]
    goals: string[]
    preferredDeities: string[]
  }
  growth: {
    goals: string[]
    challenges: string[]
    achievements: string[]
    growthAreas: string[]
    milestones: Array<{
      date: string
      description: string
      impact: number
    }>
  }
  preferences: {
    responseStyle: 'gentle' | 'direct' | 'encouraging' | 'analytical'
    topicPreferences: Map<string, number>
    avoidanceTopics: string[]
    preferredComplexity: 'simple' | 'moderate' | 'complex'
  }
  relationships: {
    deityConnections: Map<string, number> // 神仙ID->关系强度
    trustLevels: Map<string, number>
    preferredDeityTypes: string[]
    interactionHistory: Array<{
      deityId: string
      date: string
      satisfaction: number
      topics: string[]
    }>
  }
  createdAt: string
  lastUpdated: string
  version: number
}

interface LearningPattern {
  userId: string
  pattern: string
  confidence: number
  evidence: string[]
  discovered: string
  lastValidated: string
}

interface PersonalizationRule {
  id: string
  condition: string
  action: string
  priority: number
  effectiveness: number
}

// 用户画像分析引擎
export class UserProfileEngine {
  private profiles = new Map<string, UserProfile>()
  private learningPatterns = new Map<string, LearningPattern[]>()
  private personalizationRules: PersonalizationRule[] = []
  
  constructor() {
    this.loadFromStorage()
    this.initializePersonalizationRules()
  }
  
  // 创建或获取用户画像
  getUserProfile(userId: string): UserProfile {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, this.createDefaultProfile(userId))
    }
    return this.profiles.get(userId)!
  }
  
  private createDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      basicInfo: {},
      personality: {
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50
        },
        communicationStyle: 'emotional',
        learningStyle: 'visual'
      },
      interests: {
        categories: [],
        topics: new Map(),
        keywords: new Map()
      },
      behavioral: {
        chatFrequency: 'weekly',
        sessionDuration: 10,
        preferredTimeSlots: [],
        responseSpeed: 'medium',
        messageLength: 'medium'
      },
      emotional: {
        dominantEmotions: [],
        emotionalStability: 50,
        stressLevels: [],
        copingStrategies: [],
        supportNeeds: []
      },
      spiritual: {
        practiceLevel: 'beginner',
        interests: [],
        goals: [],
        preferredDeities: []
      },
      growth: {
        goals: [],
        challenges: [],
        achievements: [],
        growthAreas: [],
        milestones: []
      },
      preferences: {
        responseStyle: 'gentle',
        topicPreferences: new Map(),
        avoidanceTopics: [],
        preferredComplexity: 'moderate'
      },
      relationships: {
        deityConnections: new Map(),
        trustLevels: new Map(),
        preferredDeityTypes: [],
        interactionHistory: []
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: 1
    }
  }
  
  // 基于对话数据更新用户画像
  updateProfileFromConversation(
    userId: string, 
    messages: any[], 
    deityId: string,
    sessionMetrics: any
  ): void {
    const profile = this.getUserProfile(userId)
    
    // 分析消息内容
    this.analyzeMessagePatterns(profile, messages)
    
    // 更新行为数据
    this.updateBehavioralData(profile, sessionMetrics)
    
    // 更新情感数据
    this.updateEmotionalProfile(profile, messages)
    
    // 更新兴趣数据
    this.updateInterests(profile, messages)
    
    // 更新神仙关系
    this.updateDeityRelationship(profile, deityId, sessionMetrics)
    
    // 推断个性特征
    this.inferPersonalityTraits(profile)
    
    // 发现学习模式
    this.discoverLearningPatterns(userId, profile, messages)
    
    profile.lastUpdated = new Date().toISOString()
    this.saveToStorage()
  }
  
  private analyzeMessagePatterns(profile: UserProfile, messages: any[]): void {
    const userMessages = messages.filter(m => m.role === 'user')
    
    if (userMessages.length === 0) return
    
    // 分析消息长度
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length
    
    if (avgLength < 50) {
      profile.behavioral.messageLength = 'short'
    } else if (avgLength > 150) {
      profile.behavioral.messageLength = 'long'
    } else {
      profile.behavioral.messageLength = 'medium'
    }
    
    // 分析交流风格
    const analyticalWords = ['分析', '思考', '逻辑', '原因', '因为', '所以', '数据']
    const emotionalWords = ['感觉', '心情', '情绪', '难过', '开心', '担心', '害怕']
    const practicalWords = ['怎么办', '方法', '建议', '解决', '处理', '实际']
    const creativeWords = ['创意', '想象', '灵感', '艺术', '设计', '新颖']
    
    let analyticalScore = 0
    let emotionalScore = 0
    let practicalScore = 0
    let creativeScore = 0
    
    userMessages.forEach(message => {
      const content = message.content.toLowerCase()
      analyticalWords.forEach(word => {
        if (content.includes(word)) analyticalScore++
      })
      emotionalWords.forEach(word => {
        if (content.includes(word)) emotionalScore++
      })
      practicalWords.forEach(word => {
        if (content.includes(word)) practicalScore++
      })
      creativeWords.forEach(word => {
        if (content.includes(word)) creativeScore++
      })
    })
    
    const scores = [
      { style: 'analytical', score: analyticalScore },
      { style: 'emotional', score: emotionalScore },
      { style: 'practical', score: practicalScore },
      { style: 'creative', score: creativeScore }
    ]
    
    const dominantStyle = scores.sort((a, b) => b.score - a.score)[0]
    if (dominantStyle.score > 0) {
      profile.personality.communicationStyle = dominantStyle.style as any
    }
  }
  
  private updateBehavioralData(profile: UserProfile, sessionMetrics: any): void {
    // 更新会话时长
    if (sessionMetrics.duration) {
      const currentAvg = profile.behavioral.sessionDuration
      profile.behavioral.sessionDuration = (currentAvg + sessionMetrics.duration) / 2
    }
    
    // 更新偏好时间段
    const hour = new Date().getHours()
    let timeSlot = ''
    
    if (hour >= 6 && hour < 12) timeSlot = '早晨'
    else if (hour >= 12 && hour < 18) timeSlot = '下午'
    else if (hour >= 18 && hour < 22) timeSlot = '晚上'
    else timeSlot = '深夜'
    
    if (!profile.behavioral.preferredTimeSlots.includes(timeSlot)) {
      profile.behavioral.preferredTimeSlots.push(timeSlot)
    }
  }
  
  private updateEmotionalProfile(profile: UserProfile, messages: any[]): void {
    const userMessages = messages.filter(m => m.role === 'user' && m.emotionalTone)
    
    if (userMessages.length === 0) return
    
    // 统计主导情绪
    const emotionCounts = new Map<string, number>()
    let totalIntensity = 0
    
    userMessages.forEach(message => {
      const emotion = message.emotionalTone?.primary
      if (emotion) {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1)
        totalIntensity += message.emotionalTone.intensity || 0
      }
    })
    
    // 更新主导情绪
    const dominantEmotions = Array.from(emotionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion)
    
    profile.emotional.dominantEmotions = dominantEmotions
    
    // 计算情绪稳定性
    const avgIntensity = totalIntensity / userMessages.length
    profile.emotional.emotionalStability = Math.max(0, 100 - avgIntensity)
    
    // 记录压力水平
    const stressIndicators = ['压力', '焦虑', '紧张', '担心', '害怕', '困难']
    const stressScore = userMessages.reduce((score, message) => {
      return score + stressIndicators.filter(indicator => 
        message.content.includes(indicator)
      ).length
    }, 0)
    
    profile.emotional.stressLevels.push(stressScore)
    if (profile.emotional.stressLevels.length > 10) {
      profile.emotional.stressLevels = profile.emotional.stressLevels.slice(-10)
    }
  }
  
  private updateInterests(profile: UserProfile, messages: any[]): void {
    const userMessages = messages.filter(m => m.role === 'user')
    
    // 预定义的兴趣类别
    const interestCategories = {
      '工作事业': ['工作', '事业', '职业', '升职', '创业', '项目'],
      '学习成长': ['学习', '学习', '知识', '技能', '成长', '进步'],
      '情感关系': ['感情', '爱情', '婚姻', '家庭', '朋友', '关系'],
      '健康生活': ['健康', '运动', '饮食', '睡眠', '身体', '锻炼'],
      '精神修养': ['修行', '冥想', '禅定', '佛法', '哲学', '智慧'],
      '兴趣爱好': ['音乐', '电影', '读书', '旅行', '游戏', '艺术']
    }
    
    // 统计兴趣话题
    Object.entries(interestCategories).forEach(([category, keywords]) => {
      let score = 0
      userMessages.forEach(message => {
        keywords.forEach(keyword => {
          if (message.content.includes(keyword)) {
            score++
          }
        })
      })
      
      if (score > 0) {
        if (!profile.interests.categories.includes(category)) {
          profile.interests.categories.push(category)
        }
        profile.interests.topics.set(category, 
          (profile.interests.topics.get(category) || 0) + score
        )
      }
    })
    
    // 提取关键词
    userMessages.forEach(message => {
      const words = message.content.match(/[\u4e00-\u9fa5]{2,}/g) || []
      words.forEach(word => {
        profile.interests.keywords.set(word,
          (profile.interests.keywords.get(word) || 0) + 1
        )
      })
    })
  }
  
  private updateDeityRelationship(profile: UserProfile, deityId: string, metrics: any): void {
    // 更新神仙连接强度
    const currentStrength = profile.relationships.deityConnections.get(deityId) || 0
    const newStrength = Math.min(100, currentStrength + (metrics.satisfaction || 5))
    profile.relationships.deityConnections.set(deityId, newStrength)
    
    // 更新信任度
    const currentTrust = profile.relationships.trustLevels.get(deityId) || 50
    const trustChange = metrics.helpfulness ? 2 : metrics.satisfaction > 7 ? 1 : 0
    profile.relationships.trustLevels.set(deityId, 
      Math.min(100, currentTrust + trustChange)
    )
    
    // 记录交互历史
    profile.relationships.interactionHistory.push({
      deityId,
      date: new Date().toISOString(),
      satisfaction: metrics.satisfaction || 5,
      topics: metrics.topics || []
    })
    
    // 保持历史记录在合理范围内
    if (profile.relationships.interactionHistory.length > 50) {
      profile.relationships.interactionHistory = 
        profile.relationships.interactionHistory.slice(-50)
    }
  }
  
  private inferPersonalityTraits(profile: UserProfile): void {
    const messages = profile.relationships.interactionHistory
    if (messages.length < 5) return // 需要足够数据
    
    // 基于行为模式推断五大人格特征
    
    // 开放性：基于创意词汇和多样性话题
    const creativityScore = profile.interests.categories.length * 10 + 
      (profile.interests.keywords.has('创新') ? 20 : 0)
    profile.personality.bigFive.openness = Math.min(100, creativityScore)
    
    // 尽责性：基于目标词汇和计划性
    const goalWords = ['目标', '计划', '完成', '达成', '实现']
    let conscientiousnessScore = 50
    profile.interests.keywords.forEach((count, word) => {
      if (goalWords.includes(word)) {
        conscientiousnessScore += count * 5
      }
    })
    profile.personality.bigFive.conscientiousness = Math.min(100, conscientiousnessScore)
    
    // 外向性：基于社交词汇和交流频率
    const socialWords = ['朋友', '聊天', '分享', '交流', '合作']
    let extraversionScore = profile.behavioral.chatFrequency === 'daily' ? 70 : 
                           profile.behavioral.chatFrequency === 'weekly' ? 50 : 30
    profile.interests.keywords.forEach((count, word) => {
      if (socialWords.includes(word)) {
        extraversionScore += count * 3
      }
    })
    profile.personality.bigFive.extraversion = Math.min(100, extraversionScore)
    
    // 宜人性：基于同情词汇和合作性
    const agreeableWords = ['帮助', '理解', '支持', '关心', '感谢']
    let agreeablenessScore = 50
    profile.interests.keywords.forEach((count, word) => {
      if (agreeableWords.includes(word)) {
        agreeablenessScore += count * 4
      }
    })
    profile.personality.bigFive.agreeableness = Math.min(100, agreeablenessScore)
    
    // 神经质：基于情绪稳定性
    profile.personality.bigFive.neuroticism = 
      Math.max(0, 100 - profile.emotional.emotionalStability)
  }
  
  private discoverLearningPatterns(userId: string, profile: UserProfile, messages: any[]): void {
    const patterns: LearningPattern[] = []
    
    // 模式1：偏好的学习时间
    const timePattern = profile.behavioral.preferredTimeSlots[0]
    if (timePattern) {
      patterns.push({
        userId,
        pattern: `prefers_${timePattern}_learning`,
        confidence: 0.8,
        evidence: [`经常在${timePattern}进行对话`],
        discovered: new Date().toISOString(),
        lastValidated: new Date().toISOString()
      })
    }
    
    // 模式2：学习深度偏好
    const complexityPreference = profile.behavioral.messageLength === 'long' ? 'deep' : 'surface'
    patterns.push({
      userId,
      pattern: `${complexityPreference}_learning_style`,
      confidence: 0.7,
      evidence: [`消息长度通常为${profile.behavioral.messageLength}`],
      discovered: new Date().toISOString(),
      lastValidated: new Date().toISOString()
    })
    
    // 模式3：情感支持需求
    if (profile.emotional.dominantEmotions.includes('sadness')) {
      patterns.push({
        userId,
        pattern: 'needs_emotional_support',
        confidence: 0.9,
        evidence: ['经常表达负面情绪', '寻求安慰和支持'],
        discovered: new Date().toISOString(),
        lastValidated: new Date().toISOString()
      })
    }
    
    this.learningPatterns.set(userId, patterns)
  }
  
  // 基于用户画像生成个性化建议
  generatePersonalizedSuggestions(userId: string, deityId: string, context?: string): string[] {
    const profile = this.getUserProfile(userId)
    const suggestions: string[] = []
    
    // 基于兴趣话题生成建议
    const topInterests = Array.from(profile.interests.topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    topInterests.forEach(([topic, score]) => {
      if (topic === '工作事业') {
        suggestions.push('最近工作上有什么新的挑战吗？')
        suggestions.push('想聊聊职业发展的规划吗？')
      } else if (topic === '情感关系') {
        suggestions.push('人际关系方面有什么想分享的吗？')
        suggestions.push('家人朋友都还好吗？')
      } else if (topic === '学习成长') {
        suggestions.push('最近在学习什么新东西？')
        suggestions.push('有什么想要提升的技能吗？')
      }
    })
    
    // 基于情感状态生成建议
    if (profile.emotional.dominantEmotions.includes('sadness')) {
      suggestions.push('今天心情怎么样？')
      suggestions.push('有什么让你烦心的事吗？')
    } else if (profile.emotional.dominantEmotions.includes('joy')) {
      suggestions.push('分享一些最近的好事吧！')
      suggestions.push('什么事情让你感到开心？')
    }
    
    // 基于神仙关系生成建议
    const strongestConnection = Array.from(profile.relationships.deityConnections.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    if (strongestConnection && strongestConnection[0] === deityId) {
      suggestions.push('我们聊了这么久，感觉怎么样？')
      suggestions.push('有什么特别想要探讨的话题吗？')
    }
    
    // 基于个性特征生成建议
    if (profile.personality.bigFive.openness > 70) {
      suggestions.push('最近有什么新的想法或创意吗？')
      suggestions.push('想尝试一些不同的话题吗？')
    }
    
    if (profile.personality.bigFive.conscientiousness > 70) {
      suggestions.push('最近的目标进展如何？')
      suggestions.push('有什么计划需要讨论吗？')
    }
    
    return suggestions.slice(0, 6) // 返回最多6个建议
  }
  
  // 获取用户的个性化响应偏好
  getResponsePreferences(userId: string): {
    style: string
    complexity: string
    length: string
    emotionalTone: string
  } {
    const profile = this.getUserProfile(userId)
    
    return {
      style: profile.preferences.responseStyle,
      complexity: profile.preferences.preferredComplexity,
      length: profile.behavioral.messageLength === 'long' ? 'detailed' : 
              profile.behavioral.messageLength === 'short' ? 'concise' : 'moderate',
      emotionalTone: profile.emotional.dominantEmotions.includes('sadness') ? 'supportive' :
                     profile.emotional.dominantEmotions.includes('joy') ? 'celebratory' : 'balanced'
    }
  }
  
  // 推荐最适合的神仙
  recommendBestDeity(userId: string): { deityId: string; reason: string; confidence: number }[] {
    const profile = this.getUserProfile(userId)
    const recommendations: Array<{ deityId: string; reason: string; confidence: number }> = []
    
    // 基于历史关系推荐
    const deityConnections = Array.from(profile.relationships.deityConnections.entries())
      .sort((a, b) => b[1] - a[1])
    
    if (deityConnections.length > 0) {
      recommendations.push({
        deityId: deityConnections[0][0],
        reason: `你们已经建立了深厚的连接(${deityConnections[0][1]}%)`,
        confidence: 0.9
      })
    }
    
    // 基于情感需求推荐
    if (profile.emotional.dominantEmotions.includes('sadness')) {
      recommendations.push({
        deityId: 'guanyin',
        reason: '观音菩萨擅长情感疗愈和心灵安慰',
        confidence: 0.8
      })
    }
    
    if (profile.emotional.dominantEmotions.includes('fear')) {
      recommendations.push({
        deityId: 'budongzun',
        reason: '不动尊菩萨能给你勇气和力量',
        confidence: 0.8
      })
    }
    
    // 基于兴趣推荐
    const topInterest = Array.from(profile.interests.topics.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    if (topInterest) {
      if (topInterest[0] === '学习成长') {
        recommendations.push({
          deityId: 'wenshu',
          reason: '文殊菩萨是智慧和学习的守护者',
          confidence: 0.7
        })
      } else if (topInterest[0] === '工作事业') {
        recommendations.push({
          deityId: 'xukong',
          reason: '虚空藏菩萨能帮助实现事业愿望',
          confidence: 0.7
        })
      }
    }
    
    return recommendations.slice(0, 3)
  }
  
  private initializePersonalizationRules(): void {
    this.personalizationRules = [
      {
        id: 'emotional_support_sad',
        condition: 'user.emotion.primary === "sadness"',
        action: 'increase_empathy_level',
        priority: 9,
        effectiveness: 0.85
      },
      {
        id: 'analytical_user_detailed',
        condition: 'user.communicationStyle === "analytical"',
        action: 'provide_detailed_analysis',
        priority: 7,
        effectiveness: 0.80
      },
      {
        id: 'high_openness_creative',
        condition: 'user.personality.openness > 70',
        action: 'suggest_creative_topics',
        priority: 6,
        effectiveness: 0.75
      }
    ]
  }
  
  private saveToStorage(): void {
    try {
      const profilesData = Array.from(this.profiles.entries()).map(([id, profile]) => [
        id,
        {
          ...profile,
          interests: {
            ...profile.interests,
            topics: Array.from(profile.interests.topics.entries()),
            keywords: Array.from(profile.interests.keywords.entries())
          },
          relationships: {
            ...profile.relationships,
            deityConnections: Array.from(profile.relationships.deityConnections.entries()),
            trustLevels: Array.from(profile.relationships.trustLevels.entries()),
            preferredDeityTypes: profile.relationships.preferredDeityTypes,
            interactionHistory: profile.relationships.interactionHistory
          },
          preferences: {
            ...profile.preferences,
            topicPreferences: Array.from(profile.preferences.topicPreferences.entries())
          }
        }
      ])
      
      localStorage.setItem('userProfiles', JSON.stringify(profilesData))
      localStorage.setItem('learningPatterns', JSON.stringify(Array.from(this.learningPatterns.entries())))
    } catch (error) {
      console.warn('Failed to save user profiles to storage:', error)
    }
  }
  
  private loadFromStorage(): void {
    try {
      const profilesData = localStorage.getItem('userProfiles')
      if (profilesData) {
        const parsed = JSON.parse(profilesData)
        parsed.forEach(([id, profileData]: [string, any]) => {
          const profile = {
            ...profileData,
            interests: {
              ...profileData.interests,
              topics: new Map(profileData.interests.topics || []),
              keywords: new Map(profileData.interests.keywords || [])
            },
            relationships: {
              ...profileData.relationships,
              deityConnections: new Map(profileData.relationships.deityConnections || []),
              trustLevels: new Map(profileData.relationships.trustLevels || [])
            },
            preferences: {
              ...profileData.preferences,
              topicPreferences: new Map(profileData.preferences.topicPreferences || [])
            }
          }
          this.profiles.set(id, profile)
        })
      }
      
      const patternsData = localStorage.getItem('learningPatterns')
      if (patternsData) {
        const parsed = JSON.parse(patternsData)
        this.learningPatterns = new Map(parsed)
      }
    } catch (error) {
      console.warn('Failed to load user profiles from storage:', error)
    }
  }
  
  // 获取用户画像概览
  getProfileSummary(userId: string) {
    const profile = this.getUserProfile(userId)
    
    return {
      personalityType: this.getPersonalityType(profile),
      dominantTraits: this.getDominantTraits(profile),
      communicationStyle: profile.personality.communicationStyle,
      topInterests: Array.from(profile.interests.topics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([topic]) => topic),
      emotionalProfile: {
        stability: profile.emotional.emotionalStability,
        dominantEmotions: profile.emotional.dominantEmotions.slice(0, 2)
      },
      preferredDeities: Array.from(profile.relationships.deityConnections.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([deityId]) => deityId),
      learningPatterns: this.learningPatterns.get(userId)?.map(p => p.pattern) || []
    }
  }
  
  private getPersonalityType(profile: UserProfile): string {
    const { bigFive } = profile.personality
    
    // 简化的MBTI推断
    const e_i = bigFive.extraversion > 50 ? 'E' : 'I'
    const s_n = bigFive.openness > 50 ? 'N' : 'S'
    const t_f = bigFive.agreeableness > 50 ? 'F' : 'T'
    const j_p = bigFive.conscientiousness > 50 ? 'J' : 'P'
    
    return `${e_i}${s_n}${t_f}${j_p}`
  }
  
  private getDominantTraits(profile: UserProfile): string[] {
    const traits: Array<{ name: string; score: number }> = [
      { name: '开放性', score: profile.personality.bigFive.openness },
      { name: '尽责性', score: profile.personality.bigFive.conscientiousness },
      { name: '外向性', score: profile.personality.bigFive.extraversion },
      { name: '宜人性', score: profile.personality.bigFive.agreeableness },
      { name: '情绪稳定性', score: 100 - profile.personality.bigFive.neuroticism }
    ]
    
    return traits
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(t => t.name)
  }
}

// 导出单例实例
export const userProfileEngine = new UserProfileEngine()

// 导出类型
export type { UserProfile, LearningPattern, PersonalizationRule }