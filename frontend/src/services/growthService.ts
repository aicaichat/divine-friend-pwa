// 共同成长服务层

import {
  GrowthProfile,
  GrowthMetric,
  GrowthDataPoint,
  Milestone,
  Achievement,
  GrowthInsight,
  GrowthSession,
  GrowthGoal,
  GrowthAnalysis,
  GrowthArea,
  CompanionState,
  PersonalizedRecommendation
} from '../types/growth'

export class GrowthTrackingService {
  private static STORAGE_PREFIX = 'divine-friend-growth'

  /**
   * 获取用户成长档案
   */
  static getGrowthProfile(userId: string = 'default'): GrowthProfile {
    const key = `${this.STORAGE_PREFIX}-profile-${userId}`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const profile = JSON.parse(stored)
        return {
          ...profile,
          startDate: new Date(profile.startDate),
          lastActiveDate: new Date(profile.lastActiveDate)
        }
      } catch (error) {
        console.error('解析成长档案失败:', error)
      }
    }

    // 创建新的成长档案
    const newProfile: GrowthProfile = {
      userId,
      startDate: new Date(),
      currentLevel: 1,
      totalExperience: 0,
      companionshipDays: 1,
      lastActiveDate: new Date(),
      preferences: {
        focusAreas: ['spiritual', 'wisdom', 'mindfulness'],
        reminderTime: '09:00',
        privacyLevel: 'private',
        goalUpdateFrequency: 'weekly'
      }
    }

    this.saveGrowthProfile(newProfile)
    return newProfile
  }

  /**
   * 保存成长档案
   */
  static saveGrowthProfile(profile: GrowthProfile): void {
    const key = `${this.STORAGE_PREFIX}-profile-${profile.userId}`
    localStorage.setItem(key, JSON.stringify(profile))
  }

  /**
   * 记录成长会话
   */
  static recordGrowthSession(session: Omit<GrowthSession, 'id'>): GrowthSession {
    const newSession: GrowthSession = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    // 保存会话记录
    this.saveGrowthSession(newSession)

    // 更新相关指标
    this.updateMetricsFromSession(newSession)

    // 更新成长档案
    this.updateProfileFromSession(newSession)

    return newSession
  }

  /**
   * 获取成长指标
   */
  static getGrowthMetrics(userId: string = 'default'): GrowthMetric[] {
    const key = `${this.STORAGE_PREFIX}-metrics-${userId}`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const metrics = JSON.parse(stored)
        return metrics.map((metric: any) => ({
          ...metric,
          historicalData: metric.historicalData.map((point: any) => ({
            ...point,
            date: new Date(point.date)
          }))
        }))
      } catch (error) {
        console.error('解析成长指标失败:', error)
      }
    }

    // 初始化默认指标
    return this.initializeDefaultMetrics(userId)
  }

  /**
   * 获取里程碑列表
   */
  static getMilestones(userId: string = 'default'): Milestone[] {
    const key = `${this.STORAGE_PREFIX}-milestones-${userId}`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const milestones = JSON.parse(stored)
        return milestones.map((milestone: any) => ({
          ...milestone,
          unlockedAt: milestone.unlockedAt ? new Date(milestone.unlockedAt) : undefined
        }))
      } catch (error) {
        console.error('解析里程碑失败:', error)
      }
    }

    return this.initializeDefaultMilestones(userId)
  }

  /**
   * 解锁里程碑
   */
  static unlockMilestone(milestoneId: string, userId: string = 'default'): Achievement | null {
    const milestones = this.getMilestones(userId)
    const milestone = milestones.find(m => m.id === milestoneId)
    
    if (!milestone || milestone.isCompleted) return null

    // 检查是否满足解锁条件
    const canUnlock = this.checkMilestoneRequirements(milestone, userId)
    if (!canUnlock) return null

    // 解锁里程碑
    milestone.isCompleted = true
    milestone.unlockedAt = new Date()
    
    // 保存更新
    this.saveMilestones(milestones, userId)

    // 创建成就
    const achievement: Achievement = {
      id: `achievement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: milestone.title,
      description: milestone.description,
      earnedAt: new Date(),
      category: milestone.category,
      rarity: this.getMilestoneRarity(milestone.difficulty),
      shareCount: 0,
      relatedMilestone: milestoneId
    }

    this.saveAchievement(achievement, userId)

    // 更新经验值
    const profile = this.getGrowthProfile(userId)
    profile.totalExperience += this.getExperienceForMilestone(milestone.difficulty)
    profile.currentLevel = this.calculateLevel(profile.totalExperience)
    this.saveGrowthProfile(profile)

    return achievement
  }

  /**
   * 生成成长洞察
   */
  static generateGrowthInsights(userId: string = 'default'): GrowthInsight[] {
    const profile = this.getGrowthProfile(userId)
    const metrics = this.getGrowthMetrics(userId)
    const sessions = this.getRecentSessions(userId, 30) // 最近30天
    
    const insights: GrowthInsight[] = []

    // 分析成长趋势
    const trendInsight = this.analyzeTrends(metrics, sessions)
    if (trendInsight) insights.push(trendInsight)

    // 分析活跃度
    const activityInsight = this.analyzeActivity(sessions, profile)
    if (activityInsight) insights.push(activityInsight)

    // 分析平衡性
    const balanceInsight = this.analyzeBalance(metrics)
    if (balanceInsight) insights.push(balanceInsight)

    // 预测性建议
    const predictions = this.generatePredictions(profile, metrics, sessions)
    insights.push(...predictions)

    return insights.sort((a, b) => b.priority.localeCompare(a.priority))
  }

  /**
   * 生成个性化推荐
   */
  static generatePersonalizedRecommendations(userId: string = 'default'): PersonalizedRecommendation[] {
    const profile = this.getGrowthProfile(userId)
    const metrics = this.getGrowthMetrics(userId)
    const companion = this.getCompanionState(userId)
    
    const recommendations: PersonalizedRecommendation[] = []

    // 基于薄弱环节的推荐
    const weakAreas = this.identifyWeakAreas(metrics)
    for (const area of weakAreas) {
      const rec = this.createAreaImprovementRecommendation(area, profile, companion)
      if (rec) recommendations.push(rec)
    }

    // 基于兴趣的推荐
    for (const area of profile.preferences.focusAreas) {
      const rec = this.createInterestBasedRecommendation(area, profile, metrics)
      if (rec) recommendations.push(rec)
    }

    // 基于时间的推荐
    const timeRec = this.createTimeBasedRecommendation(profile, metrics)
    if (timeRec) recommendations.push(timeRec)

    return recommendations.slice(0, 5) // 返回前5个推荐
  }

  /**
   * 私有方法：保存成长会话
   */
  private static saveGrowthSession(session: GrowthSession): void {
    const key = `${this.STORAGE_PREFIX}-sessions-${session.startTime.toDateString()}`
    const stored = localStorage.getItem(key)
    
    let sessions: GrowthSession[] = []
    if (stored) {
      try {
        sessions = JSON.parse(stored)
      } catch (error) {
        console.error('解析会话记录失败:', error)
      }
    }

    sessions.push(session)
    localStorage.setItem(key, JSON.stringify(sessions))
  }

  /**
   * 私有方法：从会话更新指标
   */
  private static updateMetricsFromSession(session: GrowthSession): void {
    const metrics = this.getGrowthMetrics()
    
    // 根据会话类型和焦点区域更新相应指标
    const relevantMetrics = metrics.filter(m => m.area === session.focusArea)
    
    for (const metric of relevantMetrics) {
      const improvement = this.calculateMetricImprovement(session, metric)
      if (improvement > 0) {
        metric.currentValue += improvement
        
        // 添加历史数据点
        metric.historicalData.push({
          date: session.startTime,
          value: metric.currentValue,
          context: `${session.type}会话`,
          mood: session.mood.after
        })
        
        // 保持历史数据在合理范围内
        if (metric.historicalData.length > 100) {
          metric.historicalData = metric.historicalData.slice(-100)
        }
      }
    }

    this.saveGrowthMetrics(metrics)
  }

  /**
   * 私有方法：初始化默认指标
   */
  private static initializeDefaultMetrics(userId: string): GrowthMetric[] {
    const defaultMetrics: GrowthMetric[] = [
      {
        id: 'spiritual-practice',
        area: 'spiritual',
        name: '精神修行指数',
        description: '通过冥想、诵经等精神修行活动提升的指标',
        unit: '分',
        currentValue: 0,
        targetValue: 100,
        historicalData: [],
        trend: 'stable',
        importance: 5
      },
      {
        id: 'wisdom-understanding',
        area: 'wisdom',
        name: '智慧理解度',
        description: '对人生哲理和智慧教诲的理解程度',
        unit: '分',
        currentValue: 0,
        targetValue: 100,
        historicalData: [],
        trend: 'stable',
        importance: 4
      },
      {
        id: 'compassion-level',
        area: 'compassion',
        name: '慈悲心指数',
        description: '对他人和众生的慈悲关怀程度',
        unit: '分',
        currentValue: 0,
        targetValue: 100,
        historicalData: [],
        trend: 'stable',
        importance: 5
      },
      {
        id: 'mindfulness-awareness',
        area: 'mindfulness',
        name: '正念觉察力',
        description: '当下觉察和专注能力',
        unit: '分',
        currentValue: 0,
        targetValue: 100,
        historicalData: [],
        trend: 'stable',
        importance: 4
      }
    ]

    this.saveGrowthMetrics(defaultMetrics, userId)
    return defaultMetrics
  }

  /**
   * 私有方法：初始化默认里程碑
   */
  private static initializeDefaultMilestones(userId: string): Milestone[] {
    const defaultMilestones: Milestone[] = [
      {
        id: 'first-week',
        title: '相伴七日',
        description: '与神仙朋友相伴的第一周，建立了初步的信任和默契',
        category: 'spiritual',
        requirements: [
          {
            type: 'days_active',
            description: '连续活跃7天',
            target: 7,
            current: 0
          }
        ],
        rewards: [
          {
            type: 'title',
            name: '初心修行者',
            description: '踏上修行之路的第一步'
          },
          {
            type: 'deity_message',
            name: '观音菩萨的祝福',
            description: '收到来自观音菩萨的特别祝福消息'
          }
        ],
        isCompleted: false,
        difficulty: 'beginner',
        estimatedDays: 7,
        icon: '🌱',
        backgroundStory: '每一段伟大的修行之路，都始于这样的七个日夜...'
      },
      {
        id: 'meditation-master',
        title: '冥想小成',
        description: '通过持续的冥想修行，内心获得了宁静与智慧',
        category: 'mindfulness',
        requirements: [
          {
            type: 'total_sessions',
            description: '完成30次冥想会话',
            target: 30,
            current: 0
          },
          {
            type: 'metric_value',
            description: '正念觉察力达到60分',
            target: 60,
            current: 0,
            metricId: 'mindfulness-awareness'
          }
        ],
        rewards: [
          {
            type: 'badge',
            name: '静心禅师',
            description: '冥想修行的成就徽章',
            icon: '🧘'
          },
          {
            type: 'unlock_feature',
            name: '高级冥想指导',
            description: '解锁更深层次的冥想练习'
          }
        ],
        isCompleted: false,
        difficulty: 'intermediate',
        estimatedDays: 30,
        icon: '🧘‍♂️',
        backgroundStory: '当心如止水，智慧之花便会在寂静中绽放...'
      },
      {
        id: 'compassion-awakening',
        title: '慈悲觉醒',
        description: '慈悲心的觉醒，对众生生起真正的关怀和爱护',
        category: 'compassion',
        requirements: [
          {
            type: 'metric_value',
            description: '慈悲心指数达到80分',
            target: 80,
            current: 0,
            metricId: 'compassion-level'
          },
          {
            type: 'specific_action',
            description: '完成10次帮助他人的善行',
            target: 10,
            current: 0
          }
        ],
        rewards: [
          {
            type: 'title',
            name: '慈悲行者',
            description: '慈悲心觉醒的修行者'
          },
          {
            type: 'special_content',
            name: '慈悲冥想法门',
            description: '获得专属的慈悲冥想指导内容'
          }
        ],
        isCompleted: false,
        difficulty: 'advanced',
        estimatedDays: 60,
        icon: '💖',
        backgroundStory: '慈悲不是同情，而是真正理解众生皆苦，并愿意为之付出...'
      }
    ]

    this.saveMilestones(defaultMilestones, userId)
    return defaultMilestones
  }

  /**
   * 其他私有辅助方法...
   */
  private static saveGrowthMetrics(metrics: GrowthMetric[], userId: string = 'default'): void {
    const key = `${this.STORAGE_PREFIX}-metrics-${userId}`
    localStorage.setItem(key, JSON.stringify(metrics))
  }

  private static saveMilestones(milestones: Milestone[], userId: string = 'default'): void {
    const key = `${this.STORAGE_PREFIX}-milestones-${userId}`
    localStorage.setItem(key, JSON.stringify(milestones))
  }

  private static saveAchievement(achievement: Achievement, userId: string = 'default'): void {
    const key = `${this.STORAGE_PREFIX}-achievements-${userId}`
    const stored = localStorage.getItem(key)
    
    let achievements: Achievement[] = []
    if (stored) {
      try {
        achievements = JSON.parse(stored)
      } catch (error) {
        console.error('解析成就记录失败:', error)
      }
    }

    achievements.push(achievement)
    localStorage.setItem(key, JSON.stringify(achievements))
  }

  private static getCompanionState(userId: string = 'default'): CompanionState {
    // 简化实现，返回默认状态
    return {
      currentDeity: 'guanyin',
      relationshipLevel: 50,
      lastInteraction: new Date(),
      personalityTraits: ['thoughtful', 'patient'],
      preferredCommunicationStyle: 'encouraging',
      specialMemories: []
    }
  }

  private static updateProfileFromSession(session: GrowthSession): void {
    const profile = this.getGrowthProfile()
    profile.lastActiveDate = new Date()
    profile.totalExperience += Math.floor(session.duration / 10) // 每10分钟1经验
    profile.currentLevel = this.calculateLevel(profile.totalExperience)
    
    // 更新相伴天数
    const daysSinceStart = Math.floor((Date.now() - profile.startDate.getTime()) / (24 * 60 * 60 * 1000))
    profile.companionshipDays = daysSinceStart + 1
    
    this.saveGrowthProfile(profile)
  }

  private static calculateLevel(experience: number): number {
    // 简单的等级计算：每100经验升1级
    return Math.floor(experience / 100) + 1
  }

  private static checkMilestoneRequirements(milestone: Milestone, userId: string): boolean {
    // 简化实现，实际应该检查每个requirement
    return milestone.requirements.every(req => req.current >= req.target)
  }

  private static getMilestoneRarity(difficulty: Milestone['difficulty']): Achievement['rarity'] {
    const rarityMap = {
      'beginner': 'common' as const,
      'intermediate': 'rare' as const,
      'advanced': 'epic' as const,
      'master': 'legendary' as const
    }
    return rarityMap[difficulty]
  }

  private static getExperienceForMilestone(difficulty: Milestone['difficulty']): number {
    const expMap = {
      'beginner': 50,
      'intermediate': 150,
      'advanced': 300,
      'master': 500
    }
    return expMap[difficulty]
  }

  private static getRecentSessions(userId: string, days: number): GrowthSession[] {
    // 简化实现，实际应该从存储中获取最近的会话
    return []
  }

  private static calculateMetricImprovement(session: GrowthSession, metric: GrowthMetric): number {
    // 基于会话质量、时长等计算指标提升
    const baseImprovement = session.quality * (session.duration / 60) // 基础改进值
    const moodBonus = (session.mood.after - session.mood.before) * 0.5
    return Math.max(baseImprovement + moodBonus, 0)
  }

  // 其他分析方法的具体实现...
  private static analyzeTrends(metrics: GrowthMetric[], sessions: GrowthSession[]): GrowthInsight | null {
    if (metrics.length === 0) return null
    
    const increasingMetrics = metrics.filter(m => m.trend === 'increasing')
    const decreasingMetrics = metrics.filter(m => m.trend === 'decreasing')
    
    if (increasingMetrics.length > 0) {
      return {
        id: `trend-${Date.now()}`,
        type: 'trend',
        title: '成长趋势良好',
        content: `您在 ${increasingMetrics.map(m => m.name).join('、')} 方面表现出色，继续保持！`,
        supportingData: { improvingAreas: increasingMetrics.length },
        confidence: 0.8,
        actionable: true,
        priority: 'medium',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
        relatedAreas: increasingMetrics.map(m => m.area)
      }
    }
    
    if (decreasingMetrics.length > 1) {
      return {
        id: `trend-decline-${Date.now()}`,
        type: 'challenge',
        title: '需要关注的领域',
        content: `在 ${decreasingMetrics.map(m => m.name).join('、')} 方面需要更多关注和练习`,
        supportingData: { decliningAreas: decreasingMetrics.length },
        confidence: 0.9,
        actionable: true,
        priority: 'high',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        relatedAreas: decreasingMetrics.map(m => m.area)
      }
    }
    
    return null
  }

  private static analyzeActivity(sessions: GrowthSession[], profile: GrowthProfile): GrowthInsight | null {
    const daysSinceLastActive = Math.floor((Date.now() - profile.lastActiveDate.getTime()) / (24 * 60 * 60 * 1000))
    
    if (daysSinceLastActive > 3) {
      return {
        id: `activity-${Date.now()}`,
        type: 'recommendation',
        title: '该回来修行了',
        content: `您已经 ${daysSinceLastActive} 天没有活跃了，神仙朋友很想念您呢！`,
        supportingData: { daysInactive: daysSinceLastActive },
        confidence: 1.0,
        actionable: true,
        priority: 'high',
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        relatedAreas: ['spiritual', 'mindfulness']
      }
    }
    
    if (profile.companionshipDays > 30 && profile.companionshipDays % 30 === 0) {
      return {
        id: `milestone-celebration-${Date.now()}`,
        type: 'celebration',
        title: '相伴里程碑！',
        content: `恭喜！您与神仙朋友已经相伴 ${profile.companionshipDays} 天了，这是一个值得庆祝的成就！`,
        supportingData: { companionshipDays: profile.companionshipDays },
        confidence: 1.0,
        actionable: false,
        priority: 'medium',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        relatedAreas: ['spiritual']
      }
    }
    
    return null
  }

  private static analyzeBalance(metrics: GrowthMetric[]): GrowthInsight | null {
    if (metrics.length < 3) return null
    
    const averageProgress = metrics.reduce((sum, m) => sum + (m.currentValue / m.targetValue), 0) / metrics.length
    const minProgress = Math.min(...metrics.map(m => m.currentValue / m.targetValue))
    const maxProgress = Math.max(...metrics.map(m => m.currentValue / m.targetValue))
    
    if (maxProgress - minProgress > 0.3) { // 如果最高和最低相差超过30%
      const weakestMetric = metrics.find(m => (m.currentValue / m.targetValue) === minProgress)
      const strongestMetric = metrics.find(m => (m.currentValue / m.targetValue) === maxProgress)
      
      return {
        id: `balance-${Date.now()}`,
        type: 'recommendation',
        title: '平衡发展建议',
        content: `建议在 ${weakestMetric?.name} 方面投入更多精力，以平衡您在 ${strongestMetric?.name} 上的优势`,
        supportingData: { imbalanceRatio: maxProgress - minProgress },
        confidence: 0.7,
        actionable: true,
        priority: 'medium',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        relatedAreas: [weakestMetric?.area, strongestMetric?.area].filter(Boolean) as GrowthArea[]
      }
    }
    
    return null
  }

  private static generatePredictions(profile: GrowthProfile, metrics: GrowthMetric[], sessions: GrowthSession[]): GrowthInsight[] {
    const predictions: GrowthInsight[] = []
    
    // 等级提升预测
    const currentLevelExp = (profile.currentLevel - 1) * 100
    const nextLevelExp = profile.currentLevel * 100
    const expNeeded = nextLevelExp - profile.totalExperience
    
    if (expNeeded <= 50) { // 如果距离升级不远
      predictions.push({
        id: `level-prediction-${Date.now()}`,
        type: 'prediction',
        title: '即将升级！',
        content: `再获得 ${expNeeded} 经验值就可以升到 ${profile.currentLevel + 1} 级了！`,
        supportingData: { expNeeded, nextLevel: profile.currentLevel + 1 },
        confidence: 0.9,
        actionable: true,
        priority: 'medium',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        relatedAreas: ['spiritual']
      })
    }
    
    // 里程碑预测
    const incompleteMilestones = this.getMilestones().filter(m => !m.isCompleted)
    for (const milestone of incompleteMilestones.slice(0, 2)) {
      const totalProgress = milestone.requirements.reduce((sum, req) => sum + (req.current / req.target), 0) / milestone.requirements.length
      
      if (totalProgress > 0.7) { // 如果完成度超过70%
        predictions.push({
          id: `milestone-prediction-${milestone.id}`,
          type: 'prediction',
          title: `即将达成：${milestone.title}`,
          content: `您在 "${milestone.title}" 上已有 ${Math.round(totalProgress * 100)}% 的进度，再加把劲就能达成了！`,
          supportingData: { milestoneId: milestone.id, progress: totalProgress },
          confidence: 0.8,
          actionable: true,
          priority: 'medium',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          relatedAreas: [milestone.category]
        })
      }
    }
    
    return predictions
  }

  private static identifyWeakAreas(metrics: GrowthMetric[]): GrowthArea[] {
    return metrics
      .filter(m => m.currentValue < m.targetValue * 0.5)
      .map(m => m.area)
  }

  private static createAreaImprovementRecommendation(area: GrowthArea, profile: GrowthProfile, companion: CompanionState): PersonalizedRecommendation | null {
    const areaNames = {
      'spiritual': '精神修养',
      'wisdom': '智慧提升', 
      'compassion': '慈悲心',
      'mindfulness': '正念觉察',
      'discipline': '自律品格',
      'relationships': '人际和谐',
      'health': '身心健康',
      'prosperity': '事业财运'
    }
    
    const practices = {
      'spiritual': {
        title: '晨间诵经练习',
        description: '每天早晨诵读心经或金刚经，培养内心宁静',
        estimatedTime: 15,
        content: '推荐从心经开始，专注于每个字句的含义'
      },
      'wisdom': {
        title: '智慧经典阅读',
        description: '阅读道德经或佛经中的智慧篇章，思考人生哲理',
        estimatedTime: 20,
        content: '建议每天阅读一个章节，并记录感悟'
      },
      'compassion': {
        title: '慈悲心冥想',
        description: '练习慈悲冥想，培养对众生的关爱之心',
        estimatedTime: 10,
        content: '从对自己的慈悲开始，逐渐扩展到他人'
      },
      'mindfulness': {
        title: '正念呼吸练习',
        description: '专注呼吸的正念练习，提升当下觉察力',
        estimatedTime: 10,
        content: '每次练习专注于呼吸的感受，观察念头的来去'
      }
    }
    
    const practice = practices[area as keyof typeof practices]
    if (!practice) return null
    
    return {
      id: `improvement-${area}-${Date.now()}`,
      type: 'practice',
      title: practice.title,
      description: practice.description,
      estimatedTime: practice.estimatedTime,
      difficulty: 2,
      expectedBenefit: `提升${areaNames[area]}能力`,
      relatedAreas: [area],
      personalizedReason: `基于您在${areaNames[area]}方面的发展需要`,
      content: practice.content
    }
  }

  private static createInterestBasedRecommendation(area: GrowthArea, profile: GrowthProfile, metrics: GrowthMetric[]): PersonalizedRecommendation | null {
    const areaMetric = metrics.find(m => m.area === area)
    if (!areaMetric || areaMetric.currentValue < areaMetric.targetValue * 0.8) return null
    
    const areaNames = {
      'spiritual': '精神修养',
      'wisdom': '智慧提升', 
      'compassion': '慈悲心',
      'mindfulness': '正念觉察'
    }
    
    const advancedPractices = {
      'spiritual': {
        title: '高级禅修指导',
        description: '深入的禅修技巧和高阶修行方法',
        estimatedTime: 30
      },
      'wisdom': {
        title: '哲学思辨练习',
        description: '通过哲学思辨深化对智慧的理解',
        estimatedTime: 25
      },
      'compassion': {
        title: '菩萨行愿实践',
        description: '将慈悲心转化为实际的利他行动',
        estimatedTime: 60
      },
      'mindfulness': {
        title: '日常生活正念',
        description: '将正念觉察融入日常生活的每个细节',
        estimatedTime: 15
      }
    }
    
    const practice = advancedPractices[area as keyof typeof advancedPractices]
    if (!practice) return null
    
    return {
      id: `interest-${area}-${Date.now()}`,
      type: 'challenge',
      title: practice.title,
      description: practice.description,
      estimatedTime: practice.estimatedTime,
      difficulty: 4,
      expectedBenefit: `在已有优势基础上进一步提升`,
      relatedAreas: [area],
      personalizedReason: `您在${areaNames[area as keyof typeof areaNames] || area}方面表现优秀，适合更高层次的挑战`
    }
  }

  private static createTimeBasedRecommendation(profile: GrowthProfile, metrics: GrowthMetric[]): PersonalizedRecommendation | null {
    const hour = new Date().getHours()
    
    if (hour >= 6 && hour <= 9) { // 早晨时段
      return {
        id: `time-morning-${Date.now()}`,
        type: 'practice',
        title: '晨光修行',
        description: '趁着清晨的宁静时光，进行一次深度的冥想练习',
        estimatedTime: 15,
        difficulty: 2,
        expectedBenefit: '为一天带来内心的平静和专注',
        relatedAreas: ['spiritual', 'mindfulness'],
        personalizedReason: '早晨是修行的黄金时间，心境最为宁静'
      }
    }
    
    if (hour >= 19 && hour <= 22) { // 晚间时段
      return {
        id: `time-evening-${Date.now()}`,
        type: 'reflection',
        title: '夜晚反思',
        description: '回顾今天的成长和收获，感恩一天的经历',
        estimatedTime: 10,
        difficulty: 1,
        expectedBenefit: '总结经验，带着感恩入眠',
        relatedAreas: ['wisdom', 'spiritual'],
        personalizedReason: '夜晚是反思和感恩的好时光'
      }
    }
    
    return null
  }
}