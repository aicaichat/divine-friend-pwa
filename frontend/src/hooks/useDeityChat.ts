/**
 * useDeityChat Hook
 * 管理神仙对话状态和DeepSeek API集成
 */

import { useState, useCallback, useRef } from 'react'
import { DeepSeekAPI, type DeepSeekMessage } from '../utils/deepseek-api'
import { getAPIConfig, validateAPIKey } from '../config/api'

interface ChatMessage {
  id: string
  role: 'user' | 'deity'
  content: string
  timestamp: number
  deityId: string
  isTyping?: boolean
}

interface UseDeityChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  sendMessage: (content: string, deityId: string) => Promise<void>
  clearHistory: () => void
  retryLastMessage: () => Promise<void>
  isAPIConfigured: boolean
}

export const useDeityChat = (): UseDeityChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const apiRef = useRef<DeepSeekAPI | null>(null)
  const conversationHistoryRef = useRef<Record<string, DeepSeekMessage[]>>({})
  const lastMessageRef = useRef<{ content: string; deityId: string } | null>(null)
  
  // 初始化API实例
  const initAPI = useCallback(() => {
    const config = getAPIConfig()
    if (!apiRef.current && config.deepseek.apiKey) {
      apiRef.current = new DeepSeekAPI(config.deepseek.apiKey)
    }
    return apiRef.current
  }, [])
  
  // 检查API是否配置
  const isAPIConfigured = validateAPIKey()
  
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
    setIsTyping(true)
    
    try {
      const api = initAPI()
      if (!api) {
        throw new Error('API未配置，请检查DeepSeek API密钥')
      }
      
      // 获取对话历史
      const history = conversationHistoryRef.current[deityId] || []
      
      // 调用DeepSeek API
      const response = await api.chatWithDeity(deityId, content, history)
      
      // 更新对话历史
      conversationHistoryRef.current[deityId] = [
        ...history,
        { role: 'user', content },
        { role: 'assistant', content: response }
      ]
      
      // 模拟打字效果
      await simulateTyping(deityMessage.id, response)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送消息失败'
      setError(errorMessage)
      
      // 更新神仙消息为错误状态
      updateMessage(deityMessage.id, {
        content: '抱歉，神仙暂时无法回应，请稍后再试...',
        isTyping: false
      })
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }, [addMessage, updateMessage, initAPI])
  
  // 模拟打字效果
  const simulateTyping = useCallback(async (messageId: string, fullText: string) => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    
    let currentText = ''
    const chars = fullText.split('')
    
    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i]
      updateMessage(messageId, {
        content: currentText,
        isTyping: i < chars.length - 1
      })
      
      // 根据字符类型调整延迟
      const char = chars[i]
      let typingDelay = 50
      
      if (char === '。' || char === '！' || char === '？') {
        typingDelay = 300 // 句号等停顿更久
      } else if (char === '，' || char === '、') {
        typingDelay = 150 // 逗号中等停顿
      } else if (char === ' ') {
        typingDelay = 100 // 空格短停顿
      }
      
      await delay(typingDelay)
    }
    
    // 最终更新，移除打字状态
    updateMessage(messageId, {
      content: fullText,
      isTyping: false
    })
  }, [updateMessage])
  
  // 重试最后一条消息
  const retryLastMessage = useCallback(async () => {
    if (!lastMessageRef.current) return
    
    const { content, deityId } = lastMessageRef.current
    await sendMessage(content, deityId)
  }, [sendMessage])
  
  // 清除聊天历史
  const clearHistory = useCallback(() => {
    setMessages([])
    conversationHistoryRef.current = {}
    setError(null)
    lastMessageRef.current = null
  }, [])
  
  return {
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    clearHistory,
    retryLastMessage,
    isAPIConfigured
  }
} 