/**
 * 前端数据库服务
 * 基于IndexedDB的完整数据持久化解决方案
 */

import { UserBirthInfo, BaziAnalysis, DeityRecommendation } from '../types/bazi'
import { ChatMessage, BraceletInfo, TaskItem, BlessingItem } from '../types/index'

// 数据库配置
const DB_NAME = 'divine-friend-db'
const DB_VERSION = 1

// 对象存储配置
const STORES = {
  users: 'users',
  baziAnalysis: 'bazi-analysis',
  deityRecommendations: 'deity-recommendations',
  chatHistory: 'chat-history',
  braceletInfo: 'bracelet-info',
  userTasks: 'user-tasks',
  blessings: 'blessings',
  userSettings: 'user-settings',
  syncQueue: 'sync-queue',
  cacheData: 'cache-data'
} as const

// 数据接口定义
interface UserData {
  id: string
  profile: {
    name: string
    birthInfo: UserBirthInfo
    joinDate: Date
    lastLogin: Date
    preferences: UserPreferences
  }
  stats: {
    totalDays: number
    conversationCount: number
    blessingsReceived: number
    tasksCompleted: number
    level: 'beginner' | 'growing' | 'master'
  }
}

interface UserPreferences {
  theme: 'auto' | 'light' | 'dark'
  notifications: {
    dailyFortune: boolean
    deityGuidance: boolean
    reminders: boolean
  }
  privacy: {
    shareProfile: boolean
    allowAnalytics: boolean
  }
  deity: {
    primaryDeityId: string
    chatStyle: 'formal' | 'casual' | 'poetic'
  }
}

interface StoredBaziAnalysis {
  id: string
  userId: string
  birthInfo: UserBirthInfo
  analysis: BaziAnalysis
  createdAt: Date
  updatedAt: Date
  synced: boolean
}

interface StoredDeityRecommendation {
  id: string
  userId: string
  baziAnalysisId: string
  recommendation: DeityRecommendation
  createdAt: Date
  synced: boolean
}

interface StoredChatMessage extends ChatMessage {
  id: string
  userId: string
  deityId: string
  sessionId: string
  synced: boolean
}

interface SyncQueueItem {
  id: string
  type: 'bazi' | 'chat' | 'user' | 'blessing'
  data: any
  action: 'create' | 'update' | 'delete'
  timestamp: Date
  retryCount: number
  lastError?: string
}

class DatabaseService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Failed to open database:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('Database opened successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        this.createObjectStores(db)
      }
    })

    return this.initPromise
  }

  /**
   * 创建对象存储
   */
  private createObjectStores(db: IDBDatabase): void {
    // 用户数据存储
    if (!db.objectStoreNames.contains(STORES.users)) {
      const userStore = db.createObjectStore(STORES.users, { keyPath: 'id' })
      userStore.createIndex('name', 'profile.name', { unique: false })
      userStore.createIndex('joinDate', 'profile.joinDate', { unique: false })
    }

    // 八字分析存储
    if (!db.objectStoreNames.contains(STORES.baziAnalysis)) {
      const baziStore = db.createObjectStore(STORES.baziAnalysis, { keyPath: 'id' })
      baziStore.createIndex('userId', 'userId', { unique: false })
      baziStore.createIndex('createdAt', 'createdAt', { unique: false })
      baziStore.createIndex('synced', 'synced', { unique: false })
    }

    // 神仙推荐存储
    if (!db.objectStoreNames.contains(STORES.deityRecommendations)) {
      const deityStore = db.createObjectStore(STORES.deityRecommendations, { keyPath: 'id' })
      deityStore.createIndex('userId', 'userId', { unique: false })
      deityStore.createIndex('baziAnalysisId', 'baziAnalysisId', { unique: false })
    }

    // 聊天历史存储
    if (!db.objectStoreNames.contains(STORES.chatHistory)) {
      const chatStore = db.createObjectStore(STORES.chatHistory, { keyPath: 'id' })
      chatStore.createIndex('userId', 'userId', { unique: false })
      chatStore.createIndex('deityId', 'deityId', { unique: false })
      chatStore.createIndex('sessionId', 'sessionId', { unique: false })
      chatStore.createIndex('timestamp', 'timestamp', { unique: false })
    }

    // 手串信息存储
    if (!db.objectStoreNames.contains(STORES.braceletInfo)) {
      const braceletStore = db.createObjectStore(STORES.braceletInfo, { keyPath: 'id' })
      braceletStore.createIndex('userId', 'userId', { unique: false })
    }

    // 用户任务存储
    if (!db.objectStoreNames.contains(STORES.userTasks)) {
      const taskStore = db.createObjectStore(STORES.userTasks, { keyPath: 'id' })
      taskStore.createIndex('userId', 'userId', { unique: false })
      taskStore.createIndex('completed', 'completed', { unique: false })
    }

    // 祝福存储
    if (!db.objectStoreNames.contains(STORES.blessings)) {
      const blessingStore = db.createObjectStore(STORES.blessings, { keyPath: 'id' })
      blessingStore.createIndex('userId', 'userId', { unique: false })
      blessingStore.createIndex('timestamp', 'timestamp', { unique: false })
    }

    // 用户设置存储
    if (!db.objectStoreNames.contains(STORES.userSettings)) {
      db.createObjectStore(STORES.userSettings, { keyPath: 'userId' })
    }

    // 同步队列存储
    if (!db.objectStoreNames.contains(STORES.syncQueue)) {
      const syncStore = db.createObjectStore(STORES.syncQueue, { keyPath: 'id' })
      syncStore.createIndex('type', 'type', { unique: false })
      syncStore.createIndex('timestamp', 'timestamp', { unique: false })
    }

    // 缓存数据存储
    if (!db.objectStoreNames.contains(STORES.cacheData)) {
      const cacheStore = db.createObjectStore(STORES.cacheData, { keyPath: 'key' })
      cacheStore.createIndex('category', 'category', { unique: false })
      cacheStore.createIndex('expiry', 'expiry', { unique: false })
    }
  }

  /**
   * 获取事务
   */
  private getTransaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly'): IDBTransaction {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db.transaction(storeNames, mode)
  }

  /**
   * Promise包装器
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== 用户数据管理 ====================

  /**
   * 保存用户数据
   */
  async saveUser(userData: UserData): Promise<void> {
    await this.init()
    const transaction = this.getTransaction(STORES.users, 'readwrite')
    const store = transaction.objectStore(STORES.users)
    await this.promisifyRequest(store.put(userData))
  }

  /**
   * 获取用户数据
   */
  async getUser(userId: string): Promise<UserData | null> {
    await this.init()
    const transaction = this.getTransaction(STORES.users)
    const store = transaction.objectStore(STORES.users)
    const result = await this.promisifyRequest(store.get(userId))
    return result || null
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<UserData | null> {
    await this.init()
    const transaction = this.getTransaction(STORES.users)
    const store = transaction.objectStore(STORES.users)
    const request = store.openCursor()
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          resolve(cursor.value)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== 八字分析管理 ====================

  /**
   * 保存八字分析
   */
  async saveBaziAnalysis(analysis: StoredBaziAnalysis): Promise<void> {
    await this.init()
    const transaction = this.getTransaction(STORES.baziAnalysis, 'readwrite')
    const store = transaction.objectStore(STORES.baziAnalysis)
    await this.promisifyRequest(store.put(analysis))
  }

  /**
   * 获取用户的八字分析
   */
  async getBaziAnalysis(userId: string): Promise<StoredBaziAnalysis[]> {
    await this.init()
    const transaction = this.getTransaction(STORES.baziAnalysis)
    const store = transaction.objectStore(STORES.baziAnalysis)
    const index = store.index('userId')
    const request = index.getAll(userId)
    return await this.promisifyRequest(request)
  }

  /**
   * 获取最新的八字分析
   */
  async getLatestBaziAnalysis(userId: string): Promise<StoredBaziAnalysis | null> {
    const analyses = await this.getBaziAnalysis(userId)
    if (analyses.length === 0) return null
    
    return analyses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
  }

  // ==================== 神仙推荐管理 ====================

  /**
   * 保存神仙推荐
   */
  async saveDeityRecommendation(recommendation: StoredDeityRecommendation): Promise<void> {
    await this.init()
    const transaction = this.getTransaction(STORES.deityRecommendations, 'readwrite')
    const store = transaction.objectStore(STORES.deityRecommendations)
    await this.promisifyRequest(store.put(recommendation))
  }

  /**
   * 获取用户的神仙推荐
   */
  async getDeityRecommendations(userId: string): Promise<StoredDeityRecommendation[]> {
    await this.init()
    const transaction = this.getTransaction(STORES.deityRecommendations)
    const store = transaction.objectStore(STORES.deityRecommendations)
    const index = store.index('userId')
    const request = index.getAll(userId)
    return await this.promisifyRequest(request)
  }

  // ==================== 聊天历史管理 ====================

  /**
   * 保存聊天消息
   */
  async saveChatMessage(message: StoredChatMessage): Promise<void> {
    await this.init()
    const transaction = this.getTransaction(STORES.chatHistory, 'readwrite')
    const store = transaction.objectStore(STORES.chatHistory)
    await this.promisifyRequest(store.put(message))
  }

  /**
   * 获取聊天历史
   */
  async getChatHistory(userId: string, deityId?: string, limit: number = 100): Promise<StoredChatMessage[]> {
    await this.init()
    const transaction = this.getTransaction(STORES.chatHistory)
    const store = transaction.objectStore(STORES.chatHistory)
    
    let index: IDBIndex
    let keyRange: IDBKeyRange
    
    if (deityId) {
      // 获取特定神仙的聊天记录
      index = store.index('deityId')
      keyRange = IDBKeyRange.only(deityId)
    } else {
      // 获取用户的所有聊天记录
      index = store.index('userId')
      keyRange = IDBKeyRange.only(userId)
    }
    
    return new Promise((resolve, reject) => {
      const messages: StoredChatMessage[] = []
      const request = index.openCursor(keyRange, 'prev') // 倒序获取最新消息
      
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor && messages.length < limit) {
          const message = cursor.value
          if (!deityId || message.deityId === deityId) {
            messages.push(message)
          }
          cursor.continue()
        } else {
          resolve(messages.reverse()) // 返回正序
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 清理旧的聊天记录
   */
  async cleanupOldChatHistory(daysToKeep: number = 30): Promise<void> {
    await this.init()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    const transaction = this.getTransaction(STORES.chatHistory, 'readwrite')
    const store = transaction.objectStore(STORES.chatHistory)
    const index = store.index('timestamp')
    const keyRange = IDBKeyRange.upperBound(cutoffDate)
    
    const request = index.openCursor(keyRange)
    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  }

  // ==================== 同步队列管理 ====================

  /**
   * 添加到同步队列
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    await this.init()
    const syncItem: SyncQueueItem = {
      ...item,
      id: this.generateId(),
      timestamp: new Date(),
      retryCount: 0
    }
    
    const transaction = this.getTransaction(STORES.syncQueue, 'readwrite')
    const store = transaction.objectStore(STORES.syncQueue)
    await this.promisifyRequest(store.put(syncItem))
  }

  /**
   * 获取同步队列
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.init()
    const transaction = this.getTransaction(STORES.syncQueue)
    const store = transaction.objectStore(STORES.syncQueue)
    return await this.promisifyRequest(store.getAll())
  }

  /**
   * 从同步队列移除项目
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    await this.init()
    const transaction = this.getTransaction(STORES.syncQueue, 'readwrite')
    const store = transaction.objectStore(STORES.syncQueue)
    await this.promisifyRequest(store.delete(id))
  }

  /**
   * 更新同步队列项目
   */
  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    await this.init()
    const transaction = this.getTransaction(STORES.syncQueue, 'readwrite')
    const store = transaction.objectStore(STORES.syncQueue)
    await this.promisifyRequest(store.put(item))
  }

  // ==================== 缓存数据管理 ====================

  /**
   * 设置缓存数据
   */
  async setCacheData(key: string, data: any, category: string = 'general', expiryHours: number = 24): Promise<void> {
    await this.init()
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + expiryHours)
    
    const cacheItem = {
      key,
      data,
      category,
      expiry,
      createdAt: new Date()
    }
    
    const transaction = this.getTransaction(STORES.cacheData, 'readwrite')
    const store = transaction.objectStore(STORES.cacheData)
    await this.promisifyRequest(store.put(cacheItem))
  }

  /**
   * 获取缓存数据
   */
  async getCacheData(key: string): Promise<any | null> {
    await this.init()
    const transaction = this.getTransaction(STORES.cacheData)
    const store = transaction.objectStore(STORES.cacheData)
    const result = await this.promisifyRequest(store.get(key))
    
    if (!result) return null
    
    // 检查是否过期
    if (new Date() > result.expiry) {
      // 异步删除过期数据
      this.deleteCacheData(key)
      return null
    }
    
    return result.data
  }

  /**
   * 删除缓存数据
   */
  async deleteCacheData(key: string): Promise<void> {
    await this.init()
    const transaction = this.getTransaction(STORES.cacheData, 'readwrite')
    const store = transaction.objectStore(STORES.cacheData)
    await this.promisifyRequest(store.delete(key))
  }

  /**
   * 清理过期缓存
   */
  async cleanupExpiredCache(): Promise<void> {
    await this.init()
    const now = new Date()
    const transaction = this.getTransaction(STORES.cacheData, 'readwrite')
    const store = transaction.objectStore(STORES.cacheData)
    const index = store.index('expiry')
    const keyRange = IDBKeyRange.upperBound(now)
    
    const request = index.openCursor(keyRange)
    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取数据库统计信息
   */
  async getStats(): Promise<Record<string, number>> {
    await this.init()
    const stats: Record<string, number> = {}
    
    for (const storeName of Object.values(STORES)) {
      const transaction = this.getTransaction(storeName)
      const store = transaction.objectStore(storeName)
      const count = await this.promisifyRequest(store.count())
      stats[storeName] = count
    }
    
    return stats
  }

  /**
   * 清空所有数据
   */
  async clearAllData(): Promise<void> {
    await this.init()
    
    for (const storeName of Object.values(STORES)) {
      const transaction = this.getTransaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      await this.promisifyRequest(store.clear())
    }
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}

// 导出单例实例
export const databaseService = new DatabaseService()

// 导出类型
export type {
  UserData,
  UserPreferences,
  StoredBaziAnalysis,
  StoredDeityRecommendation,
  StoredChatMessage,
  SyncQueueItem
} 