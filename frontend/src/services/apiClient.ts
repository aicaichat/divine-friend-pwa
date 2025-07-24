// API客户端 - 连接前端和后端八字计算API

const API_BASE_URL = 'http://localhost:5001/api'

export interface BaziRequest {
  birthdate: string
  name: string
  gender: string
}

export interface BaziResponse {
  success: boolean
  data?: any
  error?: string
}

export class APIClient {
  private static baseURL = API_BASE_URL

  /**
   * 计算八字
   */
  static async calculateBazi(request: BaziRequest): Promise<BaziResponse> {
    try {
      const response = await fetch(`${this.baseURL}/calculate-bazi`, {
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
      console.error('API调用失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 匹配神仙
   */
  static async matchDeities(baziAnalysis: any): Promise<BaziResponse> {
    try {
      const response = await fetch(`${this.baseURL}/match-deities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bazi_analysis: baziAnalysis
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('神仙匹配API调用失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 详细分析八字
   */
  static async analyzeBazi(baziChart: any, analysisType: string): Promise<BaziResponse> {
    try {
      const response = await fetch(`${this.baseURL}/analyze-bazi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bazi_chart: baziChart,
          analysis_type: analysisType
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('八字分析API调用失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 健康检查
   */
  static async healthCheck(): Promise<BaziResponse> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('健康检查失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }
} 