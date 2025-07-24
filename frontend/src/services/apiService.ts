/**
 * API服务 - 与后端通信
 */

const API_BASE_URL = 'http://localhost:5001/api'

export interface DailyFortuneAPIRequest {
  birthdate: string
  name: string
  gender: string
  target_date?: string
}

export interface DailyFortuneAPIResponse {
  success: boolean
  data: {
    date: string
    overall_score: number
    overall_level: string
    overall_description: string
    career_fortune: {
      score: number
      advice: string[]
      lucky_time: string
      description: string
    }
    wealth_fortune: {
      score: number
      advice: string[]
      lucky_time: string
      description: string
    }
    health_fortune: {
      score: number
      advice: string[]
      lucky_time: string
      description: string
    }
    relationship_fortune: {
      score: number
      advice: string[]
      lucky_time: string
      description: string
    }
    study_fortune: {
      score: number
      advice: string[]
      lucky_time: string
      description: string
    }
    lucky_directions: string[]
    lucky_colors: string[]
    lucky_numbers: number[]
    avoid_directions: string[]
    avoid_colors: string[]
    recommended_activities: string[]
    avoid_activities: string[]
    timing_advice: Record<string, string>
    bazi_analysis: any
    dayun_info: any
  }
}

export interface BaziAPIRequest {
  birthdate: string
  name: string
  gender: string
}

export interface BaziAPIResponse {
  success: boolean
  data: {
    bazi_chart: any
    analysis: any
    lunar_date: any
  }
}

class ApiService {
  /**
   * 计算今日运势
   */
  async calculateDailyFortune(request: DailyFortuneAPIRequest): Promise<DailyFortuneAPIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculate-daily-fortune`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('计算今日运势失败:', error)
      throw error
    }
  }

  /**
   * 计算八字
   */
  async calculateBazi(request: BaziAPIRequest): Promise<BaziAPIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculate-bazi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('计算八字失败:', error)
      throw error
    }
  }

  /**
   * 神仙匹配
   */
  async matchDeities(baziAnalysis: any, userPreferences?: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/match-deities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bazi_analysis: baziAnalysis,
          user_preferences: userPreferences
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('神仙匹配失败:', error)
      throw error
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      return response.ok
    } catch (error) {
      console.error('健康检查失败:', error)
      return false
    }
  }
}

export const apiService = new ApiService() 