import { useState, useEffect, useCallback } from 'react'

export interface ScriptureProgress {
  scriptureId: string
  totalReadings: number
  currentStreak: number
  longestStreak: number
  lastReadDate: string | null
  totalTimeSpent: number // 分钟
  completionRate: number // 0-100
  readingHistory: ReadingSession[]
}

export interface ReadingSession {
  date: string
  duration: number // 分钟
  paragraphsRead: number
  readingMode: 'silent' | 'recitation' | 'follow' | 'meditation'
  completed: boolean
}

export interface ScriptureStats {
  totalScriptures: number
  totalReadings: number
  totalTimeSpent: number
  averageCompletionRate: number
  currentStreak: number
  longestStreak: number
}

const STORAGE_KEY = 'scripture_progress'

export const useScriptureProgress = (scriptureId?: string) => {
  const [progress, setProgress] = useState<ScriptureProgress | null>(null)
  const [allProgress, setAllProgress] = useState<Record<string, ScriptureProgress>>({})
  const [stats, setStats] = useState<ScriptureStats>({
    totalScriptures: 0,
    totalReadings: 0,
    totalTimeSpent: 0,
    averageCompletionRate: 0,
    currentStreak: 0,
    longestStreak: 0
  })

  // 加载进度数据
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY)
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setAllProgress(parsed)
        
        if (scriptureId && parsed[scriptureId]) {
          setProgress(parsed[scriptureId])
        }
        
        // 计算总体统计
        calculateStats(parsed)
      } catch (error) {
        console.error('Failed to load scripture progress:', error)
      }
    }
  }, [scriptureId])

  // 保存进度数据
  const saveProgress = useCallback((newProgress: Record<string, ScriptureProgress>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress))
    setAllProgress(newProgress)
  }, [])

  // 记录阅读会话
  const recordReadingSession = useCallback((
    scriptureId: string,
    session: Omit<ReadingSession, 'date'>
  ) => {
    const newSession: ReadingSession = {
      ...session,
      date: new Date().toISOString().split('T')[0]
    }

    setAllProgress(prev => {
      const current = prev[scriptureId] || {
        scriptureId,
        totalReadings: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null,
        totalTimeSpent: 0,
        completionRate: 0,
        readingHistory: []
      }

      const updated = {
        ...current,
        totalReadings: current.totalReadings + 1,
        totalTimeSpent: current.totalTimeSpent + session.duration,
        lastReadDate: newSession.date,
        readingHistory: [...current.readingHistory, newSession]
      }

      // 计算连续天数
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      if (current.lastReadDate === yesterday || current.lastReadDate === today) {
        updated.currentStreak = current.currentStreak + 1
      } else if (current.lastReadDate !== today) {
        updated.currentStreak = 1
      }
      
      updated.longestStreak = Math.max(updated.currentStreak, current.longestStreak)

      const newAllProgress = { ...prev, [scriptureId]: updated }
      saveProgress(newAllProgress)
      
      if (scriptureId === progress?.scriptureId) {
        setProgress(updated)
      }
      
      return newAllProgress
    })
  }, [progress, saveProgress])

  // 计算总体统计
  const calculateStats = useCallback((progressData: Record<string, ScriptureProgress>) => {
    const scriptures = Object.values(progressData)
    const totalScriptures = scriptures.length
    const totalReadings = scriptures.reduce((sum, s) => sum + s.totalReadings, 0)
    const totalTimeSpent = scriptures.reduce((sum, s) => sum + s.totalTimeSpent, 0)
    const averageCompletionRate = totalScriptures > 0 
      ? scriptures.reduce((sum, s) => sum + s.completionRate, 0) / totalScriptures 
      : 0

    // 计算总体连续天数
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    let currentStreak = 0
    let longestStreak = 0
    
    // 检查今天是否有任何经文被阅读
    const hasReadToday = scriptures.some(s => s.lastReadDate === today)
    const hasReadYesterday = scriptures.some(s => s.lastReadDate === yesterday)
    
    if (hasReadToday) {
      // 计算连续天数逻辑
      const dates = new Set<string>()
      scriptures.forEach(s => {
        s.readingHistory.forEach(h => dates.add(h.date))
      })
      
      const sortedDates = Array.from(dates).sort().reverse()
      let streak = 0
      let currentDate = new Date()
      
      for (const date of sortedDates) {
        const dateObj = new Date(date)
        const diffDays = Math.floor((currentDate.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 1) {
          streak++
          currentDate = dateObj
        } else {
          break
        }
      }
      
      currentStreak = streak
      longestStreak = Math.max(...scriptures.map(s => s.longestStreak))
    }

    setStats({
      totalScriptures,
      totalReadings,
      totalTimeSpent,
      averageCompletionRate,
      currentStreak,
      longestStreak
    })
  }, [])

  // 获取经文进度
  const getScriptureProgress = useCallback((id: string): ScriptureProgress | null => {
    return allProgress[id] || null
  }, [allProgress])

  // 重置进度
  const resetProgress = useCallback((scriptureId: string) => {
    setAllProgress(prev => {
      const { [scriptureId]: removed, ...rest } = prev
      saveProgress(rest)
      if (scriptureId === progress?.scriptureId) {
        setProgress(null)
      }
      return rest
    })
  }, [progress, saveProgress])

  // 更新完成率
  const updateCompletionRate = useCallback((scriptureId: string, rate: number) => {
    setAllProgress(prev => {
      if (!prev[scriptureId]) return prev
      
      const updated = {
        ...prev[scriptureId],
        completionRate: Math.min(100, Math.max(0, rate))
      }
      
      const newAllProgress = { ...prev, [scriptureId]: updated }
      saveProgress(newAllProgress)
      
      if (scriptureId === progress?.scriptureId) {
        setProgress(updated)
      }
      
      return newAllProgress
    })
  }, [progress, saveProgress])

  return {
    progress,
    allProgress,
    stats,
    recordReadingSession,
    getScriptureProgress,
    resetProgress,
    updateCompletionRate
  }
} 