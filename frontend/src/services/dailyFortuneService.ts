/**
 * 今日运势服务 - 东方玄学运势计算系统
 */

export interface DailyFortune {
  date: string
  tianGan: string // 天干
  diZhi: string   // 地支
  wuXing: string  // 五行
  guaXiang: string // 卦象
  zhiXing: string // 值星
  auspicious: string[] // 宜
  taboos: string[] // 忌
  luckyColor: ColorScheme // 幸运色
  luckyDirection: DirectionInfo // 吉方
  fortuneLevel: number // 运势指数 1-100
  blessing: string // 今日法语
  advice: PersonalizedAdvice // 个性化建议
}

export interface ColorScheme {
  primary: string
  secondary: string
  gradient: string
  shadow: string
  name: string
  meaning: string
  chakra: string
  wuXingType: 'gold' | 'wood' | 'water' | 'fire' | 'earth'
}

export interface DirectionInfo {
  name: string
  degrees: number
  gua: string
  guaSymbol: string
  element: string
  color: string
  desc: string
  deity: string
  timing: string
  personality: string
  suitable: string[]
  avoid: string[]
}

export interface PersonalizedAdvice {
  career: string[]    // 事业建议
  relationship: string[] // 感情建议  
  health: string[]    // 健康建议
  wealth: string[]    // 财运建议
  study: string[]     // 学业建议
}

// 五行颜色系统
export const wuXingColorSystem: Record<string, ColorScheme> = {
  gold: {
    primary: '#d4af37',
    secondary: '#f4e4aa', 
    gradient: 'linear-gradient(135deg, #d4af37 0%, #f4e4aa 50%, #fff8dc 100%)',
    shadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
    name: '庚金',
    meaning: '坚毅、果断、财富',
    chakra: '脐轮',
    wuXingType: 'gold'
  },
  wood: {
    primary: '#22c55e',
    secondary: '#86efac',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #86efac 50%, #dcfce7 100%)',
    shadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
    name: '甲木',
    meaning: '生机、成长、希望',
    chakra: '心轮',
    wuXingType: 'wood'
  },
  water: {
    primary: '#3b82f6',
    secondary: '#93c5fd',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #93c5fd 50%, #dbeafe 100%)',
    shadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
    name: '壬水',
    meaning: '智慧、流动、包容',
    chakra: '喉轮',
    wuXingType: 'water'
  },
  fire: {
    primary: '#ef4444',
    secondary: '#fca5a5',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #fca5a5 50%, #fecaca 100%)',
    shadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
    name: '丙火',
    meaning: '热情、活力、光明',
    chakra: '太阳轮',
    wuXingType: 'fire'
  },
  earth: {
    primary: '#a3a3a3',
    secondary: '#d4d4d8',
    gradient: 'linear-gradient(135deg, #a3a3a3 0%, #d4d4d8 50%, #f4f4f5 100%)',
    shadow: '0 4px 20px rgba(163, 163, 163, 0.3)',
    name: '戊土',
    meaning: '稳重、包容、厚德',
    chakra: '根轮',
    wuXingType: 'earth'
  }
}

// 八卦方位系统
export const bagua8Directions: Record<string, DirectionInfo> = {
  '正东': {
    name: '正东',
    degrees: 90,
    gua: '震',
    guaSymbol: '☳',
    element: '木',
    color: '#22c55e',
    desc: '震雷动，万物始生',
    deity: '青龙',
    timing: '卯时(5-7点)',
    personality: '积极进取，勇于开拓',
    suitable: ['创业', '求职', '投资', '学习新技能'],
    avoid: ['冲动决定', '与人争执']
  },
  '东南': {
    name: '东南',
    degrees: 135,
    gua: '巽',
    guaSymbol: '☴',
    element: '木',
    color: '#16a34a',
    desc: '巽风顺，财运亨通',
    deity: '风神',
    timing: '辰巳时(7-11点)',
    personality: '温和谦逊，善于沟通',
    suitable: ['商务谈判', '社交活动', '求财', '旅行'],
    avoid: ['固执己见', '闭门造车']
  },
  '正南': {
    name: '正南',
    degrees: 180,
    gua: '离',
    guaSymbol: '☲',
    element: '火',
    color: '#ef4444',
    desc: '离火明，声名远播',
    deity: '朱雀',
    timing: '午时(11-13点)',
    personality: '光明磊落，富有魅力',
    suitable: ['演讲展示', '艺术创作', '求名声', '庆典活动'],
    avoid: ['心浮气躁', '争强好胜']
  },
  '西南': {
    name: '西南',
    degrees: 225,
    gua: '坤',
    guaSymbol: '☷',
    element: '土',
    color: '#a3a3a3',
    desc: '坤地厚，德载万物',
    deity: '大地母神',
    timing: '未申时(13-17点)',
    personality: '温厚包容，默默奉献',
    suitable: ['团队合作', '照顾家庭', '房产事务', '慈善公益'],
    avoid: ['过分顺从', '缺乏主见']
  },
  '正西': {
    name: '正西',
    degrees: 270,
    gua: '兑',
    guaSymbol: '☱',
    element: '金',
    color: '#f59e0b',
    desc: '兑泽润，口才辩佳',
    deity: '白虎',
    timing: '酉时(17-19点)',
    personality: '能言善辩，社交活跃',
    suitable: ['演讲辩论', '销售推广', '娱乐休闲', '艺术表演'],
    avoid: ['口舌是非', '过度享乐']
  },
  '西北': {
    name: '西北',
    degrees: 315,
    gua: '乾',
    guaSymbol: '☰',
    element: '金',
    color: '#d4af37',
    desc: '乾天行，刚健中正',
    deity: '天帝',
    timing: '戌亥时(19-23点)',
    personality: '威严正直，领导有方',
    suitable: ['重大决策', '领导管理', '求官升职', '长者拜访'],
    avoid: ['刚愎自用', '过于严厉']
  },
  '正北': {
    name: '正北',
    degrees: 0,
    gua: '坎',
    guaSymbol: '☵',
    element: '水',
    color: '#3b82f6',
    desc: '坎水智，深谋远虑',
    deity: '玄武',
    timing: '子时(23-1点)',
    personality: '深沉智慧，善于思考',
    suitable: ['学习研究', '冥想修行', '策划谋略', '水上活动'],
    avoid: ['过度忧虑', '钻牛角尖']
  },
  '东北': {
    name: '东北',
    degrees: 45,
    gua: '艮',
    guaSymbol: '☶',
    element: '土',
    color: '#78716c',
    desc: '艮山稳，止静安详',
    deity: '山神',
    timing: '丑寅时(1-5点)',
    personality: '稳重踏实，坚持不懈',
    suitable: ['健康养生', '储蓄理财', '房产投资', '技能精进'],
    avoid: ['过分保守', '缺乏变通']
  }
}

// 禅意法语库
const dailyBlessings = {
  excellent: [
    "心如明镜台，时时勤拂拭，今日花开见佛性",
    "慈悲喜舍四无量，今日福慧双修行",
    "山不转水转，水不转心转，万事随缘自在",
    "一花一世界，一叶一菩提，今日因缘殊胜"
  ],
  good: [
    "静水流深，大智若愚，今日宜内敛修心",
    "千里之行始于足下，今日一步一个脚印",
    "宝剑锋从磨砺出，梅花香自苦寒来",
    "海纳百川有容乃大，今日宜包容待人"
  ],
  normal: [
    "平常心是道，今日但行好事莫问前程",
    "知足常乐，今日珍惜当下所有",
    "退一步海阔天空，今日宜以柔克刚",
    "落红不是无情物，化作春泥更护花"
  ],
  poor: [
    "山重水复疑无路，柳暗花明又一村",
    "宝剑锋从磨砺出，今日磨难皆是修行",
    "冬天来了春天还会远吗，坚持就是胜利",
    "莫愁前路无知己，天下谁人不识君"
  ]
}

class DailyFortuneService {
  // 天干地支数组
  private tianGanArray = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  private diZhiArray = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  
  // 计算今日运势
  calculateDailyFortune(date: Date = new Date()): DailyFortune {
    // 1. 计算今日天干地支
    const {tianGan, diZhi} = this.getTianGanDiZhi(date)
    
    // 2. 计算五行
    const wuXing = this.getWuXing(tianGan, diZhi)
    
    // 3. 计算卦象
    const guaXiang = this.calculateGua(date)
    
    // 4. 计算值星
    const zhiXing = this.getZhiXing(tianGan, diZhi)
    
    // 5. 计算运势指数
    const fortuneLevel = this.calculateFortuneLevel(date, tianGan, diZhi)
    
    // 6. 获取幸运色
    const luckyColor = this.getLuckyColor(wuXing)
    
    // 7. 获取吉方
    const luckyDirection = this.getLuckyDirection(guaXiang)
    
    // 8. 生成宜忌
    const {auspicious, taboos} = this.generateAuspiciousTaboos(wuXing, fortuneLevel)
    
    // 9. 选择法语
    const blessing = this.selectBlessing(fortuneLevel)
    
    // 10. 生成建议
    const advice = this.generateAdvice(fortuneLevel, wuXing)
    
    return {
      date: date.toISOString().split('T')[0],
      tianGan,
      diZhi,
      wuXing,
      guaXiang,
      zhiXing,
      auspicious,
      taboos,
      luckyColor,
      luckyDirection,
      fortuneLevel,
      blessing,
      advice
    }
  }
  
  // 计算天干地支
  private getTianGanDiZhi(date: Date): {tianGan: string, diZhi: string} {
    // 简化算法：基于日期计算
    const daysSince1900 = Math.floor((date.getTime() - new Date(1900, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
    
    const tianGanIndex = daysSince1900 % 10
    const diZhiIndex = daysSince1900 % 12
    
    return {
      tianGan: this.tianGanArray[tianGanIndex],
      diZhi: this.diZhiArray[diZhiIndex]
    }
  }
  
  // 获取五行
  private getWuXing(tianGan: string, diZhi: string): string {
    const tianGanWuXing: Record<string, string> = {
      '甲': 'wood', '乙': 'wood',
      '丙': 'fire', '丁': 'fire', 
      '戊': 'earth', '己': 'earth',
      '庚': 'gold', '辛': 'gold',
      '壬': 'water', '癸': 'water'
    }
    
    return tianGanWuXing[tianGan] || 'earth'
  }
  
  // 计算卦象
  private calculateGua(date: Date): string {
    const hour = date.getHours()
    const guaArray = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
    return guaArray[hour % 8]
  }
  
  // 获取值星
  private getZhiXing(tianGan: string, diZhi: string): string {
    const zhiXingArray = ['太乙', '摄提', '单阏', '执徐', '大荒落', '敦牂', '协洽', '涒滩', '作噩', '阉茂', '大渊献', '困敦']
    const combinedIndex = (this.tianGanArray.indexOf(tianGan) + this.diZhiArray.indexOf(diZhi)) % 12
    return zhiXingArray[combinedIndex]
  }
  
  // 计算运势指数
  private calculateFortuneLevel(date: Date, tianGan: string, diZhi: string): number {
    const baseScore = 50
    const dayOfWeek = date.getDay()
    const dayOfMonth = date.getDate()
    
    // 基于多个因素计算
    let score = baseScore
    score += (dayOfWeek * 5) // 星期影响
    score += (dayOfMonth % 10) * 3 // 日期影响
    score += Math.random() * 20 - 10 // 随机因素
    
    return Math.max(10, Math.min(100, Math.round(score)))
  }
  
  // 获取幸运色
  private getLuckyColor(wuXing: string): ColorScheme {
    return wuXingColorSystem[wuXing] || wuXingColorSystem.earth
  }
  
  // 获取吉方
  private getLuckyDirection(guaXiang: string): DirectionInfo {
    const guaToDirection: Record<string, string> = {
      '乾': '西北', '兑': '正西', '离': '正南', '震': '正东',
      '巽': '东南', '坎': '正北', '艮': '东北', '坤': '西南'
    }
    
    const directionName = guaToDirection[guaXiang] || '正东'
    return bagua8Directions[directionName]
  }
  
  // 生成宜忌
  private generateAuspiciousTaboos(wuXing: string, fortuneLevel: number): {auspicious: string[], taboos: string[]} {
    const allAuspicious = [
      '祈福', '拜神', '开业', '签约', '投资', '学习', '运动', '社交',
      '旅行', '相亲', '表白', '搬家', '装修', '理财', '考试', '面试'
    ]
    
    const allTaboos = [
      '争执', '借贷', '熬夜', '暴饮暴食', '冒险', '赌博', '分手', '冷战',
      '手术', '搬迁', '开工', '破土', '出远门', '签重要合同', '做重大决定'
    ]
    
    // 根据运势等级和五行选择
    const auspiciousCount = fortuneLevel > 70 ? 6 : fortuneLevel > 40 ? 4 : 3
    const tabooCount = fortuneLevel < 30 ? 6 : fortuneLevel < 60 ? 4 : 3
    
    const auspicious = this.shuffleArray([...allAuspicious]).slice(0, auspiciousCount)
    const taboos = this.shuffleArray([...allTaboos]).slice(0, tabooCount)
    
    return { auspicious, taboos }
  }
  
  // 选择法语
  private selectBlessing(fortuneLevel: number): string {
    let category: keyof typeof dailyBlessings
    
    if (fortuneLevel >= 80) category = 'excellent'
    else if (fortuneLevel >= 60) category = 'good'
    else if (fortuneLevel >= 40) category = 'normal'
    else category = 'poor'
    
    const blessings = dailyBlessings[category]
    return blessings[Math.floor(Math.random() * blessings.length)]
  }
  
  // 生成建议
  private generateAdvice(fortuneLevel: number, wuXing: string): PersonalizedAdvice {
    const advice: PersonalizedAdvice = {
      career: [],
      relationship: [],
      health: [],
      wealth: [],
      study: []
    }
    
    if (fortuneLevel >= 80) {
      advice.career.push("今日贵人运旺，宜主动出击，把握机遇")
      advice.wealth.push("财星高照，适合投资理财，但需量力而行")
      advice.relationship.push("桃花运佳，单身者有望遇到意中人")
    } else if (fortuneLevel <= 30) {
      advice.career.push("今日宜守不宜攻，专注内务整理")
      advice.health.push("多休息，避免过度劳累，静心养神")
      advice.relationship.push("避免争执，宜包容理解")
    }
    
    // 根据五行添加特定建议
    switch (wuXing) {
      case 'wood':
        advice.health.push("多接触绿色植物，到公园散步")
        advice.study.push("适合学习新知识，创意思维活跃")
        break
      case 'fire':
        advice.career.push("适合展示才华，参加社交活动")
        advice.relationship.push("热情主动，但避免过于急躁")
        break
      case 'earth':
        advice.wealth.push("适合房产投资，稳健理财")
        advice.health.push("注意脾胃健康，饮食规律")
        break
      case 'gold':
        advice.career.push("适合做决断，处理金融事务")
        advice.study.push("逻辑思维清晰，适合分析问题")
        break
      case 'water':
        advice.study.push("智慧如海，适合深度学习")
        advice.health.push("多喝水，注意肾脏健康")
        break
    }
    
    return advice
  }
  
  // 工具函数：打乱数组
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
}

// 导出服务实例
export const dailyFortuneService = new DailyFortuneService()