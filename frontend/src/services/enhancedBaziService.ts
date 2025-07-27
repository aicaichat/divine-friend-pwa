// 增强的八字服务 - 使用真实的后端API

import { APIClient, BaziRequest } from './apiClient'
import {
  UserBirthInfo,
  BaziChart,
  BaziAnalysis,
  DeityRecommendation
} from '../types/bazi'

export class EnhancedBaziService {
  private static STORAGE_PREFIX = 'divine-bazi-enhanced'

  /**
   * 格式化出生日期为API格式
   */
  private static formatBirthdate(birthInfo: UserBirthInfo): string {
    const year = birthInfo.birthYear
    const month = birthInfo.birthMonth.toString().padStart(2, '0')
    const day = birthInfo.birthDay.toString().padStart(2, '0')
    const hour = birthInfo.birthHour.toString().padStart(2, '0')
    const minute = birthInfo.birthMinute.toString().padStart(2, '0')
    
    return `${year}-${month}-${day}T${hour}:${minute}`
  }

  /**
   * 使用真实API计算八字
   */
  static async calculateBaziWithAPI(birthInfo: UserBirthInfo): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      // 检查API连接
      const healthCheck = await APIClient.healthCheck()
      if (!healthCheck.success) {
        return {
          success: false,
          error: '后端服务不可用，请检查服务器状态'
        }
      }

      // 准备请求数据
      const request: BaziRequest = {
        birthdate: this.formatBirthdate(birthInfo),
        name: birthInfo.name,
        gender: birthInfo.gender
      }

      // 调用API
      const response = await APIClient.calculateBazi(request)
      
      if (response.success && response.data) {
        // 保存到本地存储
        this.saveBaziInfo(birthInfo, response.data)
        return response
      } else {
        return {
          success: false,
          error: response.error || '计算失败'
        }
      }
    } catch (error) {
      console.error('八字计算失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 使用真实API匹配神仙
   */
  static async matchDeitiesWithAPI(baziAnalysis: any, birthYear?: number, userPreferences?: any): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const response = await APIClient.matchDeities(baziAnalysis, birthYear, userPreferences)
      
      if (response.success && response.data) {
        // 保存神仙匹配结果
        this.saveDeityRecommendation(response.data)
        return response
      } else {
        return {
          success: false,
          error: response.error || '神仙匹配失败'
        }
      }
    } catch (error) {
      console.error('神仙匹配失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 使用真实API进行详细分析
   */
  static async analyzeBaziWithAPI(baziChart: any, analysisType: string): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const response = await APIClient.analyzeBazi(baziChart, analysisType)
      
      if (response.success && response.data) {
        return response
      } else {
        return {
          success: false,
          error: response.error || '分析失败'
        }
      }
    } catch (error) {
      console.error('八字分析失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 保存八字信息到本地存储
   */
  private static saveBaziInfo(birthInfo: UserBirthInfo, baziData: any): void {
    try {
      const data = {
        birthInfo,
        baziData,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(`${this.STORAGE_PREFIX}-bazi`, JSON.stringify(data))
    } catch (error) {
      console.error('保存八字信息失败:', error)
    }
  }

  /**
   * 保存神仙推荐到本地存储
   */
  private static saveDeityRecommendation(recommendation: any): void {
    try {
      const data = {
        recommendation,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(`${this.STORAGE_PREFIX}-deity`, JSON.stringify(data))
    } catch (error) {
      console.error('保存神仙推荐失败:', error)
    }
  }

  /**
   * 获取保存的八字信息
   */
  static getSavedBaziInfo(): {
    birthInfo?: UserBirthInfo
    baziData?: any
    timestamp?: string
  } | null {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}-bazi`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('获取保存的八字信息失败:', error)
      return null
    }
  }

  /**
   * 获取保存的神仙推荐
   */
  static getSavedDeityRecommendation(): {
    recommendation?: any
    timestamp?: string
  } | null {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}-deity`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('获取保存的神仙推荐失败:', error)
      return null
    }
  }

  /**
   * 检查是否有保存的数据
   */
  static hasSavedData(): boolean {
    return !!(this.getSavedBaziInfo() || this.getSavedDeityRecommendation())
  }

  /**
   * 清除保存的数据
   */
  static clearSavedData(): void {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}-bazi`)
      localStorage.removeItem(`${this.STORAGE_PREFIX}-deity`)
    } catch (error) {
      console.error('清除保存数据失败:', error)
    }
  }

  /**
   * 获取太岁大将信息
   */
  static async getTaisuiGenerals(params?: {
    year?: number
    element?: string
    search?: string
  }): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const response = await APIClient.getTaisuiGenerals(params)
      return response
    } catch (error) {
      console.error('获取太岁大将失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 获取本命太岁大将
   */
  static async getBirthYearTaisui(birthYear: number, baziAnalysis?: any): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const response = await APIClient.getBirthYearTaisui(birthYear, baziAnalysis)
      
      if (response.success && response.data) {
        // 保存本命太岁信息
        this.saveBirthYearTaisui(response.data)
        return response
      } else {
        return {
          success: false,
          error: response.error || '获取本命太岁失败'
        }
      }
    } catch (error) {
      console.error('获取本命太岁失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 保存本命太岁信息到本地存储
   */
  private static saveBirthYearTaisui(taisuiData: any): void {
    try {
      const data = {
        taisuiData,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(`${this.STORAGE_PREFIX}-birth-taisui`, JSON.stringify(data))
    } catch (error) {
      console.error('保存本命太岁信息失败:', error)
    }
  }

  /**
   * 获取保存的本命太岁信息
   */
  static getSavedBirthYearTaisui(): {
    taisuiData?: any
    timestamp?: string
  } | null {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}-birth-taisui`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('获取保存的本命太岁信息失败:', error)
      return null
    }
  }

  /**
   * 检查API连接状态
   */
  static async checkAPIStatus(): Promise<boolean> {
    try {
      const response = await APIClient.healthCheck()
      return response.success
    } catch (error) {
      console.error('API状态检查失败:', error)
      return false
    }
  }

  /**
   * 获取本命佛信息
   */
  static async getBenmingBuddhas(params?: {
    year?: number
    zodiac?: string
    element?: string
    search?: string
  }): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const response = await APIClient.getBenmingBuddhas(params)
      return response
    } catch (error) {
      console.error('获取本命佛失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 获取本命佛
   */
  static async getBirthYearBuddha(birthYear: number, baziAnalysis?: any): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const response = await APIClient.getBirthYearBuddha(birthYear, baziAnalysis)
      
      if (response.success && response.data) {
        // 保存本命佛信息
        this.saveBirthYearBuddha(response.data)
        return response
      } else {
        return {
          success: false,
          error: response.error || '获取本命佛失败'
        }
      }
    } catch (error) {
      console.error('获取本命佛失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 保存本命佛信息到本地存储
   */
  private static saveBirthYearBuddha(buddhaData: any): void {
    try {
      const data = {
        buddhaData,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(`${this.STORAGE_PREFIX}-birth-buddha`, JSON.stringify(data))
    } catch (error) {
      console.error('保存本命佛信息失败:', error)
    }
  }

  /**
   * 获取保存的本命佛信息
   */
  static getSavedBirthYearBuddha(): {
    buddhaData?: any
    timestamp?: string
  } | null {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}-birth-buddha`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('获取保存的本命佛信息失败:', error)
      return null
    }
  }

  /**
   * 清除所有保存的数据（包括太岁大将和本命佛数据）
   */
  static clearAllSavedData(): void {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}-bazi`)
      localStorage.removeItem(`${this.STORAGE_PREFIX}-deity`)
      localStorage.removeItem(`${this.STORAGE_PREFIX}-birth-taisui`)
      localStorage.removeItem(`${this.STORAGE_PREFIX}-birth-buddha`)
    } catch (error) {
      console.error('清除保存数据失败:', error)
    }
  }
} 