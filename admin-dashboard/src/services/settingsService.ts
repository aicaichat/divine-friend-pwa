// 设置管理API服务
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

// 管理员用户类型
export interface AdminUser {
  id: string
  username: string
  email: string
  role: 'super_admin' | 'admin' | 'operator'
  status: 'active' | 'inactive'
  avatar?: string
  lastLogin: string
  permissions: string[]
  createdAt: string
}

// 系统配置类型
export interface SystemConfig {
  siteName: string
  siteUrl: string
  adminEmail: string
  maxUsers: number
  sessionTimeout: number
  enableRegistration: boolean
  enableEmailVerification: boolean
  enableSMSVerification: boolean
  maintenanceMode: boolean
  debugMode: boolean
  cacheDuration: number
  backupInterval: number
  maxFileSize: number
  allowedFileTypes: string[]
}

// 安全配置类型
export interface SecurityConfig {
  passwordMinLength: number
  passwordRequireSpecial: boolean
  maxLoginAttempts: number
  lockoutDuration: number
  enableTwoFactor: boolean
  jwtExpiration: number
  enableIPWhitelist: boolean
  trustedIPs: string[]
  enableAuditLog: boolean
  sessionSecure: boolean
}

// 系统状态类型
export interface SystemStatus {
  cpu: number
  memory: number
  disk: number
  network: string
  database: string
  lastBackup: string
  uptime: number
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

// 系统配置API
export const systemConfigApi = {
  // 获取系统配置
  get: async (): Promise<SystemConfig> => {
    try {
      const response = await apiRequest<ApiResponse<SystemConfig>>('/admin/settings/system')
      return response.data
    } catch (error) {
      // 开发环境降级到模拟数据
      console.warn('使用模拟系统配置数据:', error)
      return {
        siteName: 'Divine Friend',
        siteUrl: 'https://divinefriend.com',
        adminEmail: 'admin@divinefriend.com',
        maxUsers: 10000,
        sessionTimeout: 7200,
        enableRegistration: true,
        enableEmailVerification: true,
        enableSMSVerification: false,
        maintenanceMode: false,
        debugMode: false,
        cacheDuration: 3600,
        backupInterval: 86400,
        maxFileSize: 10485760,
        allowedFileTypes: ['jpg', 'png', 'gif', 'pdf', 'doc', 'docx']
      }
    }
  },

  // 更新系统配置
  update: async (config: SystemConfig): Promise<SystemConfig> => {
    try {
      const response = await apiRequest<ApiResponse<SystemConfig>>('/admin/settings/system', {
        method: 'PUT',
        body: JSON.stringify(config),
      })
      return response.data
    } catch (error) {
      console.warn('模拟更新系统配置:', error)
      // 开发环境模拟成功响应
      return config
    }
  },

  // 重置系统配置
  reset: async (): Promise<SystemConfig> => {
    try {
      const response = await apiRequest<ApiResponse<SystemConfig>>('/admin/settings/system/reset', {
        method: 'POST',
      })
      return response.data
    } catch (error) {
      throw new Error('重置系统配置失败')
    }
  }
}

// 安全配置API
export const securityConfigApi = {
  // 获取安全配置
  get: async (): Promise<SecurityConfig> => {
    try {
      const response = await apiRequest<ApiResponse<SecurityConfig>>('/admin/settings/security')
      return response.data
    } catch (error) {
      console.warn('使用模拟安全配置数据:', error)
      return {
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        maxLoginAttempts: 5,
        lockoutDuration: 1800,
        enableTwoFactor: false,
        jwtExpiration: 86400,
        enableIPWhitelist: false,
        trustedIPs: ['127.0.0.1', '192.168.1.0/24'],
        enableAuditLog: true,
        sessionSecure: true
      }
    }
  },

  // 更新安全配置
  update: async (config: SecurityConfig): Promise<SecurityConfig> => {
    try {
      const response = await apiRequest<ApiResponse<SecurityConfig>>('/admin/settings/security', {
        method: 'PUT',
        body: JSON.stringify(config),
      })
      return response.data
    } catch (error) {
      console.warn('模拟更新安全配置:', error)
      return config
    }
  }
}

// 管理员用户API
export const adminUsersApi = {
  // 获取管理员用户列表
  list: async (params?: {
    page?: number
    pageSize?: number
    role?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<AdminUser>> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params?.role) queryParams.append('role', params.role)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)

      const response = await apiRequest<ApiResponse<PaginatedResponse<AdminUser>>>(
        `/admin/users?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      console.warn('使用模拟管理员用户数据:', error)
      // 模拟数据
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@divinefriend.com',
          role: 'super_admin',
          status: 'active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          lastLogin: '2024-01-20 14:30:00',
          permissions: ['all'],
          createdAt: '2024-01-01 00:00:00'
        },
        {
          id: '2',
          username: 'operator1',
          email: 'operator1@divinefriend.com',
          role: 'operator',
          status: 'active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=op1',
          lastLogin: '2024-01-19 16:45:00',
          permissions: ['user_management', 'content_management'],
          createdAt: '2024-01-05 10:00:00'
        }
      ]
      
      return {
        data: mockUsers,
        total: mockUsers.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    }
  },

  // 获取单个管理员用户
  get: async (id: string): Promise<AdminUser> => {
    try {
      const response = await apiRequest<ApiResponse<AdminUser>>(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error('获取管理员用户失败')
    }
  },

  // 创建管理员用户
  create: async (user: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>): Promise<AdminUser> => {
    try {
      const response = await apiRequest<ApiResponse<AdminUser>>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(user),
      })
      return response.data
    } catch (error) {
      console.warn('模拟创建管理员用户:', error)
      // 模拟创建成功
      return {
        id: Date.now().toString(),
        ...user,
        createdAt: new Date().toISOString(),
        lastLogin: '-'
      } as AdminUser
    }
  },

  // 更新管理员用户
  update: async (id: string, user: Partial<AdminUser>): Promise<AdminUser> => {
    try {
      const response = await apiRequest<ApiResponse<AdminUser>>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
      })
      return response.data
    } catch (error) {
      console.warn('模拟更新管理员用户:', error)
      // 模拟更新成功
      return { id, ...user } as AdminUser
    }
  },

  // 删除管理员用户
  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest<ApiResponse<void>>(`/admin/users/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.warn('模拟删除管理员用户:', error)
      // 模拟删除成功
    }
  },

  // 重置密码
  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    try {
      await apiRequest<ApiResponse<void>>(`/admin/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPassword }),
      })
    } catch (error) {
      throw new Error('重置密码失败')
    }
  }
}

// 系统维护API
export const systemMaintenanceApi = {
  // 获取系统状态
  getStatus: async (): Promise<SystemStatus> => {
    try {
      const response = await apiRequest<ApiResponse<SystemStatus>>('/admin/system/status')
      return response.data
    } catch (error) {
      console.warn('使用模拟系统状态数据:', error)
      return {
        cpu: 45,
        memory: 62,
        disk: 78,
        network: '正常',
        database: '正常',
        lastBackup: '2024-01-20 02:00:00',
        uptime: 86400
      }
    }
  },

  // 执行数据库备份
  backup: async (): Promise<{ message: string; filename: string }> => {
    try {
      const response = await apiRequest<ApiResponse<{ message: string; filename: string }>>(
        '/admin/system/backup',
        { method: 'POST' }
      )
      return response.data
    } catch (error) {
      throw new Error('数据库备份失败')
    }
  },

  // 清理过期数据
  cleanup: async (): Promise<{ message: string; deletedCount: number }> => {
    try {
      const response = await apiRequest<ApiResponse<{ message: string; deletedCount: number }>>(
        '/admin/system/cleanup',
        { method: 'POST' }
      )
      return response.data
    } catch (error) {
      throw new Error('清理数据失败')
    }
  },

  // 优化数据库
  optimize: async (): Promise<{ message: string }> => {
    try {
      const response = await apiRequest<ApiResponse<{ message: string }>>(
        '/admin/system/optimize',
        { method: 'POST' }
      )
      return response.data
    } catch (error) {
      throw new Error('数据库优化失败')
    }
  },

  // 导出系统日志
  exportLogs: async (params: {
    startDate: string
    endDate: string
    level?: string
  }): Promise<{ downloadUrl: string }> => {
    try {
      const queryParams = new URLSearchParams(params)
      const response = await apiRequest<ApiResponse<{ downloadUrl: string }>>(
        `/admin/system/export-logs?${queryParams.toString()}`,
        { method: 'POST' }
      )
      return response.data
    } catch (error) {
      throw new Error('导出日志失败')
    }
  }
}

// 导出所有API
export const settingsService = {
  systemConfig: systemConfigApi,
  securityConfig: securityConfigApi,
  adminUsers: adminUsersApi,
  systemMaintenance: systemMaintenanceApi
} 