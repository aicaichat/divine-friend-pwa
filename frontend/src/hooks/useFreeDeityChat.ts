/**
 * 免费神仙对话Hook
 * 使用本地AI引擎，无需付费API
 */

import { useState, useCallback, useRef } from 'react'
import { freeAI, type DeityPersonality } from '../utils/free-ai-engine'

interface ChatMessage {
  id: string
  role: 'user' | 'deity'
  content: string
  timestamp: number
  deityId: string
  isTyping?: boolean
}

interface UseFreeDeityChat {
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  sendMessage: (content: string, deityId: string) => Promise<void>
  clearHistory: () => void
  retryLastMessage: () => Promise<void>
  isAPIConfigured: boolean
  getQuickSuggestions: (deityId: string) => string[]
  getDeityGreeting: (deityId: string) => string
  getDeityInfo: (deityId: string) => DeityPersonality | null
  getChatStats: () => { messageCount: number; topics: string[]; emotion: string }
}

export const useFreeDeityChat = (): UseFreeDeityChat => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const lastMessageRef = useRef<{ content: string; deityId: string } | null>(null)
  
  // 免费AI始终可用
  const isAPIConfigured = true
  
  // 生成消息ID
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // 添加消息到聊天历史
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])
  
  // 更新消息
  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ))
  }, [])
  
  // 模拟打字效果
  const simulateTyping = useCallback(async (messageId: string, text: string) => {
    setIsTyping(true)
    
    // 逐字显示效果
    let displayText = ''
    const chars = text.split('')
    
    for (let i = 0; i < chars.length; i++) {
      displayText += chars[i]
      updateMessage(messageId, { 
        content: displayText,
        isTyping: i < chars.length - 1
      })
      
      // 调整打字速度
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50))
    }
    
    // 完成打字
    updateMessage(messageId, { isTyping: false })
    setIsTyping(false)
  }, [updateMessage])
  
  // 发送消息
  const sendMessage = useCallback(async (content: string, deityId: string) => {
    if (!content.trim()) return
    
    setError(null)
    lastMessageRef.current = { content, deityId }
    
    // 添加用户消息
    const userMessage = addMessage({
      role: 'user',
      content: content.trim(),
      deityId
    })
    
    // 添加神仙消息占位符
    const deityMessage = addMessage({
      role: 'deity',
      content: '',
      deityId,
      isTyping: true
    })
    
    setIsLoading(true)
    
    try {
      // 使用免费AI引擎生成回复
      const response = await freeAI.generateResponse(content, deityId)
      
      // 模拟打字效果显示回复
      await simulateTyping(deityMessage.id, response)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '神仙暂时无法回应，请稍后再试...'
      setError(errorMessage)
      
      // 更新神仙消息为错误状态
      updateMessage(deityMessage.id, {
        content: '抱歉，神仙暂时无法回应，请稍后再试...',
        isTyping: false
      })
    } finally {
      setIsLoading(false)
    }
  }, [addMessage, updateMessage, simulateTyping])
  
  // 清空对话历史
  const clearHistory = useCallback(() => {
    setMessages([])
    freeAI.resetContext()
    setError(null)
  }, [])
  
  // 重试最后一条消息
  const retryLastMessage = useCallback(async () => {
    if (!lastMessageRef.current) return
    
    const { content, deityId } = lastMessageRef.current
    
    // 移除最后两条消息（用户消息和失败的神仙回复）
    setMessages(prev => prev.slice(0, -2))
    
    // 重新发送
    await sendMessage(content, deityId)
  }, [sendMessage])
  
  // 获取快速建议
  const getQuickSuggestions = useCallback((deityId: string): string[] => {
    return freeAI.getQuickSuggestions(deityId)
  }, [])
  
  // 获取神仙问候语
  const getDeityGreeting = useCallback((deityId: string): string => {
    return freeAI.getGreeting(deityId)
  }, [])
  
  // 获取神仙信息
  const getDeityInfo = useCallback((deityId: string): DeityPersonality | null => {
    return freeAI.getDeityInfo(deityId)
  }, [])
  
  // 获取对话统计
  const getChatStats = useCallback(() => {
    return freeAI.getStats()
  }, [])
  
  return {
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    clearHistory,
    retryLastMessage,
    isAPIConfigured,
    getQuickSuggestions,
    getDeityGreeting,
    getDeityInfo,
    getChatStats
  }
}

// 导出默认实例
export default useFreeDeityChat 