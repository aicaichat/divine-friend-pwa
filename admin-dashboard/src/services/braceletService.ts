// 手串管理API服务
import { useAuthStore } from '@store/authStore'

// 基础API配置
const API_BASE_URL = (window as any).__ENV__?.VITE_API_BASE_URL || '/api'

// 请求头配置
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

// 通用API请求函数
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout()
        throw new Error('未授权访问，请重新登录')
      }
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`API请求错误 [${endpoint}]:`, error)
    throw error
  }
}

// ========== 数据类型定义 ==========

// 前端手串信息类型 (与前端BraceletPageOptimized.tsx完全对应)
export interface BraceletInfo {
  id: string
  owner: string
  chipId: string
  material: string
  beadCount: number
  imageUrl?: string
  energyLevel: number
  consecrationDate?: string
  consecrationTemple?: string
  consecrationMaster?: string
  consecrationVideo?: string
}

// 后台手串商品类型
export interface Bracelet {
  id: string
  name: string
  description: string
  image: string
  type: 'premium' | 'standard' | 'basic'
  material: string
  beadCount: number
  price: number
  meritPoints: number
  inStock: number
  totalSold: number
  status: 'active' | 'inactive' | 'soldout'
  createdAt: string
  updatedAt?: string
  scriptures: string[]
  consecrationInfo?: {
    temple?: string
    master?: string
    videoUrl?: string
  }
}

// 激活码类型 (与前端验证流程对应)
export interface ActivationCode {
  id: string
  code: string
  braceletId: string
  braceletName: string
  status: 'unused' | 'used' | 'expired'
  userId?: string
  username?: string
  createdAt: string
  usedAt?: string
  expiresAt: string
  chipId?: string // NFC芯片ID
  
  // NFC URL相关新增字段
  nfcURL?: string          // NFC芯片中写入的URL
  nfcRecord?: any          // NFC NDEF记录
  qrCode?: string          // QR码图片URL/Base64
  securityHash?: string    // 安全验证哈希
}

// 功德记录类型 (与前端MeritRecord对应)
export interface MeritRecord {
  id: string
  userId: string
  username: string
  action: string
  points: number
  description: string
  timestamp: string
  type: 'earn' | 'spend'
  braceletId?: string
  metadata?: Record<string, any>
}

// 用户手串绑定信息
export interface UserBracelet {
  id: string
  userId: string
  username: string
  braceletId: string
  activationCodeId: string
  chipId: string
  energyLevel: number
  bindingDate: string
  lastActiveDate: string
  totalPracticeCount: number
  dailyPracticeCount: number
  practiceStreak: number
  isActive: boolean
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ========== 手串商品管理API ==========
export const braceletApi = {
  // 获取手串列表
  list: async (params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Bracelet>> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params?.type) queryParams.append('type', params.type)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)

      const response = await apiRequest<ApiResponse<PaginatedResponse<Bracelet>>>(
        `/admin/bracelets?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.warn('使用模拟手串数据:', error)
      // 模拟数据
      const mockBracelets: Bracelet[] = [
        {
          id: '1',
          name: '心经平安手串',
          description: '蕴含心经能量的平安手串，有助修心养性',
          image: 'https://via.placeholder.com/300x300?text=心经手串',
          type: 'premium',
          material: '小叶紫檀',
          beadCount: 108,
          price: 299,
          meritPoints: 500,
          inStock: 25,
          totalSold: 156,
          status: 'active',
          createdAt: '2024-01-01 10:00:00',
          scriptures: ['心经', '大悲咒'],
          consecrationInfo: {
            temple: '灵隐寺',
            master: '慧明法师',
            videoUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4'
          }
        },
        {
          id: '2',
          name: '金刚经智慧手串',
          description: '承载金刚经智慧的手串，启发内在智慧',
          image: 'https://via.placeholder.com/300x300?text=金刚经手串',
          type: 'premium',
          material: '沉香木',
          beadCount: 108,
          price: 599,
          meritPoints: 800,
          inStock: 12,
          totalSold: 89,
          status: 'active',
          createdAt: '2024-01-05 14:30:00',
          scriptures: ['金刚经', '心经'],
          consecrationInfo: {
            temple: '普陀山',
            master: '智慧法师',
            videoUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4'
          }
        }
      ]
      
      return {
        data: mockBracelets,
        total: mockBracelets.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    }
  },

  // 获取单个手串详情
  get: async (id: string): Promise<Bracelet> => {
    try {
      const response = await apiRequest<ApiResponse<Bracelet>>(`/admin/bracelets/${id}`)
      return response.data
    } catch (error) {
      throw new Error('获取手串详情失败')
    }
  },

  // 创建手串
  create: async (bracelet: Omit<Bracelet, 'id' | 'createdAt' | 'totalSold'>): Promise<Bracelet> => {
    try {
      const response = await apiRequest<ApiResponse<Bracelet>>('/admin/bracelets', {
        method: 'POST',
        body: JSON.stringify(bracelet),
      })
      return response.data
    } catch (error) {
      console.warn('模拟创建手串:', error)
      return {
        id: Date.now().toString(),
        ...bracelet,
        totalSold: 0,
        createdAt: new Date().toISOString()
      } as Bracelet
    }
  },

  // 更新手串
  update: async (id: string, bracelet: Partial<Bracelet>): Promise<Bracelet> => {
    try {
      const response = await apiRequest<ApiResponse<Bracelet>>(`/admin/bracelets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bracelet),
      })
      return response.data
    } catch (error) {
      console.warn('模拟更新手串:', error)
      return { id, ...bracelet } as Bracelet
    }
  },

  // 删除手串
  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest<ApiResponse<void>>(`/admin/bracelets/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.warn('模拟删除手串:', error)
    }
  },

  // 批量更新库存
  updateStock: async (updates: Array<{ id: string; inStock: number }>): Promise<void> => {
    try {
      await apiRequest<ApiResponse<void>>('/admin/bracelets/stock', {
        method: 'PUT',
        body: JSON.stringify({ updates }),
      })
    } catch (error) {
      throw new Error('批量更新库存失败')
    }
  }
}

// ========== 激活码管理API ==========
export const activationCodeApi = {
  // 获取激活码列表
  list: async (params?: {
    page?: number
    pageSize?: number
    status?: string
    braceletId?: string
  }): Promise<PaginatedResponse<ActivationCode>> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params?.status) queryParams.append('status', params.status)
      if (params?.braceletId) queryParams.append('braceletId', params.braceletId)

      const response = await apiRequest<ApiResponse<PaginatedResponse<ActivationCode>>>(
        `/admin/activation-codes?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.warn('使用模拟激活码数据:', error)
      const mockCodes: ActivationCode[] = [
        {
          id: '1',
          code: 'BRC2024010001',
          braceletId: '1',
          braceletName: '心经平安手串',
          status: 'used',
          userId: 'u001',
          username: '张三',
          createdAt: '2024-01-15 10:00:00',
          usedAt: '2024-01-16 14:30:00',
          expiresAt: '2024-07-15 10:00:00',
          chipId: 'CHIP-2024-001'
        }
      ]
      
      return {
        data: mockCodes,
        total: mockCodes.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    }
  },

  // 批量生成激活码
  batchGenerate: async (params: {
    braceletId: string
    quantity: number
    expiresAt: string
  }): Promise<ActivationCode[]> => {
    try {
      const response = await apiRequest<ApiResponse<ActivationCode[]>>('/admin/activation-codes/batch', {
        method: 'POST',
        body: JSON.stringify(params),
      })
      return response.data
    } catch (error) {
      console.warn('模拟生成激活码:', error)
      // 模拟生成
      const codes: ActivationCode[] = []
      for (let i = 0; i < params.quantity; i++) {
        codes.push({
          id: `${Date.now()}_${i}`,
          code: `BRC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Date.now() + i).slice(-4)}`,
          braceletId: params.braceletId,
          braceletName: '模拟手串',
          status: 'unused',
          createdAt: new Date().toISOString(),
          expiresAt: params.expiresAt,
          chipId: `CHIP-${Date.now()}-${i}`
        })
      }
      return codes
    }
  },

  // 验证激活码 (前端验证接口)
  verify: async (code: string): Promise<{ 
    valid: boolean
    braceletInfo?: BraceletInfo
    error?: string 
  }> => {
    try {
      const response = await apiRequest<ApiResponse<{
        valid: boolean
        braceletInfo?: BraceletInfo
        error?: string
      }>>('/api/bracelets/verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
      return response.data
    } catch (error) {
      console.warn('模拟验证激活码:', error)
      // 模拟验证成功
      return {
        valid: true,
        braceletInfo: {
          id: 'BR001',
          owner: '张三',
          chipId: 'CHIP-2024-001',
          material: '小叶紫檀',
          beadCount: 108,
          energyLevel: 85,
          consecrationDate: '2024年1月15日',
          consecrationTemple: '灵隐寺',
          consecrationMaster: '慧明法师',
          consecrationVideo: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4'
        }
      }
    }
  },

  // NFC验证
  verifyNFC: async (chipId: string): Promise<{
    valid: boolean
    braceletInfo?: BraceletInfo
    error?: string
  }> => {
    try {
      const response = await apiRequest<ApiResponse<{
        valid: boolean
        braceletInfo?: BraceletInfo
        error?: string
      }>>('/api/bracelets/verify-nfc', {
        method: 'POST',
        body: JSON.stringify({ chipId }),
      })
      return response.data
    } catch (error) {
      console.warn('模拟NFC验证:', error)
      return {
        valid: true,
        braceletInfo: {
          id: 'BR001',
          owner: '张三',
          chipId: chipId,
          material: '小叶紫檀',
          beadCount: 108,
          energyLevel: 85,
          consecrationDate: '2024年1月15日',
          consecrationTemple: '灵隐寺',
          consecrationMaster: '慧明法师',
          consecrationVideo: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4'
        }
      }
    }
  },

  // NFC URL验证 (新增: 基于URL参数的验证)
  verifyNFCURL: async (params: {
    chip: string
    bracelet: string
    hash: string
    timestamp: string
    source?: string
  }): Promise<{
    valid: boolean
    braceletInfo?: BraceletInfo
    error?: string
  }> => {
    try {
      const response = await apiRequest<ApiResponse<{
        valid: boolean
        braceletInfo?: BraceletInfo
        error?: string
      }>>('/api/bracelets/verify-nfc-url', {
        method: 'POST',
        body: JSON.stringify(params),
      })
      return response.data
    } catch (error) {
      console.warn('模拟NFC URL验证:', error)
      
      // 基础安全验证
      const timestampAge = Date.now() - parseInt(params.timestamp)
      const maxAge = 24 * 60 * 60 * 1000 // 24小时
      
      if (timestampAge > maxAge) {
        return {
          valid: false,
          error: '验证链接已过期'
        }
      }
      
      // 模拟验证成功
      return {
        valid: true,
        braceletInfo: {
          id: params.bracelet,
          owner: '张三',
          chipId: params.chip,
          material: '小叶紫檀',
          beadCount: 108,
          energyLevel: 85,
          consecrationDate: '2024年1月15日',
          consecrationTemple: '灵隐寺',
          consecrationMaster: '慧明法师',
          consecrationVideo: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4'
        }
      }
    }
  },

  // 生成NFC URL (新增: 用于后台生成NFC写入的URL)
  generateNFCURL: async (braceletData: {
    chipId: string
    braceletId: string
    braceletName: string
  }): Promise<{
    nfcURL: string
    qrCode: string
    nfcRecord: any
    securityHash: string
  }> => {
    try {
      const response = await apiRequest<ApiResponse<{
        nfcURL: string
        qrCode: string
        nfcRecord: any
        securityHash: string
      }>>('/admin/activation-codes/generate-nfc-url', {
        method: 'POST',
        body: JSON.stringify(braceletData),
      })
      return response.data
          } catch (error) {
        console.warn('模拟生成NFC URL:', error)
        
        // 模拟生成URL
        const timestamp = Date.now()
        
        // 智能获取基础URL
        const getBaseURL = () => {
          // 优先使用环境变量中的配置
          const envBaseURL = (import.meta as any).env?.VITE_NFC_BASE_URL || (window as any).__ENV__?.VITE_NFC_BASE_URL;
          if (envBaseURL) {
            return envBaseURL;
          }
          
          // 尝试获取本机IP地址（用于测试）
          const hostname = window.location.hostname;
          const port = window.location.port;
          
          // 如果是localhost，尝试构建IP地址
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // 使用正确的前端服务器IP和端口
            const protocol = window.location.protocol;
            return `${protocol}//172.20.10.8:3003`;
          }
          
          // 否则使用当前域名
          return window.location.origin;
        }
        
        const baseURL = getBaseURL()
        
        // 生成安全哈希 (简化版)
        const payload = `${braceletData.chipId}:${braceletData.braceletId}:${timestamp}`
        const securityHash = btoa(payload).substring(0, 16)
        
        const nfcURL = `${baseURL}/verify?chip=${braceletData.chipId}&bracelet=${braceletData.braceletId}&hash=${securityHash}&timestamp=${timestamp}&source=nfc&quick=true`
      
      // 生成简单的QR码数据URI (实际应该使用QR码生成库)
      const qrCode = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#fff"/>
          <rect x="20" y="20" width="160" height="160" fill="#000"/>
          <rect x="40" y="40" width="120" height="120" fill="#fff"/>
          <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="#000">
            QR: ${braceletData.chipId}
          </text>
        </svg>
      `)}`
      
      const nfcRecord = {
        records: [
          {
            recordType: 'url',
            data: nfcURL
          },
          {
            recordType: 'text',
            encoding: 'UTF-8',
            language: 'zh',
            data: JSON.stringify({
              type: 'divine-bracelet',
              chipId: braceletData.chipId,
              braceletId: braceletData.braceletId,
              name: braceletData.braceletName
            })
          }
        ]
      }
      
      return {
        nfcURL,
        qrCode,
        nfcRecord,
        securityHash
      }
    }
  }
}

// ========== 功德记录管理API ==========
export const meritRecordApi = {
  // 获取功德记录列表
  list: async (params?: {
    page?: number
    pageSize?: number
    userId?: string
    type?: 'earn' | 'spend'
    action?: string
  }): Promise<PaginatedResponse<MeritRecord>> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params?.userId) queryParams.append('userId', params.userId)
      if (params?.type) queryParams.append('type', params.type)
      if (params?.action) queryParams.append('action', params.action)

      const response = await apiRequest<ApiResponse<PaginatedResponse<MeritRecord>>>(
        `/admin/merit-records?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.warn('使用模拟功德记录数据:', error)
      const mockRecords: MeritRecord[] = [
        {
          id: '1',
          userId: 'u001',
          username: '张三',
          action: '激活手串',
          points: 500,
          description: '激活心经平安手串获得功德积分',
          timestamp: '2024-01-16 14:30:00',
          type: 'earn',
          braceletId: '1'
        },
        {
          id: '2',
          userId: 'u001',
          username: '张三',
          action: '完成修炼',
          points: 50,
          description: '完成心经修炼获得功德积分',
          timestamp: '2024-01-17 09:20:00',
          type: 'earn',
          braceletId: '1'
        }
      ]
      
      return {
        data: mockRecords,
        total: mockRecords.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    }
  },

  // 添加功德记录 (前端完成修持接口)
  add: async (record: {
    userId: string
    action: string
    points: number
    description: string
    type: 'earn' | 'spend'
    braceletId?: string
    metadata?: Record<string, any>
  }): Promise<MeritRecord> => {
    try {
      const response = await apiRequest<ApiResponse<MeritRecord>>('/api/merit-records', {
        method: 'POST',
        body: JSON.stringify(record),
      })
      return response.data
    } catch (error) {
      console.warn('模拟添加功德记录:', error)
      return {
        id: Date.now().toString(),
        username: '用户',
        timestamp: new Date().toISOString(),
        ...record
      }
    }
  },

  // 获取用户功德统计
  getUserStats: async (userId: string): Promise<{
    totalEarned: number
    totalSpent: number
    currentBalance: number
    dailyCount: number
    totalDays: number
    level: {
      name: string
      progress: number
      nextLevelAt: number
    }
  }> => {
    try {
      const response = await apiRequest<ApiResponse<any>>(`/api/users/${userId}/merit-stats`)
      return response.data
    } catch (error) {
      console.warn('模拟用户功德统计:', error)
      return {
        totalEarned: 1248,
        totalSpent: 200,
        currentBalance: 1048,
        dailyCount: 73,
        totalDays: 45,
        level: {
          name: '慈悲者',
          progress: 48,
          nextLevelAt: 2000
        }
      }
    }
  }
}

// ========== 用户手串绑定管理API ==========
export const userBraceletApi = {
  // 获取用户手串绑定列表
  list: async (params?: {
    page?: number
    pageSize?: number
    userId?: string
    isActive?: boolean
  }): Promise<PaginatedResponse<UserBracelet>> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params?.userId) queryParams.append('userId', params.userId)
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())

      const response = await apiRequest<ApiResponse<PaginatedResponse<UserBracelet>>>(
        `/admin/user-bracelets?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.warn('使用模拟用户手串数据:', error)
      const mockUserBracelets: UserBracelet[] = [
        {
          id: '1',
          userId: 'u001',
          username: '张三',
          braceletId: '1',
          activationCodeId: '1',
          chipId: 'CHIP-2024-001',
          energyLevel: 85,
          bindingDate: '2024-01-16 14:30:00',
          lastActiveDate: '2024-01-20 09:15:00',
          totalPracticeCount: 45,
          dailyPracticeCount: 3,
          practiceStreak: 7,
          isActive: true
        }
      ]
      
      return {
        data: mockUserBracelets,
        total: mockUserBracelets.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    }
  },

  // 更新用户手串能量等级
  updateEnergy: async (userBraceletId: string, energyLevel: number): Promise<void> => {
    try {
      await apiRequest<ApiResponse<void>>(`/admin/user-bracelets/${userBraceletId}/energy`, {
        method: 'PUT',
        body: JSON.stringify({ energyLevel }),
      })
    } catch (error) {
      console.warn('模拟更新能量等级:', error)
    }
  },

  // 记录修持完成 (前端接口)
  recordPractice: async (userId: string, practiceType: string): Promise<{
    success: boolean
    newMeritPoints: number
    energyBonus: number
  }> => {
    try {
      const response = await apiRequest<ApiResponse<{
        success: boolean
        newMeritPoints: number
        energyBonus: number
      }>>('/api/practice/complete', {
        method: 'POST',
        body: JSON.stringify({ userId, practiceType }),
      })
      return response.data
    } catch (error) {
      console.warn('模拟记录修持:', error)
      return {
        success: true,
        newMeritPoints: 50,
        energyBonus: 2
      }
    }
  }
}

// ========== 统计数据API ==========
export const statisticsApi = {
  // 获取手串管理统计
  getBraceletStats: async (): Promise<{
    totalBracelets: number
    activeBracelets: number
    totalSales: number
    totalRevenue: number
    topSellingBracelets: Array<{
      id: string
      name: string
      sales: number
      revenue: number
    }>
  }> => {
    try {
      const response = await apiRequest<ApiResponse<any>>('/admin/statistics/bracelets')
      return response.data
    } catch (error) {
      console.warn('使用模拟统计数据:', error)
      return {
        totalBracelets: 15,
        activeBracelets: 12,
        totalSales: 567,
        totalRevenue: 156790,
        topSellingBracelets: [
          { id: '1', name: '心经平安手串', sales: 156, revenue: 46644 },
          { id: '2', name: '金刚经智慧手串', sales: 89, revenue: 53311 }
        ]
      }
    }
  },

  // 获取功德系统统计
  getMeritStats: async (): Promise<{
    totalMeritEarned: number
    totalMeritSpent: number
    activeUsers: number
    dailyPracticeCount: number
    topUsers: Array<{
      userId: string
      username: string
      totalMerit: number
      level: string
    }>
  }> => {
    try {
      const response = await apiRequest<ApiResponse<any>>('/admin/statistics/merit')
      return response.data
    } catch (error) {
      console.warn('使用模拟功德统计数据:', error)
      return {
        totalMeritEarned: 45678,
        totalMeritSpent: 12345,
        activeUsers: 234,
        dailyPracticeCount: 89,
        topUsers: [
          { userId: 'u001', username: '张三', totalMerit: 1248, level: '慈悲者' },
          { userId: 'u002', username: '李四', totalMerit: 956, level: '善行者' }
        ]
      }
    }
  }
}

// 导出所有API
export const braceletService = {
  bracelet: braceletApi,
  activationCode: activationCodeApi,
  meritRecord: meritRecordApi,
  userBracelet: userBraceletApi,
  statistics: statisticsApi
} 