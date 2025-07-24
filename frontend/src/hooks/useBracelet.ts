// 手串状态管理 Hook

import { useState, useEffect, useCallback } from 'react'
import type { BraceletInfo, BraceletStatus, MeritRecord } from '../types/bracelet'
import { BraceletAPIService, MeritService } from '../services/braceletAPI'

export interface UseBraceletResult {
  braceletInfo: BraceletInfo | null
  status: BraceletStatus
  meritRecord: MeritRecord | null
  loading: boolean
  error: string | null
  
  // 操作方法
  verifyBracelet: (braceletId: string) => Promise<void>
  addMerit: (amount?: number) => void
  refreshStatus: () => Promise<void>
  clearError: () => void
}

export const useBracelet = (initialBraceletId?: string): UseBraceletResult => {
  const [braceletInfo, setBraceletInfo] = useState<BraceletInfo | null>(null)
  const [status, setStatus] = useState<BraceletStatus>('disconnected')
  const [meritRecord, setMeritRecord] = useState<MeritRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 验证手串
  const verifyBracelet = useCallback(async (braceletId: string) => {
    if (!braceletId.trim()) {
      setError('请输入有效的手串编号')
      return
    }

    setLoading(true)
    setError(null)
    setStatus('verifying')

    try {
      // 1. 获取手串信息
      const info = await BraceletAPIService.getBraceletInfo(braceletId)
      setBraceletInfo(info)

      // 2. 检查连接状态
      const connectionStatus = await BraceletAPIService.getBraceletStatus(braceletId)
      setStatus(connectionStatus)

      // 3. 加载功德记录
      const merit = MeritService.getMeritRecord(braceletId)
      setMeritRecord({
        id: `merit-${braceletId}`,
        braceletId,
        count: merit.count,
        lastUpdated: merit.lastUpdated,
        dailyCount: merit.dailyCount,
        totalDays: merit.totalDays
      })

      // 4. 存储最后使用的手串ID
      localStorage.setItem('divine-friend-last-bracelet-id', braceletId)

    } catch (err) {
      console.error('手串验证失败:', err)
      setError(err instanceof Error ? err.message : '手串验证失败')
      setStatus('error')
      setBraceletInfo(null)
      setMeritRecord(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // 增加功德
  const addMerit = useCallback((amount: number = 1) => {
    if (!braceletInfo) {
      setError('请先验证手串')
      return
    }

    try {
      const result = MeritService.addMerit(braceletInfo.id, amount)
      
      setMeritRecord(prev => ({
        id: prev?.id || `merit-${braceletInfo.id}`,
        braceletId: braceletInfo.id,
        count: result.count,
        lastUpdated: result.lastUpdated,
        dailyCount: result.dailyCount,
        totalDays: result.totalDays
      }))

      // 触觉反馈
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50])
      }

    } catch (err) {
      console.error('添加功德失败:', err)
      setError('添加功德失败')
    }
  }, [braceletInfo])

  // 刷新状态
  const refreshStatus = useCallback(async () => {
    if (!braceletInfo) return

    try {
      const connectionStatus = await BraceletAPIService.getBraceletStatus(braceletInfo.id)
      setStatus(connectionStatus)
    } catch (err) {
      console.error('刷新状态失败:', err)
      setStatus('error')
    }
  }, [braceletInfo])

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 初始化：尝试加载上次使用的手串
  useEffect(() => {
    const loadLastBracelet = async () => {
      const lastBraceletId = initialBraceletId || localStorage.getItem('divine-friend-last-bracelet-id')
      
      if (lastBraceletId) {
        await verifyBracelet(lastBraceletId)
      }
    }

    loadLastBracelet()
  }, [initialBraceletId, verifyBracelet])

  // 定期检查连接状态
  useEffect(() => {
    if (!braceletInfo) return

    const checkConnection = setInterval(async () => {
      if (status === 'connected') {
        try {
          const newStatus = await BraceletAPIService.getBraceletStatus(braceletInfo.id)
          if (newStatus !== status) {
            setStatus(newStatus)
          }
        } catch {
          setStatus('disconnected')
        }
      }
    }, 30000) // 每30秒检查一次

    return () => clearInterval(checkConnection)
  }, [braceletInfo, status])

  return {
    braceletInfo,
    status,
    meritRecord,
    loading,
    error,
    verifyBracelet,
    addMerit,
    refreshStatus,
    clearError
  }
}