// 手串能量管理和开光记录服务

export interface EnergyRecord {
  id: string
  braceletId: string
  timestamp: Date
  energyLevel: number
  activity: 'wear' | 'charge' | 'practice' | 'consecration' | 'blessing'
  duration?: number // 分钟
  location?: string
  notes?: string
}

export interface ConsecrationRecord {
  id: string
  braceletId: string
  date: Date
  temple: string
  master: string
  ceremony: string
  witnesses?: string[]
  videoUrl?: string
  imageUrls?: string[]
  blessing: string
  energyBoost: number
}

export interface WearingSession {
  id: string
  braceletId: string
  startTime: Date
  endTime?: Date
  duration: number // 分钟
  activity: 'daily' | 'meditation' | 'work' | 'sleep' | 'ceremony'
  energyGain: number
  location?: string
}

export class EnergyManager {
  private static STORAGE_PREFIX = 'divine-friend-energy'
  
  /**
   * 记录能量变化
   */
  static recordEnergyChange(
    braceletId: string,
    activity: EnergyRecord['activity'],
    energyLevel: number,
    options?: {
      duration?: number
      location?: string
      notes?: string
    }
  ): EnergyRecord {
    const record: EnergyRecord = {
      id: `energy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      braceletId,
      timestamp: new Date(),
      energyLevel,
      activity,
      ...options
    }

    // 存储记录
    this.saveEnergyRecord(record)
    
    // 更新当前能量等级
    this.updateCurrentEnergyLevel(braceletId, energyLevel)
    
    return record
  }

  /**
   * 获取能量记录历史
   */
  static getEnergyHistory(braceletId: string, days: number = 30): EnergyRecord[] {
    const key = `${this.STORAGE_PREFIX}-history-${braceletId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) return []
    
    try {
      const records = JSON.parse(stored) as EnergyRecord[]
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      
      return records
        .filter(record => new Date(record.timestamp) >= cutoffDate)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error('解析能量历史失败:', error)
      return []
    }
  }

  /**
   * 获取当前能量等级
   */
  static getCurrentEnergyLevel(braceletId: string): number {
    const key = `${this.STORAGE_PREFIX}-current-${braceletId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) return 100 // 默认满能量
    
    try {
      const data = JSON.parse(stored)
      return data.level || 100
    } catch (error) {
      console.error('获取当前能量失败:', error)
      return 100
    }
  }

  /**
   * 计算佩戴时长对能量的影响
   */
  static calculateWearingEnergyGain(duration: number, activity: WearingSession['activity']): number {
    const baseRate = 0.1 // 每分钟基础增长率
    const activityMultipliers = {
      daily: 1.0,
      meditation: 2.5,
      work: 0.8,
      sleep: 0.5,
      ceremony: 3.0
    }
    
    const multiplier = activityMultipliers[activity] || 1.0
    return Math.min(duration * baseRate * multiplier, 20) // 最大每次20点
  }

  /**
   * 开始佩戴会话
   */
  static startWearingSession(
    braceletId: string,
    activity: WearingSession['activity'],
    location?: string
  ): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const session = {
      id: sessionId,
      braceletId,
      startTime: new Date(),
      activity,
      location,
      duration: 0,
      energyGain: 0
    }
    
    const key = `${this.STORAGE_PREFIX}-session-${braceletId}`
    localStorage.setItem(key, JSON.stringify(session))
    
    return sessionId
  }

  /**
   * 结束佩戴会话
   */
  static endWearingSession(braceletId: string): WearingSession | null {
    const key = `${this.STORAGE_PREFIX}-session-${braceletId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) return null
    
    try {
      const session = JSON.parse(stored)
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - new Date(session.startTime).getTime()) / 60000) // 分钟
      
      const energyGain = this.calculateWearingEnergyGain(duration, session.activity)
      
      const completedSession: WearingSession = {
        ...session,
        startTime: new Date(session.startTime),
        endTime,
        duration,
        energyGain
      }
      
      // 记录能量变化
      const currentEnergy = this.getCurrentEnergyLevel(braceletId)
      this.recordEnergyChange(
        braceletId,
        'wear',
        Math.min(currentEnergy + energyGain, 100),
        {
          duration,
          location: session.location,
          notes: `${session.activity}佩戴，获得${energyGain.toFixed(1)}能量`
        }
      )
      
      // 存储会话记录
      this.saveWearingSession(completedSession)
      
      // 清除当前会话
      localStorage.removeItem(key)
      
      return completedSession
    } catch (error) {
      console.error('结束佩戴会话失败:', error)
      return null
    }
  }

  /**
   * 模拟能量自然消耗
   */
  static simulateEnergyDecay(braceletId: string): number {
    const currentEnergy = this.getCurrentEnergyLevel(braceletId)
    const lastUpdate = this.getLastEnergyUpdate(braceletId)
    const now = new Date()
    
    // 计算距离上次更新的小时数
    const hoursSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (60 * 60 * 1000))
    
    if (hoursSinceUpdate < 1) return currentEnergy
    
    // 每小时消耗0.5-1.0能量（随机）
    const decayRate = 0.5 + Math.random() * 0.5
    const totalDecay = Math.min(hoursSinceUpdate * decayRate, 20) // 最大一天消耗20点
    
    const newEnergy = Math.max(currentEnergy - totalDecay, 0)
    
    if (newEnergy !== currentEnergy) {
      this.recordEnergyChange(
        braceletId,
        'wear',
        newEnergy,
        {
          notes: `自然消耗 ${totalDecay.toFixed(1)} 能量 (${hoursSinceUpdate}小时)`
        }
      )
    }
    
    return newEnergy
  }

  /**
   * 私有方法：保存能量记录
   */
  private static saveEnergyRecord(record: EnergyRecord): void {
    const key = `${this.STORAGE_PREFIX}-history-${record.braceletId}`
    const stored = localStorage.getItem(key)
    
    let records: EnergyRecord[] = []
    if (stored) {
      try {
        records = JSON.parse(stored)
      } catch (error) {
        console.error('解析现有记录失败:', error)
      }
    }
    
    records.push(record)
    
    // 只保留最近100条记录
    if (records.length > 100) {
      records = records.slice(-100)
    }
    
    localStorage.setItem(key, JSON.stringify(records))
  }

  /**
   * 私有方法：更新当前能量等级
   */
  private static updateCurrentEnergyLevel(braceletId: string, level: number): void {
    const key = `${this.STORAGE_PREFIX}-current-${braceletId}`
    const data = {
      level,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(key, JSON.stringify(data))
  }

  /**
   * 私有方法：获取上次能量更新时间
   */
  private static getLastEnergyUpdate(braceletId: string): Date {
    const key = `${this.STORAGE_PREFIX}-current-${braceletId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) return new Date(Date.now() - 24 * 60 * 60 * 1000) // 默认24小时前
    
    try {
      const data = JSON.parse(stored)
      return new Date(data.lastUpdated || Date.now() - 24 * 60 * 60 * 1000)
    } catch (error) {
      return new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  }

  /**
   * 私有方法：保存佩戴会话记录
   */
  private static saveWearingSession(session: WearingSession): void {
    const key = `${this.STORAGE_PREFIX}-sessions-${session.braceletId}`
    const stored = localStorage.getItem(key)
    
    let sessions: WearingSession[] = []
    if (stored) {
      try {
        sessions = JSON.parse(stored)
      } catch (error) {
        console.error('解析现有会话失败:', error)
      }
    }
    
    sessions.push(session)
    
    // 只保留最近50条会话记录
    if (sessions.length > 50) {
      sessions = sessions.slice(-50)
    }
    
    localStorage.setItem(key, JSON.stringify(sessions))
  }
}

export class ConsecrationManager {
  private static STORAGE_PREFIX = 'divine-friend-consecration'
  
  /**
   * 记录开光仪式
   */
  static recordConsecration(data: Omit<ConsecrationRecord, 'id'>): ConsecrationRecord {
    const record: ConsecrationRecord = {
      ...data,
      id: `consecration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    // 存储开光记录
    this.saveConsecrationRecord(record)
    
    // 记录能量提升
    EnergyManager.recordEnergyChange(
      record.braceletId,
      'consecration',
      100, // 开光后满能量
      {
        location: record.temple,
        notes: `${record.master}法师主持开光仪式，能量提升${record.energyBoost}点`
      }
    )
    
    return record
  }

  /**
   * 获取开光记录
   */
  static getConsecrationRecords(braceletId: string): ConsecrationRecord[] {
    const key = `${this.STORAGE_PREFIX}-${braceletId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) return []
    
    try {
      const records = JSON.parse(stored) as ConsecrationRecord[]
      return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      console.error('解析开光记录失败:', error)
      return []
    }
  }

  /**
   * 获取最新开光记录
   */
  static getLatestConsecration(braceletId: string): ConsecrationRecord | null {
    const records = this.getConsecrationRecords(braceletId)
    return records.length > 0 ? records[0] : null
  }

  /**
   * 验证开光有效性
   */
  static validateConsecration(braceletId: string): {
    isValid: boolean
    daysAge: number
    energyLevel: number
    recommendation?: string
  } {
    const latest = this.getLatestConsecration(braceletId)
    
    if (!latest) {
      return {
        isValid: false,
        daysAge: 0,
        energyLevel: 0,
        recommendation: '建议进行开光仪式以激活法宝能量'
      }
    }
    
    const daysSinceConsecration = Math.floor(
      (Date.now() - new Date(latest.date).getTime()) / (24 * 60 * 60 * 1000)
    )
    
    const currentEnergy = EnergyManager.getCurrentEnergyLevel(braceletId)
    
    let isValid = true
    let recommendation: string | undefined
    
    if (daysSinceConsecration > 365) {
      isValid = false
      recommendation = '开光已超过一年，建议重新开光以恢复最佳效果'
    } else if (currentEnergy < 30) {
      recommendation = '能量较低，建议增加佩戴时间或进行能量充值'
    } else if (daysSinceConsecration > 180) {
      recommendation = '开光已超过半年，可考虑进行能量加持仪式'
    }
    
    return {
      isValid,
      daysAge: daysSinceConsecration,
      energyLevel: currentEnergy,
      recommendation
    }
  }

  /**
   * 私有方法：保存开光记录
   */
  private static saveConsecrationRecord(record: ConsecrationRecord): void {
    const key = `${this.STORAGE_PREFIX}-${record.braceletId}`
    const stored = localStorage.getItem(key)
    
    let records: ConsecrationRecord[] = []
    if (stored) {
      try {
        records = JSON.parse(stored)
      } catch (error) {
        console.error('解析现有开光记录失败:', error)
      }
    }
    
    records.push(record)
    localStorage.setItem(key, JSON.stringify(records))
  }
}

// 能量状态分析工具
export class EnergyAnalyzer {
  /**
   * 分析能量趋势
   */
  static analyzeEnergyTrend(braceletId: string, days: number = 7): {
    trend: 'increasing' | 'stable' | 'decreasing'
    averageLevel: number
    recommendations: string[]
  } {
    const history = EnergyManager.getEnergyHistory(braceletId, days)
    
    if (history.length < 2) {
      return {
        trend: 'stable',
        averageLevel: EnergyManager.getCurrentEnergyLevel(braceletId),
        recommendations: ['建议增加佩戴时间以积累更多能量数据']
      }
    }
    
    // 计算平均能量
    const averageLevel = history.reduce((sum, record) => sum + record.energyLevel, 0) / history.length
    
    // 分析趋势
    const recentAvg = history.slice(0, Math.floor(history.length / 2))
      .reduce((sum, record) => sum + record.energyLevel, 0) / Math.floor(history.length / 2)
    const olderAvg = history.slice(Math.floor(history.length / 2))
      .reduce((sum, record) => sum + record.energyLevel, 0) / Math.ceil(history.length / 2)
    
    let trend: 'increasing' | 'stable' | 'decreasing'
    if (recentAvg - olderAvg > 5) {
      trend = 'increasing'
    } else if (olderAvg - recentAvg > 5) {
      trend = 'decreasing'
    } else {
      trend = 'stable'
    }
    
    // 生成建议
    const recommendations: string[] = []
    
    if (averageLevel < 50) {
      recommendations.push('能量水平较低，建议增加佩戴时间')
      recommendations.push('可尝试冥想或诵经来提升能量')
    } else if (averageLevel < 80) {
      recommendations.push('能量水平良好，保持当前的佩戴习惯')
    } else {
      recommendations.push('能量水平优秀，法宝与您的连接很好')
    }
    
    if (trend === 'decreasing') {
      recommendations.push('注意能量下降趋势，检查是否佩戴时间不足')
    }
    
    return {
      trend,
      averageLevel: Math.round(averageLevel * 10) / 10,
      recommendations
    }
  }

  /**
   * 生成个性化能量管理建议
   */
  static generatePersonalizedAdvice(braceletId: string): string[] {
    const currentEnergy = EnergyManager.getCurrentEnergyLevel(braceletId)
    const trend = this.analyzeEnergyTrend(braceletId)
    const consecration = ConsecrationManager.validateConsecration(braceletId)
    
    const advice: string[] = []
    
    // 基于当前能量水平
    if (currentEnergy >= 90) {
      advice.push('✨ 能量充沛，是处理重要事务的好时机')
    } else if (currentEnergy >= 70) {
      advice.push('🌟 能量良好，适合日常活动和轻度冥想')
    } else if (currentEnergy >= 50) {
      advice.push('💫 能量中等，建议增加佩戴时间或进行短暂冥想')
    } else {
      advice.push('🔋 能量较低，建议多佩戴并减少负面情绪')
    }
    
    // 基于趋势
    if (trend.trend === 'increasing') {
      advice.push('📈 能量呈上升趋势，继续保持良好习惯')
    } else if (trend.trend === 'decreasing') {
      advice.push('📉 注意能量下降，可能需要调整生活节奏')
    }
    
    // 基于开光状态
    if (consecration.recommendation) {
      advice.push(`🏛️ ${consecration.recommendation}`)
    }
    
    return advice
  }
}