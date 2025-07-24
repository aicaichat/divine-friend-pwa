// 手串API服务

import type { BraceletInfo } from '../types/bracelet'

const API_BASE_URL = 'https://bless.top/wp-json/bracelet-info/v1'

export class BraceletAPIService {
  /**
   * 根据手串ID获取法宝信息
   */
  static async getBraceletInfo(braceletId: string): Promise<BraceletInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/bracelet/${braceletId}`)
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // 数据转换和验证
      return {
        id: braceletId,
        owner: data.owner || '未知主人',
        chipId: data.chipId || braceletId,
        material: data.material || '天然材质',
        beadCount: data.beadCount || '108',
        level: data.level || '初级',
        imageUrl: data.imageUrl || '',
        consecrationDate: data.consecrationDate || '',
        consecrationTemple: data.consecrationTemple || '',
        consecrationHall: data.consecrationHall || '',
        consecrationMaster: data.consecrationMaster || '',
        consecrationVideo: data.consecrationVideo || '',
        lampOfferingVideo: data.lampOfferingVideo || '',
        description: data.description,
        energyLevel: data.energyLevel || 100,
        isActive: data.isActive !== false
      }
    } catch (error) {
      console.error('获取手串信息失败:', error)
      throw new Error('获取法宝信息失败，请检查网络连接或稍后重试')
    }
  }

  /**
   * 验证手串ID是否有效
   */
  static async verifyBraceletId(braceletId: string): Promise<boolean> {
    try {
      await this.getBraceletInfo(braceletId)
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取手串状态（模拟NFC/蓝牙连接）
   */
  static async getBraceletStatus(braceletId: string): Promise<'connected' | 'disconnected'> {
    // 模拟检查手串连接状态
    try {
      const isValid = await this.verifyBraceletId(braceletId)
      
      // 模拟连接检查（实际应用中会检查NFC/蓝牙）
      const isConnected = Math.random() > 0.3 // 70%几率连接成功
      
      return isValid && isConnected ? 'connected' : 'disconnected'
    } catch {
      return 'disconnected'
    }
  }
}

// 功德记录管理
export class MeritService {
  private static STORAGE_PREFIX = 'divine-friend-merit'

  /**
   * 获取功德记录
   */
  static getMeritRecord(braceletId: string): {
    count: number
    dailyCount: number
    totalDays: number
    lastUpdated: Date
  } {
    const key = `${this.STORAGE_PREFIX}-${braceletId}`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const data = JSON.parse(stored)
        return {
          count: data.count || 0,
          dailyCount: data.dailyCount || 0,
          totalDays: data.totalDays || 0,
          lastUpdated: new Date(data.lastUpdated || Date.now())
        }
      } catch (error) {
        console.error('解析功德记录失败:', error)
      }
    }
    
    return {
      count: 0,
      dailyCount: 0,
      totalDays: 0,
      lastUpdated: new Date()
    }
  }

  /**
   * 增加功德
   */
  static addMerit(braceletId: string, amount: number = 1): {
    count: number
    dailyCount: number
    totalDays: number
    isNewDay: boolean
  } {
    const current = this.getMeritRecord(braceletId)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastDate = new Date(current.lastUpdated.getFullYear(), current.lastUpdated.getMonth(), current.lastUpdated.getDate())
    
    const isNewDay = today.getTime() !== lastDate.getTime()
    
    const updated = {
      count: current.count + amount,
      dailyCount: isNewDay ? amount : current.dailyCount + amount,
      totalDays: isNewDay ? current.totalDays + 1 : current.totalDays,
      lastUpdated: now
    }
    
    const key = `${this.STORAGE_PREFIX}-${braceletId}`
    localStorage.setItem(key, JSON.stringify(updated))
    
    return { ...updated, isNewDay }
  }

  /**
   * 获取功德等级
   */
  static getMeritLevel(count: number): {
    level: string
    color: string
    nextLevelAt: number
    progress: number
  } {
    const levels = [
      { level: '初心修行', color: '#fed7d7', min: 0, max: 9 },
      { level: '精进行者', color: '#feebc8', min: 10, max: 49 },
      { level: '虔诚修士', color: '#c6f6d5', min: 50, max: 149 },
      { level: '智慧居士', color: '#bee3f8', min: 150, max: 299 },
      { level: '慈悲菩萨', color: '#d9f2ff', min: 300, max: 499 },
      { level: '圆满大师', color: '#ffd6cc', min: 500, max: Infinity }
    ]
    
    const currentLevel = levels.find(l => count >= l.min && count <= l.max) || levels[0]
    const nextLevel = levels[levels.indexOf(currentLevel) + 1]
    
    const progress = nextLevel 
      ? Math.round(((count - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
      : 100
    
    return {
      level: currentLevel.level,
      color: currentLevel.color,
      nextLevelAt: nextLevel?.min || currentLevel.max,
      progress: Math.min(progress, 100)
    }
  }
}