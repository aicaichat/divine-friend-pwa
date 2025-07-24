// 每日运势计算服务

import {
  BaziChart,
  BaziAnalysis,
  DailyFortune,
  FortuneCategory,
  LuckyItems,
  DailyAdvice,
  DeityGuidance,
  AuspiciousTime,
  Warning,
  WuxingElement,
  Deity
} from '../types/bazi'
import { BaziService } from './baziService'

export class FortuneService {
  private static STORAGE_PREFIX = 'divine-fortune'

  /**
   * 计算每日运势
   */
  static calculateDailyFortune(bazi: BaziChart, date: Date = new Date()): DailyFortune {
    const today = new Date(date)
    today.setHours(0, 0, 0, 0)

    // 计算当日五行力量
    const dailyElements = this.calculateDailyElements(date)
    
    // 计算总体运势
    const overallLuck = this.calculateOverallLuck(bazi, dailyElements)
    
    // 计算各类别运势
    const categories = {
      career: this.calculateCareerFortune(bazi, dailyElements),
      wealth: this.calculateWealthFortune(bazi, dailyElements),
      love: this.calculateLoveFortune(bazi, dailyElements),
      health: this.calculateHealthFortune(bazi, dailyElements),
      study: this.calculateStudyFortune(bazi, dailyElements),
      travel: this.calculateTravelFortune(bazi, dailyElements)
    }

    // 计算幸运物品
    const luckyItems = this.calculateLuckyItems(bazi, dailyElements)
    
    // 生成每日建议
    const advice = this.generateDailyAdvice(bazi, dailyElements, categories)
    
    // 获取神仙指导
    const deityGuidance = this.getDeityGuidance(bazi, dailyElements)
    
    // 计算吉时
    const auspiciousTimes = this.calculateAuspiciousTimes(bazi, dailyElements)
    
    // 生成警告
    const warnings = this.generateWarnings(bazi, dailyElements, categories)

    const fortune: DailyFortune = {
      date: today,
      bazi,
      overallLuck,
      categories,
      luckyItems,
      advice,
      deityGuidance,
      auspiciousTimes,
      warnings
    }

    // 缓存当日运势
    this.cacheDailyFortune(fortune)

    return fortune
  }

  /**
   * 计算当日五行力量
   */
  private static calculateDailyElements(date: Date): Record<WuxingElement, number> {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()

    // 根据日期计算各五行的力量值（简化算法）
    const elements: Record<WuxingElement, number> = {
      wood: 20,
      fire: 20,
      earth: 20,
      metal: 20,
      water: 20
    }

    // 季节影响
    if (month >= 3 && month <= 5) { // 春季，木旺
      elements.wood += 30
      elements.fire += 10
      elements.metal -= 10
    } else if (month >= 6 && month <= 8) { // 夏季，火旺
      elements.fire += 30
      elements.earth += 10
      elements.water -= 10
    } else if (month >= 9 && month <= 11) { // 秋季，金旺
      elements.metal += 30
      elements.water += 10
      elements.wood -= 10
    } else { // 冬季，水旺
      elements.water += 30
      elements.wood += 10
      elements.fire -= 10
    }

    // 时辰影响
    const hourElement = this.getHourElement(hour)
    elements[hourElement] += 15

    // 日期数字影响
    const dayMod = day % 5
    const elementKeys: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water']
    elements[elementKeys[dayMod]] += 10

    return elements
  }

  /**
   * 获取时辰对应的五行
   */
  private static getHourElement(hour: number): WuxingElement {
    if (hour >= 3 && hour < 9) return 'wood'    // 卯时到辰时
    if (hour >= 9 && hour < 15) return 'fire'   // 巳时到未时
    if (hour >= 15 && hour < 21) return 'metal' // 申时到戌时
    return 'water' // 亥时到寅时
  }

  /**
   * 计算总体运势
   */
  private static calculateOverallLuck(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): number {
    let score = 50 // 基础分

    // 日主与当日五行的关系
    const dayMasterPower = dailyElements[bazi.dayMaster]
    
    if (dayMasterPower > 35) {
      score += 25 // 日主得力
    } else if (dayMasterPower < 15) {
      score -= 15 // 日主失力
    }

    // 五行平衡影响
    const maxPower = Math.max(...Object.values(dailyElements))
    const minPower = Math.min(...Object.values(dailyElements))
    
    if (maxPower - minPower < 20) {
      score += 15 // 五行相对平衡
    } else if (maxPower - minPower > 40) {
      score -= 10 // 五行失衡
    }

    // 随机因素
    score += Math.floor(Math.random() * 20) - 10

    return Math.min(Math.max(score, 0), 100)
  }

  /**
   * 计算事业运势
   */
  private static calculateCareerFortune(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): FortuneCategory {
    let score = 50
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    let description = '事业运势平稳'
    let suggestion = '按部就班，稳步前进'

    // 根据日主五行分析事业
    switch (bazi.dayMaster) {
      case 'wood':
        if (dailyElements.water > 30) { // 水生木
          score += 20
          trend = 'rising'
          description = '得贵人相助，事业有所突破'
          suggestion = '把握机会，主动出击'
        }
        if (dailyElements.metal > 35) { // 金克木
          score -= 15
          trend = 'declining'
          description = '遇到阻力，需要谨慎应对'
          suggestion = '低调行事，避免冲突'
        }
        break
      case 'fire':
        if (dailyElements.wood > 30) {
          score += 18
          trend = 'rising'
          description = '创意想法得到支持'
          suggestion = '发挥创造力，展现才华'
        }
        if (dailyElements.water > 35) {
          score -= 12
          description = '计划受阻，需要调整策略'
          suggestion = '保持冷静，重新规划'
        }
        break
      case 'earth':
        if (dailyElements.fire > 30) {
          score += 15
          trend = 'rising'
          description = '领导能力得到认可'
          suggestion = '承担更多责任，展现管理才能'
        }
        break
      case 'metal':
        if (dailyElements.earth > 30) {
          score += 22
          trend = 'rising'
          description = '执行力强，完成重要任务'
          suggestion = '专注目标，严格执行计划'
        }
        break
      case 'water':
        if (dailyElements.metal > 30) {
          score += 20
          trend = 'rising'
          description = '智慧策略获得成功'
          suggestion = '运用智慧，巧妙处理复杂问题'
        }
        break
    }

    return {
      name: '事业运',
      score: Math.min(Math.max(score, 0), 100),
      trend,
      description,
      suggestion,
      luckyColor: this.getElementColor(this.getBeneficialElement(bazi.dayMaster)),
      luckyNumber: [1, 6, 8]
    }
  }

  /**
   * 计算财运
   */
  private static calculateWealthFortune(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): FortuneCategory {
    let score = 50
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    let description = '财运平平'
    let suggestion = '理性消费，谨慎投资'

    // 财运主要看日主的财星力量
    const wealthElement = this.getWealthElement(bazi.dayMaster)
    const wealthPower = dailyElements[wealthElement]

    if (wealthPower > 35) {
      score += 25
      trend = 'rising'
      description = '财运上升，有意外收入'
      suggestion = '抓住机会，适度投资'
    } else if (wealthPower < 15) {
      score -= 10
      trend = 'declining'
      description = '财运低迷，支出较大'
      suggestion = '节约开支，避免投资'
    }

    // 土元素强利财运
    if (dailyElements.earth > 30) {
      score += 10
      description += '，适合储蓄理财'
    }

    return {
      name: '财运',
      score: Math.min(Math.max(score, 0), 100),
      trend,
      description,
      suggestion,
      luckyColor: this.getElementColor(wealthElement),
      luckyNumber: [2, 8, 9]
    }
  }

  /**
   * 计算爱情运势
   */
  private static calculateLoveFortune(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): FortuneCategory {
    let score = 50
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    let description = '感情状况稳定'
    let suggestion = '真诚待人，培养感情'

    // 火元素旺利感情
    if (dailyElements.fire > 35) {
      score += 20
      trend = 'rising'
      description = '魅力增强，桃花运旺'
      suggestion = '主动表达，把握缘分'
    }

    // 水元素旺利智慧交流
    if (dailyElements.water > 30) {
      score += 15
      description += '，心灵沟通更深入'
      suggestion = '多交流思想，增进理解'
    }

    // 金元素过旺可能影响感情
    if (dailyElements.metal > 40) {
      score -= 10
      trend = 'declining'
      description = '容易因固执影响关系'
      suggestion = '学会妥协，包容对方'
    }

    return {
      name: '爱情运',
      score: Math.min(Math.max(score, 0), 100),
      trend,
      description,
      suggestion,
      luckyColor: '#FF69B4',
      luckyNumber: [3, 7, 9]
    }
  }

  /**
   * 计算健康运势
   */
  private static calculateHealthFortune(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): FortuneCategory {
    let score = 70 // 健康基础分较高
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    let description = '身体状况良好'
    let suggestion = '保持规律作息'

    // 检查五行失衡对健康的影响
    const maxElement = Object.entries(dailyElements).reduce((a, b) => a[1] > b[1] ? a : b)
    const minElement = Object.entries(dailyElements).reduce((a, b) => a[1] < b[1] ? a : b)

    if (maxElement[1] - minElement[1] > 35) {
      score -= 15
      trend = 'declining'
      description = '五行失衡，需注意身体调理'
      suggestion = `补充${minElement[0]}元素，平衡${maxElement[0]}过旺`
    }

    // 根据日主分析健康重点
    switch (bazi.dayMaster) {
      case 'wood':
        if (dailyElements.metal > 40) {
          score -= 10
          suggestion = '注意肝胆健康，避免情绪波动'
        }
        break
      case 'fire':
        if (dailyElements.water > 40) {
          score -= 8
          suggestion = '注意心血管健康，保持平和心态'
        }
        break
      case 'earth':
        if (dailyElements.wood > 40) {
          score -= 8
          suggestion = '注意消化系统，饮食要规律'
        }
        break
      case 'metal':
        if (dailyElements.fire > 40) {
          score -= 10
          suggestion = '注意呼吸系统，避免上火'
        }
        break
      case 'water':
        if (dailyElements.earth > 40) {
          score -= 8
          suggestion = '注意肾脏健康，避免过度劳累'
        }
        break
    }

    return {
      name: '健康运',
      score: Math.min(Math.max(score, 0), 100),
      trend,
      description,
      suggestion,
      luckyColor: '#90EE90',
      luckyNumber: [4, 5, 6]
    }
  }

  /**
   * 计算学习运势
   */
  private static calculateStudyFortune(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): FortuneCategory {
    let score = 50
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    let description = '学习状态一般'
    let suggestion = '制定计划，持续努力'

    // 木元素利学习成长
    if (dailyElements.wood > 30) {
      score += 18
      trend = 'rising'
      description = '思维活跃，学习能力强'
      suggestion = '抓住机会深入学习'
    }

    // 水元素利智慧开发
    if (dailyElements.water > 35) {
      score += 15
      description += '，理解力增强'
      suggestion = '多思考，深度学习'
    }

    // 火元素过旺可能影响专注
    if (dailyElements.fire > 45) {
      score -= 10
      description = '容易分心，需要专注'
      suggestion = '控制情绪，提高专注力'
    }

    return {
      name: '学业运',
      score: Math.min(Math.max(score, 0), 100),
      trend,
      description,
      suggestion,
      luckyColor: '#87CEEB',
      luckyNumber: [1, 4, 9]
    }
  }

  /**
   * 计算出行运势
   */
  private static calculateTravelFortune(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): FortuneCategory {
    let score = 60
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    let description = '出行运势平稳'
    let suggestion = '注意安全，做好准备'

    // 水元素旺利出行
    if (dailyElements.water > 30) {
      score += 15
      trend = 'rising'
      description = '出行顺利，旅途愉快'
      suggestion = '适合远行，会有收获'
    }

    // 土元素过旺不利出行
    if (dailyElements.earth > 45) {
      score -= 15
      trend = 'declining'
      description = '出行易遇阻碍'
      suggestion = '推迟出行或加强准备'
    }

    return {
      name: '出行运',
      score: Math.min(Math.max(score, 0), 100),
      trend,
      description,
      suggestion,
      luckyColor: '#4169E1',
      luckyNumber: [6, 7, 8]
    }
  }

  /**
   * 计算幸运物品
   */
  private static calculateLuckyItems(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): LuckyItems {
    const strongestElement = Object.entries(dailyElements).reduce((a, b) => a[1] > b[1] ? a : b)[0] as WuxingElement
    const beneficialElement = this.getBeneficialElement(bazi.dayMaster)

    return {
      colors: [
        this.getElementColor(beneficialElement),
        this.getElementColor(strongestElement),
        '#FFD700' // 金色通用吉色
      ],
      numbers: this.getLuckyNumbers(bazi.dayMaster),
      directions: this.getLuckyDirections(bazi.dayMaster),
      elements: [beneficialElement, strongestElement],
      activities: this.getLuckyActivities(bazi.dayMaster, dailyElements),
      avoid: this.getAvoidActivities(bazi.dayMaster, dailyElements),
      gemstones: this.getLuckyGemstones(beneficialElement),
      flowers: this.getLuckyFlowers(beneficialElement)
    }
  }

  /**
   * 生成每日建议
   */
  private static generateDailyAdvice(bazi: BaziChart, dailyElements: Record<WuxingElement, number>, categories: any): DailyAdvice {
    const strongestElement = Object.entries(dailyElements).reduce((a, b) => a[1] > b[1] ? a : b)[0] as WuxingElement

    return {
      morning: this.getMorningAdvice(bazi.dayMaster, strongestElement),
      afternoon: this.getAfternoonAdvice(bazi.dayMaster, categories),
      evening: this.getEveningAdvice(bazi.dayMaster, strongestElement),
      meditation: this.getMeditationAdvice(bazi.dayMaster),
      mantra: this.getDailyMantra(bazi.dayMaster),
      visualization: this.getVisualizationAdvice(bazi.dayMaster)
    }
  }

  /**
   * 获取神仙指导
   */
  private static getDeityGuidance(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): DeityGuidance[] {
    const userBaziInfo = BaziService.getUserBaziInfo()
    if (!userBaziInfo) return []

    const primaryDeity = userBaziInfo.recommendation.primaryDeity.deity
    const strongestElement = Object.entries(dailyElements).reduce((a, b) => a[1] > b[1] ? a : b)[0] as WuxingElement

    const guidance: DeityGuidance[] = []

    // 主要神仙指导
    guidance.push({
      deity: primaryDeity,
      message: this.getDeityDailyMessage(primaryDeity, bazi.dayMaster),
      blessing: this.getDeityDailyBlessing(primaryDeity),
      practice: this.getDeityDailyPractice(primaryDeity),
      timing: this.getBestTime(primaryDeity.element)
    })

    // 根据当日五行能量推荐其他神仙
    const elementDeity = this.getElementDeity(strongestElement)
    if (elementDeity && elementDeity.id !== primaryDeity.id) {
      guidance.push({
        deity: elementDeity,
        message: `今日${strongestElement}元素旺盛，${elementDeity.chineseName}特别关注您`,
        blessing: `愿${elementDeity.chineseName}的${strongestElement}能量护佑您`,
        practice: `今日可特别向${elementDeity.chineseName}祈祷`,
        timing: '全天'
      })
    }

    return guidance
  }

  /**
   * 计算吉时
   */
  private static calculateAuspiciousTimes(bazi: BaziChart, dailyElements: Record<WuxingElement, number>): AuspiciousTime[] {
    const times: AuspiciousTime[] = []

    // 根据五行旺衰计算各时段运势
    const timeSlots = [
      { period: '子时 (23:00-01:00)', element: 'water' as WuxingElement },
      { period: '丑时 (01:00-03:00)', element: 'earth' as WuxingElement },
      { period: '寅时 (03:00-05:00)', element: 'wood' as WuxingElement },
      { period: '卯时 (05:00-07:00)', element: 'wood' as WuxingElement },
      { period: '辰时 (07:00-09:00)', element: 'earth' as WuxingElement },
      { period: '巳时 (09:00-11:00)', element: 'fire' as WuxingElement },
      { period: '午时 (11:00-13:00)', element: 'fire' as WuxingElement },
      { period: '未时 (13:00-15:00)', element: 'earth' as WuxingElement },
      { period: '申时 (15:00-17:00)', element: 'metal' as WuxingElement },
      { period: '酉时 (17:00-19:00)', element: 'metal' as WuxingElement },
      { period: '戌时 (19:00-21:00)', element: 'earth' as WuxingElement },
      { period: '亥时 (21:00-23:00)', element: 'water' as WuxingElement }
    ]

    timeSlots.forEach(slot => {
      const elementPower = dailyElements[slot.element]
      let luck = 50
      let activity = '日常活动'

      if (slot.element === bazi.dayMaster) {
        luck += 20
        activity = '个人重要事务'
      }

      if (elementPower > 35) {
        luck += 15
        if (slot.element === 'fire') activity = '社交会议'
        else if (slot.element === 'water') activity = '学习思考'
        else if (slot.element === 'wood') activity = '计划制定'
        else if (slot.element === 'metal') activity = '执行决策'
        else if (slot.element === 'earth') activity = '理财储蓄'
      }

      times.push({
        period: slot.period,
        activity,
        luck: Math.min(Math.max(luck, 0), 100),
        element: slot.element
      })
    })

    return times.sort((a, b) => b.luck - a.luck).slice(0, 6) // 返回前6个最佳时段
  }

  /**
   * 生成警告
   */
  private static generateWarnings(bazi: BaziChart, dailyElements: Record<WuxingElement, number>, categories: any): Warning[] {
    const warnings: Warning[] = []

    // 健康警告
    if (categories.health.score < 40) {
      warnings.push({
        type: 'health',
        message: '今日身体状况需要特别关注',
        severity: 'medium',
        suggestion: categories.health.suggestion,
        timeframe: '今日'
      })
    }

    // 财运警告
    if (categories.wealth.score < 30) {
      warnings.push({
        type: 'financial',
        message: '财运低迷，避免大额投资',
        severity: 'high',
        suggestion: '谨慎理财，避免投机',
        timeframe: '今日'
      })
    }

    // 感情警告
    if (categories.love.score < 35) {
      warnings.push({
        type: 'relationship',
        message: '感情方面容易产生误会',
        severity: 'low',
        suggestion: '多沟通理解，避免冲突',
        timeframe: '今日'
      })
    }

    // 五行极度失衡警告
    const maxElement = Math.max(...Object.values(dailyElements))
    const minElement = Math.min(...Object.values(dailyElements))
    
    if (maxElement - minElement > 45) {
      warnings.push({
        type: 'decision',
        message: '今日五行失衡严重，重要决定宜推迟',
        severity: 'high',
        suggestion: '保持平常心，避免重大决策',
        timeframe: '今日'
      })
    }

    return warnings
  }

  /**
   * 获取有利元素
   */
  private static getBeneficialElement(dayMaster: WuxingElement): WuxingElement {
    const beneficialMap: Record<WuxingElement, WuxingElement> = {
      'wood': 'water', // 水生木
      'fire': 'wood',  // 木生火
      'earth': 'fire', // 火生土
      'metal': 'earth', // 土生金
      'water': 'metal'  // 金生水
    }
    return beneficialMap[dayMaster]
  }

  /**
   * 获取财星元素
   */
  private static getWealthElement(dayMaster: WuxingElement): WuxingElement {
    const wealthMap: Record<WuxingElement, WuxingElement> = {
      'wood': 'earth',  // 木克土为财
      'fire': 'metal',  // 火克金为财
      'earth': 'water', // 土克水为财
      'metal': 'wood',  // 金克木为财
      'water': 'fire'   // 水克火为财
    }
    return wealthMap[dayMaster]
  }

  /**
   * 获取元素对应颜色
   */
  private static getElementColor(element: WuxingElement): string {
    const colorMap: Record<WuxingElement, string> = {
      'wood': '#32CD32',  // 绿色
      'fire': '#FF4500',  // 红色
      'earth': '#DAA520', // 黄色
      'metal': '#C0C0C0', // 银色
      'water': '#4169E1'  // 蓝色
    }
    return colorMap[element]
  }

  /**
   * 获取幸运数字
   */
  private static getLuckyNumbers(dayMaster: WuxingElement): number[] {
    const numberMap: Record<WuxingElement, number[]> = {
      'wood': [1, 2, 3, 8],
      'fire': [2, 3, 7, 9],
      'earth': [5, 6, 8, 0],
      'metal': [4, 7, 8, 9],
      'water': [1, 6, 9, 0]
    }
    return numberMap[dayMaster]
  }

  /**
   * 获取吉利方位
   */
  private static getLuckyDirections(dayMaster: WuxingElement): string[] {
    const directionMap: Record<WuxingElement, string[]> = {
      'wood': ['东方', '东南'],
      'fire': ['南方', '东南'],
      'earth': ['中央', '西南', '东北'],
      'metal': ['西方', '西北'],
      'water': ['北方', '西北']
    }
    return directionMap[dayMaster]
  }

  /**
   * 获取吉利活动
   */
  private static getLuckyActivities(dayMaster: WuxingElement, dailyElements: Record<WuxingElement, number>): string[] {
    const baseActivities: Record<WuxingElement, string[]> = {
      'wood': ['学习成长', '制定计划', '户外活动'],
      'fire': ['社交聚会', '创意工作', '表达展示'],
      'earth': ['理财储蓄', '整理收纳', '慈善公益'],
      'metal': ['执行决策', '处理公务', '锻炼身体'],
      'water': ['思考反省', '学习智慧', '静心冥想']
    }
    
    const activities = [...baseActivities[dayMaster]]
    
    // 根据当日五行力量调整
    const strongestElement = Object.entries(dailyElements).reduce((a, b) => a[1] > b[1] ? a : b)[0] as WuxingElement
    if (strongestElement !== dayMaster) {
      activities.push(...baseActivities[strongestElement].slice(0, 1))
    }
    
    return activities
  }

  /**
   * 获取应避免的活动
   */
  private static getAvoidActivities(dayMaster: WuxingElement, dailyElements: Record<WuxingElement, number>): string[] {
    const avoidMap: Record<WuxingElement, string[]> = {
      'wood': ['激烈竞争', '金属作业'],
      'fire': ['长时间独处', '消极思考'],
      'earth': ['冒险投资', '急躁决定'],
      'metal': ['情绪化行为', '过度消费'],
      'water': ['重体力劳动', '高温环境']
    }
    
    const activities = [...avoidMap[dayMaster]]
    
    // 检查克制元素过旺
    Object.entries(dailyElements).forEach(([element, power]) => {
      if (power > 45 && this.isDestructiveElement(element as WuxingElement, dayMaster)) {
        activities.push(`避免${element}元素相关活动`)
      }
    })
    
    return activities
  }

  /**
   * 检查是否为克制元素
   */
  private static isDestructiveElement(element: WuxingElement, dayMaster: WuxingElement): boolean {
    const destructiveMap: Record<WuxingElement, WuxingElement> = {
      'wood': 'metal',
      'fire': 'water',
      'earth': 'wood',
      'metal': 'fire',
      'water': 'earth'
    }
    return destructiveMap[dayMaster] === element
  }

  /**
   * 获取幸运宝石
   */
  private static getLuckyGemstones(element: WuxingElement): string[] {
    const gemstoneMap: Record<WuxingElement, string[]> = {
      'wood': ['绿松石', '翡翠', '橄榄石'],
      'fire': ['红宝石', '石榴石', '红玛瑙'],
      'earth': ['黄水晶', '琥珀', '黄玉'],
      'metal': ['白水晶', '珍珠', '银饰'],
      'water': ['蓝宝石', '海蓝宝', '青金石']
    }
    return gemstoneMap[element]
  }

  /**
   * 获取幸运花卉
   */
  private static getLuckyFlowers(element: WuxingElement): string[] {
    const flowerMap: Record<WuxingElement, string[]> = {
      'wood': ['玫瑰', '牡丹', '绿萝'],
      'fire': ['向日葵', '红掌', '火鹤'],
      'earth': ['菊花', '康乃馨', '满天星'],
      'metal': ['百合', '茉莉', '白兰'],
      'water': ['荷花', '水仙', '风信子']
    }
    return flowerMap[element]
  }

  // 建议生成方法
  private static getMorningAdvice(dayMaster: WuxingElement, strongestElement: WuxingElement): string {
    const adviceMap: Record<WuxingElement, string> = {
      'wood': '晨起面向东方，深呼吸迎接朝阳，规划今日成长目标',
      'fire': '用热情开始新的一天，与他人分享积极能量',
      'earth': '稳重开始一天，整理环境和思绪，为今日奠定基础',
      'metal': '制定明确计划，用纪律和决心面对今日挑战',
      'water': '静心冥想片刻，让智慧指引今日的选择'
    }
    
    let advice = adviceMap[dayMaster]
    if (strongestElement !== dayMaster) {
      advice += `，今日${strongestElement}能量旺盛，可适当调整节奏`
    }
    
    return advice
  }

  private static getAfternoonAdvice(dayMaster: WuxingElement, categories: any): string {
    let advice = '午后保持专注，处理重要事务'
    
    if (categories.career.score > 70) {
      advice = '午后是处理工作的好时机，效率会很高'
    } else if (categories.study.score > 75) {
      advice = '午后适合学习和思考，大脑活跃度较高'
    } else if (categories.wealth.score > 80) {
      advice = '午后可关注理财信息，做出明智的财务决定'
    }
    
    return advice
  }

  private static getEveningAdvice(dayMaster: WuxingElement, strongestElement: WuxingElement): string {
    const adviceMap: Record<WuxingElement, string> = {
      'wood': '晚间适合阅读和学习，为明日成长做准备',
      'fire': '晚间与家人朋友温馨相聚，分享一天的收获',
      'earth': '晚间整理一天的收获，感恩身边的美好',
      'metal': '晚间反思今日得失，为明日制定更好的计划',
      'water': '晚间静心思考，让智慧沉淀'
    }
    
    return adviceMap[dayMaster]
  }

  private static getMeditationAdvice(dayMaster: WuxingElement): string {
    const meditationMap: Record<WuxingElement, string> = {
      'wood': '观想自己如大树般成长，扎根大地，枝叶向天',
      'fire': '观想内心光明温暖，照亮自己也温暖他人',
      'earth': '观想自己稳如山岳，包容万物，厚德载物',
      'metal': '观想内心坚如金石，意志纯净，斩断烦恼',
      'water': '观想智慧如海般深邃，流动不息，滋润万物'
    }
    
    return meditationMap[dayMaster]
  }

  private static getDailyMantra(dayMaster: WuxingElement): string {
    const mantraMap: Record<WuxingElement, string> = {
      'wood': '仁者爱人，智者不惑',
      'fire': '礼者敬人，明者不迷',
      'earth': '信者立人，德者不败',
      'metal': '义者正人，勇者不惧',
      'water': '智者知人，善者不争'
    }
    
    return mantraMap[dayMaster]
  }

  private static getVisualizationAdvice(dayMaster: WuxingElement): string {
    const visualizationMap: Record<WuxingElement, string> = {
      'wood': '想象自己在茂密森林中，感受生命的蓬勃生长',
      'fire': '想象自己被温暖阳光包围，内心充满光明能量',
      'earth': '想象自己站在广袤大地上，感受稳重与包容',
      'metal': '想象自己如宝剑般锋利纯净，意志坚定不移',
      'water': '想象自己如清澈湖水，宁静深邃，智慧流淌'
    }
    
    return visualizationMap[dayMaster]
  }

  private static getDeityDailyMessage(deity: Deity, dayMaster: WuxingElement): string {
    const messages = [
      `${deity.chineseName}今日特别关注您，愿您在修行路上精进不退`,
      `${deity.chineseName}护佑您今日平安顺遂，心想事成`,
      `${deity.chineseName}感应到您的虔诚，将为您指引前路`,
      `${deity.chineseName}祝福您今日充满智慧与慈悲`,
      `${deity.chineseName}陪伴您度过这美好的一天`
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  private static getDeityDailyBlessing(deity: Deity): string {
    return deity.blessings[Math.floor(Math.random() * deity.blessings.length)]
  }

  private static getDeityDailyPractice(deity: Deity): string {
    if (deity.mantra) {
      return `诵念"${deity.mantra}"${Math.floor(Math.random() * 5 + 1) * 21}遍`
    }
    
    const practices = [
      `向${deity.chineseName}献花供养`,
      `静心祈祷，感受${deity.chineseName}的慈悲`,
      `学习${deity.chineseName}的品格，在生活中实践`,
      `以${deity.chineseName}为榜样，行善积德`
    ]
    
    return practices[Math.floor(Math.random() * practices.length)]
  }

  private static getBestTime(element: WuxingElement): string {
    const timeMap: Record<WuxingElement, string> = {
      'wood': '卯时 (5-7点)',
      'fire': '午时 (11-13点)',
      'earth': '戌时 (19-21点)',
      'metal': '酉时 (17-19点)',
      'water': '子时 (23-1点)'
    }
    
    return timeMap[element]
  }

  private static getElementDeity(element: WuxingElement): Deity | undefined {
    const deities = BaziService.getAllDeities()
    return deities.find(deity => deity.element === element)
  }

  /**
   * 缓存每日运势
   */
  private static cacheDailyFortune(fortune: DailyFortune): void {
    const dateKey = fortune.date.toISOString().split('T')[0]
    const cacheKey = `${this.STORAGE_PREFIX}-${dateKey}`
    localStorage.setItem(cacheKey, JSON.stringify(fortune))
  }

  /**
   * 获取缓存的运势
   */
  static getCachedFortune(date: Date = new Date()): DailyFortune | null {
    const today = new Date(date)
    today.setHours(0, 0, 0, 0)
    const dateKey = today.toISOString().split('T')[0]
    const cacheKey = `${this.STORAGE_PREFIX}-${dateKey}`
    
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null
    
    try {
      const fortune = JSON.parse(cached)
      return {
        ...fortune,
        date: new Date(fortune.date)
      }
    } catch (error) {
      console.error('解析缓存运势失败:', error)
      return null
    }
  }

  /**
   * 获取或计算每日运势
   */
  static getDailyFortune(date: Date = new Date()): DailyFortune | null {
    const userBaziInfo = BaziService.getUserBaziInfo()
    if (!userBaziInfo) return null
    
    // 先尝试获取缓存
    const cached = this.getCachedFortune(date)
    if (cached) return cached
    
    // 计算新的运势
    return this.calculateDailyFortune(userBaziInfo.analysis.chart, date)
  }
}