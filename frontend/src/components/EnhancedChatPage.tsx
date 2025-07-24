/**
 * 增强版神仙对话页面
 * 世界顶级交互视觉专家设计的沉浸式神仙对话体验
 */

import React, { useState, useEffect, useRef } from 'react'
import type { AppPage } from '../types'
import { useDeityChat } from '../hooks/useDeityChat'
import { DEITY_PERSONALITIES } from '../utils/deepseek-api'
import { validateAPIKey } from '../config/api'

// 导入修复样式
import '../styles/enhanced-chat-fix.css'

interface EnhancedChatPageProps {
  onNavigate: (page: AppPage) => void
}

interface DeityInfo {
  id: string
  name: string
  title: string
  imageUrl: string
  fallbackEmoji: string
  specialty: string
  element: string
  color: string
  backgroundGradient: string
  particles: string
  aura: string
  mood: string
  greetingMessage: string
}

const EnhancedChatPage: React.FC<EnhancedChatPageProps> = ({ onNavigate }) => {
  const [currentDeityIndex, setCurrentDeityIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [showParticles, setShowParticles] = useState(true)
  const [showAura, setShowAura] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  // 增强版神仙信息数据库
  const deities: DeityInfo[] = [
    {
      id: 'guanyin',
      name: '观音菩萨',
      title: '大慈大悲救苦救难',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%8D%83%E6%89%8B%E8%A7%82%E9%9F%B3.jpg',
      fallbackEmoji: '🧘‍♀️',
      specialty: '慈悲智慧 • 情感疗愈',
      element: 'water',
      color: '#22d3ee',
      backgroundGradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #164e63 100%)',
      particles: 'water-drops',
      aura: 'compassion',
      mood: '慈悲',
      greetingMessage: '阿弥陀佛，善信有何心事需要倾诉？观音在此聆听。'
    },
    {
      id: 'budongzun',
      name: '不动尊菩萨',
      title: '降魔护法明王',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E4%B8%8D%E5%8A%A8%E5%B0%8A%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '⚔️',
      specialty: '破除障碍 • 坚定意志',
      element: 'fire',
      color: '#ef4444',
      backgroundGradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
      particles: 'flames',
      aura: 'power',
      mood: '坚定',
      greetingMessage: '不动如山，勇往直前！有何困难需要破除？'
    },
    {
      id: 'dashizhi',
      name: '大势至菩萨',
      title: '智慧光明遍照',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%A4%A7%E5%8A%BF%E8%87%B3%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '💡',
      specialty: '智慧开启 • 学业事业',
      element: 'light',
      color: '#fbbf24',
      backgroundGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
      particles: 'light-orbs',
      aura: 'wisdom',
      mood: '智慧',
      greetingMessage: '智慧之光照耀前程，有何问题需要指点？'
    },
    {
      id: 'dairiruiai',
      name: '大日如来',
      title: '法界体性智',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%A4%A7%E6%97%A5%E5%A6%82%E6%9D%A5.jpg',
      fallbackEmoji: '☀️',
      specialty: '光明普照 • 消除业障',
      element: 'sun',
      color: '#fb923c',
      backgroundGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)',
      particles: 'sun-rays',
      aura: 'radiance',
      mood: '光明',
      greetingMessage: '法界光明遍照十方，让我为你驱散心中阴霾。'
    },
    {
      id: 'wenshu',
      name: '文殊菩萨',
      title: '大智文殊师利',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E6%96%87%E6%AE%8A%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '📚',
      specialty: '智慧第一 • 学问精进',
      element: 'air',
      color: '#8b5cf6',
      backgroundGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
      particles: 'knowledge-symbols',
      aura: 'scholarly',
      mood: '博学',
      greetingMessage: '智慧如海，学无止境。有何学问需要探讨？'
    },
    {
      id: 'xukong',
      name: '虚空藏菩萨',
      title: '福智如虚空',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E8%99%9A%E7%A9%BA%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '🌌',
      specialty: '财富智慧 • 心愿成就',
      element: 'void',
      color: '#6366f1',
      backgroundGradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
      particles: 'cosmic-dust',
      aura: 'mystical',
      mood: '神秘',
      greetingMessage: '虚空含万物，智慧无边际。有何心愿需要成就？'
    },
    {
      id: 'amitabha',
      name: '阿弥陀佛',
      title: '无量光无量寿',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E9%98%BF%E5%BC%A5%E9%99%80%E4%BD%9B.jpg',
      fallbackEmoji: '🙏',
      specialty: '净土往生 • 慈悲接引',
      element: 'lotus',
      color: '#ec4899',
      backgroundGradient: 'linear-gradient(135deg, #db2777 0%, #be185d 50%, #9d174d 100%)',
      particles: 'lotus-petals',
      aura: 'serene',
      mood: '慈悲',
      greetingMessage: '南无阿弥陀佛，慈悲无量。有何烦恼需要化解？'
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

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [allMessages])

  // 当切换神仙时清空历史
  useEffect(() => {
    clearHistory()
    setImageLoaded(false)
  }, [currentDeityIndex, clearHistory])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDeitySwitch = (direction: 'prev' | 'next') => {
    // 触觉反馈
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    if (direction === 'next') {
      setCurrentDeityIndex((prev) => (prev + 1) % deities.length)
    } else {
      setCurrentDeityIndex((prev) => (prev - 1 + deities.length) % deities.length)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || isChatLoading) return
    
    const message = messageText.trim()
    setMessageText('')
    
    // 触觉反馈
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50])
    }
    
    await sendMessage(message, currentDeity.id)
    
    // 重新聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleParticles = () => {
    setShowParticles(!showParticles)
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
  }

  const toggleAura = () => {
    setShowAura(!showAura)
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
  }

  const getQuickSuggestions = () => {
    const suggestions = [
      `如何在当下找到内心平静？`,
      `${currentDeity.name}，请指引我人生方向`,
      `最近遇到困难，该如何应对？`,
      `怎样提升自己的智慧？`,
      `请为我解答感情上的困惑`,
      `工作压力很大，如何调适？`
    ]
    return suggestions.slice(0, 3)
  }

  return (
    <div 
      className="enhanced-chat-container"
      style={{ 
        background: currentDeity.backgroundGradient,
        '--deity-color': currentDeity.color 
      } as React.CSSProperties}
    >
      {/* 动态背景粒子效果 */}
      {showParticles && (
        <div className={`particles-layer ${currentDeity.particles}`}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                '--delay': `${i * 0.5}s`,
                '--duration': `${3 + Math.random() * 2}s`
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* 顶部控制栏 */}
      <div className="chat-header-enhanced">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => onNavigate('home')}
            aria-label="返回首页"
          >
            ← 返回
          </button>
        </div>
        
        <div className="header-center">
          <div className="deity-indicator-pills">
            {deities.map((deity, index) => (
              <button
                key={deity.id}
                className={`deity-pill ${index === currentDeityIndex ? 'active' : ''}`}
                onClick={() => setCurrentDeityIndex(index)}
                style={{ '--pill-color': deity.color } as React.CSSProperties}
                title={deity.name}
              >
                {deity.fallbackEmoji}
              </button>
            ))}
          </div>
        </div>

        <div className="header-right">
          <button 
            className={`effect-toggle ${showParticles ? 'active' : ''}`}
            onClick={toggleParticles}
            title="切换粒子效果"
          >
            ✨
          </button>
          <button 
            className={`effect-toggle ${showAura ? 'active' : ''}`}
            onClick={toggleAura}
            title="切换光环效果"
          >
            💫
          </button>
        </div>
      </div>

      {/* 神仙信息展示区 */}
      <div className="deity-showcase">
        <div className="deity-avatar-enhanced">
          <div className={`avatar-container-enhanced ${showAura ? currentDeity.aura : ''}`}>
            {!imageError ? (
              <img 
                src={currentDeity.imageUrl}
                alt={currentDeity.name}
                className={`deity-image ${imageLoaded ? 'loaded' : 'loading'} deity-${currentDeity.id}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="deity-fallback-enhanced">
                {currentDeity.fallbackEmoji}
              </div>
            )}
            
            {/* 在线状态指示器 */}
            <div className="online-status-enhanced">
              <div className="status-pulse"></div>
            </div>
          </div>
          
          {/* 神仙切换按钮 */}
          <div className="deity-navigation">
            <button 
              className="nav-btn prev"
              onClick={() => handleDeitySwitch('prev')}
              aria-label="上一位神仙"
            >
              ◀
            </button>
            <button 
              className="nav-btn next"
              onClick={() => handleDeitySwitch('next')}
              aria-label="下一位神仙"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="deity-info-enhanced">
          <h1 className="deity-name-enhanced">{currentDeity.name}</h1>
          <p className="deity-title-enhanced">{currentDeity.title}</p>
          <p className="deity-specialty-enhanced">{currentDeity.specialty}</p>
          <div className="deity-mood-badge">
            <span className="mood-icon">⚡</span>
            <span className="mood-text">{currentDeity.mood}</span>
          </div>
        </div>
      </div>

      {/* API配置提示 */}
      {!isAPIConfigured && (
        <div className="api-warning">
          <div className="warning-content">
            <span className="warning-icon">🔑</span>
            <span>需要配置 DeepSeek API 密钥才能开始对话</span>
            <button onClick={() => onNavigate('deepseek-demo')}>
              查看配置指南
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {chatError && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{chatError}</span>
          <button onClick={retryLastMessage} className="retry-btn">
            重试
          </button>
        </div>
      )}

      {/* 对话消息区域 */}
      <div className="messages-container-enhanced">
        <div className="messages-scroll-enhanced">
          {allMessages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${message.role === 'user' ? 'user' : 'deity'}`}
            >
              {message.role === 'deity' && (
                <div className="message-avatar">
                  <div className="avatar-mini">
                    {currentDeity.fallbackEmoji}
                  </div>
                </div>
              )}
              
              <div className="message-content-enhanced">
                {message.role === 'deity' && (
                  <div className="message-header-enhanced">
                    <span className="sender-name">{currentDeity.name}</span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                
                <div className="message-text">
                  {message.content}
                  {message.isTyping && (
                    <span className="typing-cursor">|</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* 正在输入指示器 */}
          {isChatTyping && (
            <div className="typing-indicator-enhanced">
              <div className="typing-avatar">
                <div className="avatar-mini">
                  {currentDeity.fallbackEmoji}
                </div>
              </div>
              <div className="typing-content">
                <div className="typing-text">
                  {currentDeity.name}正在思考中
                </div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 快速建议 */}
      {allMessages.length <= 1 && (
        <div className="quick-suggestions-enhanced">
          <div className="suggestions-title">💭 快速开始对话</div>
          <div className="suggestions-grid">
            {getQuickSuggestions().map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-pill"
                onClick={() => setMessageText(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="input-area-enhanced">
        <div className="input-container-enhanced">
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`与${currentDeity.name}分享您的心声...`}
            className="message-input-enhanced"
            rows={1}
            disabled={!isAPIConfigured}
          />
          
          <div className="input-actions">
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isChatLoading || !isAPIConfigured}
              className="send-btn-enhanced"
            >
              {isChatLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <span className="send-icon">💬</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedChatPage 