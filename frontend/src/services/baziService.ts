// 八字计算和神仙匹配服务

import {
  UserBirthInfo,
  BaziChart,
  BaziPillar,
  BaziAnalysis,
  ElementBalance,
  WuxingElement,
  PersonalityTraits,
  Deity,
  DeityMatch,
  DeityRecommendation
} from '../types/bazi'

export class BaziService {
  private static STORAGE_PREFIX = 'divine-bazi'
  
  // 天干
  private static HEAVENLY_STEMS = [
    '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
  ]
  
  // 地支
  private static EARTHLY_BRANCHES = [
    '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
  ]
  
  // 天干五行对应
  private static STEM_ELEMENTS: Record<string, WuxingElement> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  }
  
  // 地支五行对应
  private static BRANCH_ELEMENTS: Record<string, WuxingElement> = {
    '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
    '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
    '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
  }
  
  // 纳音表（简化版）
  private static NAYIN_MAP: Record<string, string> = {
    '甲子': '海中金', '乙丑': '海中金',
    '丙寅': '炉中火', '丁卯': '炉中火',
    '戊辰': '大林木', '己巳': '大林木',
    '庚午': '路旁土', '辛未': '路旁土',
    '壬申': '剑锋金', '癸酉': '剑锋金',
    '甲戌': '山头火', '乙亥': '山头火'
  }

  /**
   * 计算八字
   */
  static calculateBazi(birthInfo: UserBirthInfo): BaziChart {
    const birthDate = new Date(
      birthInfo.birthYear,
      birthInfo.birthMonth - 1, // JS月份从0开始
      birthInfo.birthDay,
      birthInfo.birthHour,
      birthInfo.birthMinute
    )

    const yearPillar = this.calculateYearPillar(birthInfo.birthYear)
    const monthPillar = this.calculateMonthPillar(birthInfo.birthYear, birthInfo.birthMonth)
    const dayPillar = this.calculateDayPillar(birthDate)
    const hourPillar = this.calculateHourPillar(birthInfo.birthHour)

    const chart: BaziChart = {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      dayMaster: dayPillar.element,
      birthInfo,
      calculatedAt: new Date()
    }

    return chart
  }

  /**
   * 计算年柱
   */
  private static calculateYearPillar(year: number): BaziPillar {
    const stemIndex = (year - 4) % 10
    const branchIndex = (year - 4) % 12
    
    const heavenlyStem = this.HEAVENLY_STEMS[stemIndex]
    const earthlyBranch = this.EARTHLY_BRANCHES[branchIndex]
    const element = this.STEM_ELEMENTS[heavenlyStem]
    const nayin = this.NAYIN_MAP[heavenlyStem + earthlyBranch] || '待查'

    return {
      heavenlyStem,
      earthlyBranch,
      element,
      nayin
    }
  }

  /**
   * 计算月柱
   */
  private static calculateMonthPillar(year: number, month: number): BaziPillar {
    // 简化计算，实际应考虑节气
    const yearStemIndex = (year - 4) % 10
    const monthStemIndex = (yearStemIndex * 2 + month) % 10
    const monthBranchIndex = (month + 1) % 12
    
    const heavenlyStem = this.HEAVENLY_STEMS[monthStemIndex]
    const earthlyBranch = this.EARTHLY_BRANCHES[monthBranchIndex]
    const element = this.STEM_ELEMENTS[heavenlyStem]
    const nayin = this.NAYIN_MAP[heavenlyStem + earthlyBranch] || '待查'

    return {
      heavenlyStem,
      earthlyBranch,
      element,
      nayin
    }
  }

  /**
   * 计算日柱
   */
  private static calculateDayPillar(date: Date): BaziPillar {
    // 简化计算，使用公历日期推算
    const dayCount = Math.floor(date.getTime() / (1000 * 60 * 60 * 24))
    const stemIndex = (dayCount + 15) % 10
    const branchIndex = (dayCount + 49) % 12
    
    const heavenlyStem = this.HEAVENLY_STEMS[stemIndex]
    const earthlyBranch = this.EARTHLY_BRANCHES[branchIndex]
    const element = this.STEM_ELEMENTS[heavenlyStem]
    const nayin = this.NAYIN_MAP[heavenlyStem + earthlyBranch] || '待查'

    return {
      heavenlyStem,
      earthlyBranch,
      element,
      nayin
    }
  }

  /**
   * 计算时柱
   */
  private static calculateHourPillar(hour: number): BaziPillar {
    const hourBranchIndex = Math.floor((hour + 1) / 2) % 12
    const hourStemIndex = (hour * 2 + 12) % 10
    
    const heavenlyStem = this.HEAVENLY_STEMS[hourStemIndex]
    const earthlyBranch = this.EARTHLY_BRANCHES[hourBranchIndex]
    const element = this.STEM_ELEMENTS[heavenlyStem]
    const nayin = this.NAYIN_MAP[heavenlyStem + earthlyBranch] || '待查'

    return {
      heavenlyStem,
      earthlyBranch,
      element,
      nayin
    }
  }

  /**
   * 分析八字
   */
  static analyzeBazi(chart: BaziChart): BaziAnalysis {
    const elementBalance = this.calculateElementBalance(chart)
    const personalityTraits = this.analyzePersonality(chart, elementBalance)
    
    return {
      chart,
      elementBalance,
      personalityTraits,
      strengths: this.getStrengths(chart, elementBalance),
      weaknesses: this.getWeaknesses(chart, elementBalance),
      suggestions: this.getSuggestions(chart, elementBalance),
      luckyElements: this.getLuckyElements(chart, elementBalance),
      unluckyElements: this.getUnluckyElements(chart, elementBalance),
      careerSuggestions: this.getCareerSuggestions(chart, elementBalance),
      healthSuggestions: this.getHealthSuggestions(chart, elementBalance),
      relationshipSuggestions: this.getRelationshipSuggestions(chart, elementBalance)
    }
  }

  /**
   * 计算五行平衡
   */
  private static calculateElementBalance(chart: BaziChart): ElementBalance {
    const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
    
    // 统计各柱的五行
    const pillars = [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar]
    pillars.forEach(pillar => {
      elements[pillar.element] += 2 // 天干权重
      elements[this.BRANCH_ELEMENTS[pillar.earthlyBranch]] += 1 // 地支权重
    })

    // 找出最强和最弱的元素
    const sortedElements = Object.entries(elements).sort(([,a], [,b]) => b - a)
    const strongest = sortedElements[0][0] as WuxingElement
    const weakest = sortedElements[sortedElements.length - 1][0] as WuxingElement
    
    // 找出缺失和过旺的元素
    const missing: WuxingElement[] = []
    const excessive: WuxingElement[] = []
    
    Object.entries(elements).forEach(([element, count]) => {
      if (count === 0) missing.push(element as WuxingElement)
      if (count >= 4) excessive.push(element as WuxingElement)
    })

    return {
      ...elements,
      strongest,
      weakest,
      missing,
      excessive
    }
  }

  /**
   * 分析性格特征
   */
  private static analyzePersonality(chart: BaziChart, elementBalance: ElementBalance): PersonalityTraits {
    const dayMaster = chart.dayMaster
    
    // 基于日主五行和五行平衡分析性格
    let mainTraits: string[] = []
    let temperament: PersonalityTraits['temperament'] = 'balanced'
    let socialTendency: PersonalityTraits['socialTendency'] = 'ambivert'
    let decisionMaking: PersonalityTraits['decisionMaking'] = 'rational'
    let stressHandling: PersonalityTraits['stressHandling'] = 'adaptive'

    switch (dayMaster) {
      case 'wood':
        mainTraits = ['仁慈', '正直', '有条理', '进取心强']
        temperament = 'warm'
        socialTendency = 'extroverted'
        decisionMaking = 'rational'
        break
      case 'fire':
        mainTraits = ['热情', '礼貌', '光明磊落', '急性子']
        temperament = 'hot'
        socialTendency = 'extroverted'
        decisionMaking = 'emotional'
        break
      case 'earth':
        mainTraits = ['忠诚', '厚道', '稳重', '有责任心']
        temperament = 'balanced'
        socialTendency = 'ambivert'
        decisionMaking = 'rational'
        stressHandling = 'resilient'
        break
      case 'metal':
        mainTraits = ['义气', '果断', '有原则', '严格']
        temperament = 'cool'
        socialTendency = 'introverted'
        decisionMaking = 'rational'
        break
      case 'water':
        mainTraits = ['智慧', '灵活', '善变', '深沉']
        temperament = 'cold'
        socialTendency = 'introverted'
        decisionMaking = 'intuitive'
        stressHandling = 'adaptive'
        break
    }

    return {
      mainTraits,
      temperament,
      socialTendency,
      decisionMaking,
      stressHandling
    }
  }

  /**
   * 获取优势
   */
  private static getStrengths(chart: BaziChart, elementBalance: ElementBalance): string[] {
    const strengths: string[] = []
    
    if (elementBalance.strongest === chart.dayMaster) {
      strengths.push('个人能力强，自信心足')
    }
    
    if (elementBalance.wood > 2) {
      strengths.push('有仁爱之心，善于成长发展')
    }
    
    if (elementBalance.fire > 2) {
      strengths.push('热情开朗，有感染力')
    }
    
    if (elementBalance.earth > 2) {
      strengths.push('稳重可靠，有包容心')
    }
    
    if (elementBalance.metal > 2) {
      strengths.push('意志坚定，有正义感')
    }
    
    if (elementBalance.water > 2) {
      strengths.push('智慧聪颖，适应能力强')
    }

    return strengths.length ? strengths : ['性格温和，容易相处']
  }

  /**
   * 获取弱点
   */
  private static getWeaknesses(chart: BaziChart, elementBalance: ElementBalance): string[] {
    const weaknesses: string[] = []
    
    elementBalance.excessive.forEach(element => {
      switch (element) {
        case 'wood':
          weaknesses.push('过于理想主义，缺乏现实性')
          break
        case 'fire':
          weaknesses.push('容易冲动，缺乏耐心')
          break
        case 'earth':
          weaknesses.push('过于保守，缺乏变通')
          break
        case 'metal':
          weaknesses.push('过于严格，不够灵活')
          break
        case 'water':
          weaknesses.push('过于多疑，缺乏决断')
          break
      }
    })

    elementBalance.missing.forEach(element => {
      switch (element) {
        case 'wood':
          weaknesses.push('缺乏成长动力和计划性')
          break
        case 'fire':
          weaknesses.push('缺乏热情和表达能力')
          break
        case 'earth':
          weaknesses.push('缺乏稳定性和包容心')
          break
        case 'metal':
          weaknesses.push('缺乏原则性和执行力')
          break
        case 'water':
          weaknesses.push('缺乏智慧和适应能力')
          break
      }
    })

    return weaknesses.length ? weaknesses : ['五行相对平衡，性格较为温和']
  }

  /**
   * 获取建议
   */
  private static getSuggestions(chart: BaziChart, elementBalance: ElementBalance): string[] {
    const suggestions: string[] = []
    
    elementBalance.missing.forEach(element => {
      switch (element) {
        case 'wood':
          suggestions.push('多接触绿色植物，培养耐心和成长心态')
          break
        case 'fire':
          suggestions.push('多参加社交活动，培养表达和沟通能力')
          break
        case 'earth':
          suggestions.push('多做慈善公益，培养包容和稳重品格')
          break
        case 'metal':
          suggestions.push('多学习规则制度，培养原则性和执行力')
          break
        case 'water':
          suggestions.push('多读书学习，培养智慧和思考能力')
          break
      }
    })

    return suggestions.length ? suggestions : ['保持当前的平衡状态，继续修行提升']
  }

  /**
   * 获取吉利五行
   */
  private static getLuckyElements(chart: BaziChart, elementBalance: ElementBalance): WuxingElement[] {
    const lucky: WuxingElement[] = []
    
    // 缺失的元素是需要补充的
    lucky.push(...elementBalance.missing)
    
    // 如果日主较弱，加强日主
    if (elementBalance[chart.dayMaster] < 3) {
      if (!lucky.includes(chart.dayMaster)) {
        lucky.push(chart.dayMaster)
      }
    }

    return lucky.length ? lucky : ['earth'] // 默认土为中性
  }

  /**
   * 获取不利五行
   */
  private static getUnluckyElements(chart: BaziChart, elementBalance: ElementBalance): WuxingElement[] {
    return elementBalance.excessive
  }

  /**
   * 获取事业建议
   */
  private static getCareerSuggestions(chart: BaziChart, elementBalance: ElementBalance): string[] {
    const suggestions: string[] = []
    
    switch (chart.dayMaster) {
      case 'wood':
        suggestions.push('适合教育、文化、医疗、农业等行业')
        break
      case 'fire':
        suggestions.push('适合娱乐、广告、能源、餐饮等行业')
        break
      case 'earth':
        suggestions.push('适合房地产、建筑、管理、服务等行业')
        break
      case 'metal':
        suggestions.push('适合金融、机械、军警、珠宝等行业')
        break
      case 'water':
        suggestions.push('适合贸易、物流、信息、旅游等行业')
        break
    }

    return suggestions
  }

  /**
   * 获取健康建议
   */
  private static getHealthSuggestions(chart: BaziChart, elementBalance: ElementBalance): string[] {
    const suggestions: string[] = []
    
    elementBalance.excessive.forEach(element => {
      switch (element) {
        case 'wood':
          suggestions.push('注意肝胆健康，避免过度劳累')
          break
        case 'fire':
          suggestions.push('注意心脏健康，避免情绪激动')
          break
        case 'earth':
          suggestions.push('注意脾胃健康，规律饮食')
          break
        case 'metal':
          suggestions.push('注意肺部健康，避免呼吸道疾病')
          break
        case 'water':
          suggestions.push('注意肾脏健康，避免过度消耗')
          break
      }
    })

    elementBalance.missing.forEach(element => {
      switch (element) {
        case 'wood':
          suggestions.push('加强肝胆保养，多做伸展运动')
          break
        case 'fire':
          suggestions.push('注意心血管健康，保持积极心态')
          break
        case 'earth':
          suggestions.push('调理脾胃功能，注意营养搭配')
          break
        case 'metal':
          suggestions.push('增强肺功能，多做呼吸练习')
          break
        case 'water':
          suggestions.push('补益肾气，避免熬夜过劳')
          break
      }
    })

    return suggestions.length ? suggestions : ['保持五行平衡，注意起居有常']
  }

  /**
   * 获取感情建议
   */
  private static getRelationshipSuggestions(chart: BaziChart, elementBalance: ElementBalance): string[] {
    const suggestions: string[] = []
    
    switch (chart.dayMaster) {
      case 'wood':
        suggestions.push('寻找火型或水型伴侣，互相促进成长')
        break
      case 'fire':
        suggestions.push('寻找木型或土型伴侣，获得支持与稳定')
        break
      case 'earth':
        suggestions.push('寻找火型或金型伴侣，平衡生活节奏')
        break
      case 'metal':
        suggestions.push('寻找土型或水型伴侣，软化性格刚硬')
        break
      case 'water':
        suggestions.push('寻找金型或木型伴侣，激发生活热情')
        break
    }

    suggestions.push('在感情中保持真诚，培养包容心')
    return suggestions
  }

  /**
   * 获取所有可用的神仙
   */
  static getAllDeities(): Deity[] {
    return [
      {
        id: 'guanyin',
        name: 'Avalokitesvara',
        chineseName: '观世音菩萨',
        title: '大慈大悲观世音菩萨',
        avatar: '🕯️',
        domain: ['慈悲', '救苦', '智慧', '平安'],
        element: 'water',
        personality: ['慈悲', '包容', '智慧', '温和'],
        specialties: ['化解困厄', '增长智慧', '护佑平安', '消灾解难'],
        blessings: ['身体健康', '家庭和睦', '事业顺利', '智慧增长'],
        description: '观世音菩萨是佛教中慈悲与智慧的象征，寻声救苦，有求必应。',
        iconEmoji: '🌸',
        color: '#87CEEB',
        mantra: '南无观世音菩萨',
        symbol: '🪷',
        festival: '观音成道日（农历六月十九）',
        temple: '普陀山',
        story: '观音菩萨闻声救苦，普度众生，是最受崇拜的菩萨之一。',
        compatibility: {
          bestElements: ['water', 'wood'],
          goodElements: ['earth'],
          neutralElements: ['fire'],
          poorElements: ['metal']
        }
      },
      {
        id: 'wenshu',
        name: 'Manjusri',
        chineseName: '文殊菩萨',
        title: '大智文殊师利菩萨',
        avatar: '🗡️',
        domain: ['智慧', '学业', '文艺', '辩才'],
        element: 'wood',
        personality: ['智慧', '理性', '博学', '善辩'],
        specialties: ['开启智慧', '助学业', '增进文艺', '提升辩才'],
        blessings: ['考试顺利', '学业有成', '智慧增长', '文思敏捷'],
        description: '文殊菩萨是智慧的化身，特别护佑学业和智慧的增长。',
        iconEmoji: '📚',
        color: '#32CD32',
        mantra: '南无文殊师利菩萨',
        symbol: '⚔️',
        festival: '文殊诞辰（农历四月初四）',
        temple: '五台山',
        story: '文殊菩萨是七佛之师，以智慧著称，手持慧剑斩断烦恼。',
        compatibility: {
          bestElements: ['wood', 'fire'],
          goodElements: ['water'],
          neutralElements: ['earth'],
          poorElements: ['metal']
        }
      },
      {
        id: 'puxian',
        name: 'Samantabhadra',
        chineseName: '普贤菩萨',
        title: '大行普贤菩萨',
        avatar: '🐘',
        domain: ['践行', '愿力', '德行', '修行'],
        element: 'earth',
        personality: ['实干', '坚韧', '慈悲', '稳重'],
        specialties: ['增强愿力', '助修行', '增德行', '护持正法'],
        blessings: ['修行精进', '愿望成就', '德行增长', '菩提心坚'],
        description: '普贤菩萨以大行愿著称，是实践和愿力的象征。',
        iconEmoji: '🌟',
        color: '#FFD700',
        mantra: '南无普贤菩萨',
        symbol: '🐘',
        festival: '普贤诞辰（农历二月二十一）',
        temple: '峨眉山',
        story: '普贤菩萨发十大愿，以实际行动践行菩萨道。',
        compatibility: {
          bestElements: ['earth', 'fire'],
          goodElements: ['metal'],
          neutralElements: ['wood'],
          poorElements: ['water']
        }
      },
      {
        id: 'dizang',
        name: 'Ksitigarbha',
        chineseName: '地藏王菩萨',
        title: '大愿地藏王菩萨',
        avatar: '🔮',
        domain: ['地狱', '超度', '孝道', '愿力'],
        element: 'earth',
        personality: ['坚定', '慈悲', '勇敢', '不屈'],
        specialties: ['超度亡灵', '护持孝道', '拯救苦难', '坚定愿力'],
        blessings: ['祖先安息', '孝心增长', '业障消除', '愿力坚定'],
        description: '地藏菩萨发大愿度尽地狱众生，是孝道和愿力的典范。',
        iconEmoji: '⛩️',
        color: '#8B4513',
        mantra: '南无地藏王菩萨',
        symbol: '🏺',
        festival: '地藏诞辰（农历七月三十）',
        temple: '九华山',
        story: '地藏菩萨发愿"地狱不空，誓不成佛"，体现无尽悲愿。',
        compatibility: {
          bestElements: ['earth', 'metal'],
          goodElements: ['fire'],
          neutralElements: ['water'],
          poorElements: ['wood']
        }
      },
      {
        id: 'amitabha',
        name: 'Amitabha Buddha',
        chineseName: '阿弥陀佛',
        title: '南无阿弥陀佛',
        avatar: '🪔',
        domain: ['净土', '往生', '无量寿', '光明'],
        element: 'fire',
        personality: ['光明', '慈悲', '包容', '清净'],
        specialties: ['引导往生', '消除业障', '增长寿命', '净化心灵'],
        blessings: ['寿命延长', '心灵清净', '往生净土', '光明照耀'],
        description: '阿弥陀佛是西方极乐世界的教主，以无量寿和无量光闻名。',
        iconEmoji: '🏮',
        color: '#FF6B6B',
        mantra: '南无阿弥陀佛',
        symbol: '🪔',
        festival: '阿弥陀佛圣诞（农历十一月十七）',
        temple: '净土宗各大寺院',
        story: '阿弥陀佛发四十八愿，建立极乐净土，接引众生往生。',
        compatibility: {
          bestElements: ['fire', 'wood'],
          goodElements: ['earth'],
          neutralElements: ['water'],
          poorElements: ['metal']
        }
      },
      {
        id: 'guandi',
        name: 'Guan Di',
        chineseName: '关帝圣君',
        title: '关圣帝君',
        avatar: '⚔️',
        domain: ['正义', '忠义', '武勇', '财运'],
        element: 'metal',
        personality: ['正直', '忠诚', '勇敢', '义气'],
        specialties: ['护持正义', '增强勇气', '招财进宝', '驱邪避凶'],
        blessings: ['正义得张', '勇气倍增', '财运亨通', '平安护佑'],
        description: '关帝圣君以忠义著称，是正义和财运的守护神。',
        iconEmoji: '🗡️',
        color: '#DC143C',
        mantra: '南无关圣帝君',
        symbol: '⚔️',
        festival: '关帝诞辰（农历六月二十四）',
        temple: '关帝庙',
        story: '关羽因其忠义勇武被后世尊为关帝，护佑正义和财运。',
        compatibility: {
          bestElements: ['metal', 'earth'],
          goodElements: ['water'],
          neutralElements: ['wood'],
          poorElements: ['fire']
        }
      },
      {
        id: 'mazu',
        name: 'Mazu',
        chineseName: '妈祖',
        title: '天上圣母',
        avatar: '🌊',
        domain: ['海洋', '平安', '出行', '护航'],
        element: 'water',
        personality: ['慈祥', '保护', '智慧', '神通'],
        specialties: ['护航海行', '保佑平安', '指引方向', '救急救难'],
        blessings: ['出行平安', '一路顺风', '化险为夷', '导引光明'],
        description: '妈祖是海上女神，专门保护航海者和出行人员的平安。',
        iconEmoji: '⛵',
        color: '#4682B4',
        mantra: '南无天上圣母',
        symbol: '🌊',
        festival: '妈祖诞辰（农历三月二十三）',
        temple: '湄洲妈祖庙',
        story: '妈祖林默娘因救助海难而得道成仙，成为海上保护神。',
        compatibility: {
          bestElements: ['water', 'metal'],
          goodElements: ['wood'],
          neutralElements: ['earth'],
          poorElements: ['fire']
        }
      },
      {
        id: 'caishen',
        name: 'God of Wealth',
        chineseName: '财神爷',
        title: '招财进宝财神',
        avatar: '💰',
        domain: ['财运', '商业', '投资', '富贵'],
        element: 'earth',
        personality: ['慷慨', '富有', '智慧', '公正'],
        specialties: ['招财进宝', '生意兴隆', '投资获利', '财源广进'],
        blessings: ['财运亨通', '生意兴隆', '投资成功', '富贵满堂'],
        description: '财神爷专管世间财富，是商人和投资者的守护神。',
        iconEmoji: '🏮',
        color: '#FFD700',
        mantra: '恭请财神爷',
        symbol: '💰',
        festival: '财神诞辰（农历三月十五）',
        temple: '财神庙',
        story: '财神爷掌管人间财富，公正分配，护佑勤劳善良之人。',
        compatibility: {
          bestElements: ['earth', 'metal'],
          goodElements: ['fire'],
          neutralElements: ['water'],
          poorElements: ['wood']
        }
      }
    ]
  }

  /**
   * 匹配最适合的神仙
   */
  static matchDeities(bazi: BaziAnalysis): DeityRecommendation {
    const deities = this.getAllDeities()
    const matches: DeityMatch[] = []

    for (const deity of deities) {
      const compatibility = this.calculateDeityCompatibility(bazi, deity)
      const match: DeityMatch = {
        deity,
        compatibility,
        reasons: this.getMatchReasons(bazi, deity, compatibility),
        blessings: this.getPersonalizedBlessings(bazi, deity),
        guidance: this.getPersonalizedGuidance(bazi, deity),
        dailyPractice: this.getDailyPractice(bazi, deity)
      }
      matches.push(match)
    }

    // 按匹配度排序
    matches.sort((a, b) => b.compatibility - a.compatibility)

    return {
      primaryDeity: matches[0],
      secondaryDeities: matches.slice(1, 4),
      seasonalDeity: this.getSeasonalDeity(matches, new Date()),
      explanation: this.generateExplanation(bazi, matches[0])
    }
  }

  /**
   * 计算神仙匹配度
   */
  private static calculateDeityCompatibility(bazi: BaziAnalysis, deity: Deity): number {
    let score = 50 // 基础分

    // 五行匹配
    if (deity.compatibility.bestElements.includes(bazi.chart.dayMaster)) {
      score += 30
    } else if (deity.compatibility.goodElements.includes(bazi.chart.dayMaster)) {
      score += 20
    } else if (deity.compatibility.neutralElements.includes(bazi.chart.dayMaster)) {
      score += 10
    } else if (deity.compatibility.poorElements.includes(bazi.chart.dayMaster)) {
      score -= 10
    }

    // 缺失元素补充
    if (bazi.elementBalance.missing.includes(deity.element)) {
      score += 25
    }

    // 性格匹配
    const personalityMatch = this.calculatePersonalityMatch(bazi.personalityTraits, deity.personality)
    score += personalityMatch * 15

    // 需求匹配
    if (this.hasCareerNeeds(bazi) && deity.domain.includes('事业')) score += 10
    if (this.hasHealthNeeds(bazi) && deity.domain.includes('健康')) score += 10
    if (this.hasWisdomNeeds(bazi) && deity.domain.includes('智慧')) score += 10
    if (this.hasRelationshipNeeds(bazi) && deity.domain.includes('感情')) score += 10

    return Math.min(Math.max(score, 0), 100)
  }

  /**
   * 计算性格匹配度
   */
  private static calculatePersonalityMatch(userTraits: PersonalityTraits, deityPersonality: string[]): number {
    let matchScore = 0
    let totalTraits = userTraits.mainTraits.length + deityPersonality.length

    userTraits.mainTraits.forEach(trait => {
      if (deityPersonality.some(dp => dp.includes(trait) || trait.includes(dp))) {
        matchScore += 2
      }
    })

    return totalTraits > 0 ? matchScore / totalTraits : 0
  }

  /**
   * 检查是否有事业需求
   */
  private static hasCareerNeeds(bazi: BaziAnalysis): boolean {
    return bazi.elementBalance.missing.length > 1 || bazi.weaknesses.some(w => w.includes('事业'))
  }

  /**
   * 检查是否有健康需求
   */
  private static hasHealthNeeds(bazi: BaziAnalysis): boolean {
    return bazi.elementBalance.excessive.length > 1 || bazi.healthSuggestions.length > 2
  }

  /**
   * 检查是否有智慧需求
   */
  private static hasWisdomNeeds(bazi: BaziAnalysis): boolean {
    return bazi.chart.dayMaster === 'water' || bazi.personalityTraits.decisionMaking === 'emotional'
  }

  /**
   * 检查是否有感情需求
   */
  private static hasRelationshipNeeds(bazi: BaziAnalysis): boolean {
    return bazi.personalityTraits.socialTendency === 'introverted' || bazi.relationshipSuggestions.length > 1
  }

  /**
   * 获取匹配原因
   */
  private static getMatchReasons(bazi: BaziAnalysis, deity: Deity, compatibility: number): string[] {
    const reasons: string[] = []

    if (deity.compatibility.bestElements.includes(bazi.chart.dayMaster)) {
      reasons.push(`您的日主${bazi.chart.dayMaster}与${deity.chineseName}的能量完美契合`)
    }

    if (bazi.elementBalance.missing.includes(deity.element)) {
      reasons.push(`${deity.chineseName}可以补充您所缺失的${deity.element}能量`)
    }

    const personalityMatches = bazi.personalityTraits.mainTraits.filter(trait => 
      deity.personality.some(dp => dp.includes(trait))
    )
    if (personalityMatches.length > 0) {
      reasons.push(`您的性格特质"${personalityMatches.join('、')}"与${deity.chineseName}相应`)
    }

    if (compatibility > 80) {
      reasons.push(`极高的灵性共鸣，${deity.chineseName}将是您最好的修行伙伴`)
    }

    return reasons
  }

  /**
   * 获取个性化祝福
   */
  private static getPersonalizedBlessings(bazi: BaziAnalysis, deity: Deity): string[] {
    const blessings: string[] = [...deity.blessings]

    // 根据缺失元素添加特定祝福
    bazi.elementBalance.missing.forEach(element => {
      switch (element) {
        case 'wood':
          if (deity.domain.includes('成长') || deity.element === 'wood') {
            blessings.push('愿您如春木般茁壮成长')
          }
          break
        case 'fire':
          if (deity.domain.includes('光明') || deity.element === 'fire') {
            blessings.push('愿您内心充满光明与热情')
          }
          break
        case 'earth':
          if (deity.domain.includes('稳定') || deity.element === 'earth') {
            blessings.push('愿您心境稳如泰山')
          }
          break
        case 'metal':
          if (deity.domain.includes('正义') || deity.element === 'metal') {
            blessings.push('愿您意志如金石般坚定')
          }
          break
        case 'water':
          if (deity.domain.includes('智慧') || deity.element === 'water') {
            blessings.push('愿您智慧如海般深邃')
          }
          break
      }
    })

    return blessings.slice(0, 5) // 返回前5个最相关的祝福
  }

  /**
   * 获取个性化指导
   */
  private static getPersonalizedGuidance(bazi: BaziAnalysis, deity: Deity): string[] {
    const guidance: string[] = []

    if (deity.id === 'guanyin') {
      guidance.push('每日诵读《心经》，培养慈悲心')
      guidance.push('在困难时默念观音圣号，获得内心平静')
      if (bazi.personalityTraits.stressHandling === 'sensitive') {
        guidance.push('学习观音菩萨的包容，以慈悲化解烦恼')
      }
    }

    if (deity.id === 'wenshu' && bazi.elementBalance.missing.includes('wood')) {
      guidance.push('多读经典智慧书籍，开启智慧之门')
      guidance.push('在学习时祈请文殊菩萨加持')
    }

    if (deity.id === 'caishen' && bazi.elementBalance.missing.includes('earth')) {
      guidance.push('正当经营，以德聚财')
      guidance.push('多做布施，财布施得财富报')
    }

    // 通用指导
    guidance.push(`学习${deity.chineseName}的品格，在生活中践行`)
    guidance.push(`定期向${deity.chineseName}祈祷，建立心灵连接`)

    return guidance
  }

  /**
   * 获取日常修行建议
   */
  private static getDailyPractice(bazi: BaziAnalysis, deity: Deity): string[] {
    const practices: string[] = []

    // 基于神仙特色的修行
    if (deity.mantra) {
      practices.push(`每日念诵"${deity.mantra}"108遍`)
    }

    switch (deity.id) {
      case 'guanyin':
        practices.push('晨起向观音菩萨问安，感恩新的一天')
        practices.push('睡前诵读《心经》，净化心灵')
        break
      case 'wenshu':
        practices.push('读书前祈请文殊菩萨加持智慧')
        practices.push('每日学习一段经典，增长智慧')
        break
      case 'amitabha':
        practices.push('每日念佛，回向众生')
        practices.push('观想西方极乐净土，净化心境')
        break
    }

    // 基于五行缺失的补充修行
    bazi.elementBalance.missing.forEach(element => {
      switch (element) {
        case 'wood':
          if (deity.element === 'wood') {
            practices.push('多接触绿色植物，在自然中修行')
          }
          break
        case 'fire':
          if (deity.element === 'fire') {
            practices.push('面向阳光静坐，吸收正能量')
          }
          break
        case 'water':
          if (deity.element === 'water') {
            practices.push('听流水声冥想，培养智慧')
          }
          break
      }
    })

    return practices
  }

  /**
   * 获取季节性推荐神仙
   */
  private static getSeasonalDeity(matches: DeityMatch[], date: Date): DeityMatch | undefined {
    const month = date.getMonth() + 1
    let seasonalDeityId: string

    if (month >= 3 && month <= 5) { // 春季
      seasonalDeityId = 'wenshu' // 文殊菩萨，对应智慧成长
    } else if (month >= 6 && month <= 8) { // 夏季
      seasonalDeityId = 'amitabha' // 阿弥陀佛，对应光明
    } else if (month >= 9 && month <= 11) { // 秋季
      seasonalDeityId = 'guanyin' // 观音菩萨，对应收获与感恩
    } else { // 冬季
      seasonalDeityId = 'dizang' // 地藏菩萨，对应深度修行
    }

    return matches.find(match => match.deity.id === seasonalDeityId)
  }

  /**
   * 生成推荐说明
   */
  private static generateExplanation(bazi: BaziAnalysis, primaryMatch: DeityMatch): string {
    const deity = primaryMatch.deity
    const compatibility = primaryMatch.compatibility

    let explanation = `根据您的八字分析，${deity.chineseName}与您的匹配度高达${compatibility}%。`

    if (compatibility > 90) {
      explanation += `这是极为难得的高匹配度，说明您与${deity.chineseName}有着深厚的灵性缘分。`
    } else if (compatibility > 80) {
      explanation += `这是很高的匹配度，${deity.chineseName}将成为您修行路上的良师益友。`
    } else if (compatibility > 70) {
      explanation += `这是较好的匹配度，${deity.chineseName}能够给您带来很好的帮助和指导。`
    }

    explanation += `建议您以${deity.chineseName}为主要修行对象，同时可以参考其他几位神仙的指导。`

    return explanation
  }

  /**
   * 保存用户八字信息
   */
  static saveBaziInfo(birthInfo: UserBirthInfo, analysis: BaziAnalysis, recommendation: DeityRecommendation): void {
    const userBaziData = {
      birthInfo,
      analysis,
      recommendation,
      updatedAt: new Date()
    }

    localStorage.setItem(`${this.STORAGE_PREFIX}-user-bazi`, JSON.stringify(userBaziData))
  }

  /**
   * 获取用户八字信息
   */
  static getUserBaziInfo(): { birthInfo: UserBirthInfo; analysis: BaziAnalysis; recommendation: DeityRecommendation } | null {
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}-user-bazi`)
    if (!stored) return null

    try {
      const data = JSON.parse(stored)
      return {
        birthInfo: data.birthInfo,
        analysis: {
          ...data.analysis,
          chart: {
            ...data.analysis.chart,
            calculatedAt: new Date(data.analysis.chart.calculatedAt)
          }
        },
        recommendation: data.recommendation
      }
    } catch (error) {
      console.error('解析八字信息失败:', error)
      return null
    }
  }

  /**
   * 检查是否已设置八字
   */
  static hasBaziInfo(): boolean {
    return this.getUserBaziInfo() !== null
  }
}