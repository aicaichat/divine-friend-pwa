import React, { useState, useEffect, useRef } from 'react'
import type { AppPage } from '../types'
import { useDeityChat } from '../hooks/useDeityChat'
import { DEITY_PERSONALITIES } from '../utils/deepseek-api'
import { validateAPIKey, ENV_INSTRUCTIONS } from '../config/api'
import '../styles/chat-page.css'
import '../styles/chat-enhanced.css'

interface ChatPageProps {
  onNavigate: (page: AppPage) => void
}

interface DeityInfo {
  id: string
  name: string
  title: string
  imageUrl: string
  fallbackEmoji: string
  specialty: string
  personality: string
  greetingMessage: string
  mood: string
  fortuneType: 'excellent' | 'good' | 'normal' | 'challenging'
  fortuneScore: number
  todayGuidance: string[]
}

const ChatPage: React.FC<ChatPageProps> = ({ onNavigate }) => {
  const [currentDeityIndex, setCurrentDeityIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showFortuneCard, setShowFortuneCard] = useState(false)
  const [expandedGuidance, setExpandedGuidance] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [currentMode, setCurrentMode] = useState<string>('casual')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 使用DeepSeek聊天Hook
  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    isTyping: isChatTyping,
    error: chatError,
    sendMessage,
    clearHistory,
    retryLastMessage,
    isAPIConfigured
  } = useDeityChat()

  // 神仙信息数据库
  const deities: DeityInfo[] = [
    {
      id: 'guanyin',
      name: '观音菩萨',
      title: '大慈大悲救苦救难',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%8D%83%E6%89%8B%E8%A7%82%E9%9F%B3.jpg',
      fallbackEmoji: '🧘‍♀️',
      specialty: '慈悲智慧 • 情感疗愈',
      personality: '',
      greetingMessage: '阿弥陀佛，善信有何心事需要倾诉？观音在此聆听。',
      mood: '慈悲',
      fortuneType: 'excellent',
      fortuneScore: 89,
      todayGuidance: ['保持善念，助人为乐', '适合处理人际关系', '晚间诵经效果佳']
    },
    {
      id: 'budongzun',
      name: '不动尊菩萨',
      title: '降魔护法明王',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E4%B8%8D%E5%8A%A8%E5%B0%8A%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '⚔️',
      specialty: '破除障碍 • 坚定意志',
      personality: '',
      greetingMessage: '不动如山，勇往直前！有何困难需要破除？',
      mood: '坚定',
      fortuneType: 'good',
      fortuneScore: 85,
      todayGuidance: ['面对困难不退缩', '适合做重要决定', '练习专注冥想']
    },
    {
      id: 'wenshu',
      name: '文殊菩萨',
      title: '大智文殊师利',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E6%96%87%E6%AE%8A%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '📚',
      specialty: '智慧第一 • 学问精进',
      personality: '',
      greetingMessage: '智慧如海，学无止境。有何学问需要探讨？',
      mood: '博学',
      fortuneType: 'excellent',
      fortuneScore: 94,
      todayGuidance: ['阅读经典著作', '思考人生哲理', '分享智慧给他人']
    }
  ]

  const currentDeity = deities[currentDeityIndex]

  // 合并聊天消息和欢迎消息
  const allMessages = [
    {
      id: 'greeting',
      role: 'deity' as const,
      content: currentDeity.greetingMessage,
      timestamp: Date.now() - 60000,
      deityId: currentDeity.id
    },
    ...chatMessages
  ]

  // 预加载当前神仙图片
  useEffect(() => {
    const img = new Image()
    img.src = currentDeity.imageUrl
    img.onload = () => setImageLoaded(true)
    img.onerror = () => setImageError(true)
    setImageLoaded(false)
    setImageError(false)
  }, [currentDeity.imageUrl])

  // 当切换神仙时更新问候消息
  useEffect(() => {
    clearHistory()
  }, [currentDeityIndex, clearHistory])

  const conversationModes: Record<string, any> = {
    casual: {
      name: '日常聊天',
      style: '轻松友好，像老朋友一样随意交流'
    },
    guidance: {
      name: '人生指导',
      style: '深度智慧，提供人生方向建议'
    },
    divination: {
      name: '占卜问卦',
      style: '神秘庄重，预测运势走向'
    },
    healing: {
      name: '心理疗愈',
      style: '温暖包容，抚慰心灵创伤'
    }
  }

  const getQuickSuggestions = () => {
    const baseQuestions = [
      { text: '我今天的运势如何？', mode: 'divination' },
      { text: '给我一些人生建议', mode: 'guidance' },
      { text: '最近心情有些低落', mode: 'healing' },
      { text: '分享今天的好心情', mode: 'casual' }
    ]
    
    return baseQuestions
  }

  const quickSuggestions = getQuickSuggestions()

  useEffect(() => {
    scrollToBottom()
  }, [allMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDeitySwitch = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentDeityIndex(prev => (prev + 1) % deities.length)
    } else {
      setCurrentDeityIndex(prev => (prev - 1 + deities.length) % deities.length)
    }
  }

  const getFortuneColor = (type: DeityInfo['fortuneType']) => {
    const colors = {
      excellent: '#22c55e',
      good: '#f59e0b',
      normal: '#6b7280',
      challenging: '#ef4444'
    }
    return colors[type]
  }

  const getFortuneText = (type: DeityInfo['fortuneType']) => {
    const texts = {
      excellent: '大吉',
      good: '吉',
      normal: '平',
      challenging: '需谨慎'
    }
    return texts[type]
  }

  const handleSendMessage = async (inputText?: string) => {
    const textToSend = inputText || messageText.trim()
    if (!textToSend) return

    sendMessage(textToSend)
    setMessageText('')
  }

  const handleQuickSuggestion = (suggestion: { text: string; mode: string }) => {
    setCurrentMode(suggestion.mode)
    handleSendMessage(suggestion.text)
  }

  const formatTime = (timestamp: number | string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="chat-container-enhanced">
      {/* 🎨 AI情感状态指示 */}
      <div className="ai-emotion-bar"></div>

      {/* 🔮 神仙朋友状态栏 - 增强版 */}
      <div className="chat-header-enhanced">
        <div className="deity-info-section">
          <div className="deity-avatar-premium">
            {!imageError ? (
              <img 
                src={currentDeity.imageUrl}
                alt={currentDeity.name}
                className={`deity-avatar-image ${imageLoaded ? 'loaded' : 'loading'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="deity-fallback-avatar">
                {currentDeity.fallbackEmoji}
              </div>
            )}
            <div className="deity-status-indicator"></div>
            
            {/* 神仙切换控制器 */}
            <div className="deity-switch-controls">
              <button 
                className="deity-switch-btn prev"
                onClick={() => handleDeitySwitch('prev')}
                title="上一位神仙"
              >
                ◀
              </button>
              <button 
                className="deity-switch-btn next"
                onClick={() => handleDeitySwitch('next')}
                title="下一位神仙"
              >
                ▶
              </button>
            </div>
          </div>
          
          <div className="deity-details">
            <div className="deity-name-title">
              <h2 className="deity-name">{currentDeity.name}</h2>
              <div className="deity-title">{currentDeity.title}</div>
            </div>
            <div className="deity-status">
              <span className="status-dot"></span>
              <span className="mood-text">心境: {currentDeity.mood}</span>
              <span className="specialty-text">专长: {currentDeity.specialty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 💬 对话模式选择 */}
      <div className="conversation-modes">
        <div className="modes-scroll-container">
          {Object.entries(conversationModes).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => setCurrentMode(key)}
              className={`mode-btn ${currentMode === key ? 'active' : ''}`}
            >
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* 📜 消息区域 */}
      <div className="messages-scroll-container">
        {allMessages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble-ai ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            {message.role === 'deity' && (
              <div className="deity-avatar-premium">
                {!imageError ? (
                  <img 
                    src={currentDeity.imageUrl}
                    alt={currentDeity.name}
                    className="deity-avatar-image"
                  />
                ) : (
                  <div className="deity-fallback-avatar">
                    {currentDeity.fallbackEmoji}
                  </div>
                )}
                <div className="deity-status-indicator"></div>
              </div>
            )}
            
            <div className="message-content">
              {message.role === 'deity' && (
                <div className="message-header">
                  <span className="sender-name">{currentDeity.name}</span>
                  <span className="message-mood">• {currentDeity.mood}</span>
                </div>
              )}
              
              <div className="message-text">
                {message.content}
              </div>
              
              {/* 🎭 情感识别指示器 */}
              <div className="emotion-indicator">😊</div>
              
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isChatTyping && (
          <div className="typing-indicator-premium">
            <div className="deity-avatar-premium">
              {!imageError ? (
                <img 
                  src={currentDeity.imageUrl}
                  alt={currentDeity.name}
                  className="deity-avatar-image"
                />
              ) : (
                <div className="deity-fallback-avatar">
                  {currentDeity.fallbackEmoji}
                </div>
              )}
              <div className="deity-status-indicator"></div>
            </div>
            <div className="typing-bubble-premium">
              <div className="typing-dots-premium">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
          
        <div ref={messagesEndRef} />
      </div>

      {/* 🎯 快捷建议和输入区域 */}
      <div className="chat-input-area">
        {/* 🚀 快捷建议系统 */}
        <div className="suggestions-container">
          {quickSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleQuickSuggestion(suggestion)}
              className="suggestion-chip"
            >
              {suggestion.text}
            </button>
          ))}
        </div>

        {/* 🎯 智能输入系统 */}
        <div className="input-container-premium">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`与${currentDeity.name}分享您的心声...`}
            className="message-input-premium"
            rows={1}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          
          {/* 🎤 语音输入按钮 */}
          <button className="voice-input-btn" title="语音输入">
            🎤
          </button>
          
          {/* 🚀 发送按钮增强 */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!messageText.trim() || isChatTyping}
            className="send-btn-premium"
            title="发送消息"
          >
            {isChatTyping ? '⏳' : '🚀'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage