/**
 * 免费神仙对话页面
 * 使用本地AI引擎，无需付费API，提供完整的神仙陪伴体验
 */

import React, { useState, useEffect, useRef } from 'react'
import type { AppPage } from '../types'
import { useFreeDeityChat } from '../hooks/useFreeDeityChat'
import { enhancedAI } from '../utils/enhanced-ai-engine'

// 导入样式
import '../styles/enhanced-chat-fix.css'
import '../styles/enhanced-chat-visual.css' // 新的视觉设计系统

interface FreeChatPageProps {
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

const FreeChatPage: React.FC<FreeChatPageProps> = ({ onNavigate }) => {
  const [currentDeityIndex, setCurrentDeityIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [showParticles, setShowParticles] = useState(true)
  const [showAura, setShowAura] = useState(true)
  const [showInsights, setShowInsights] = useState(false)
  const [conversationInsights, setConversationInsights] = useState(null)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messageAnimations, setMessageAnimations] = useState<Map<string, boolean>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 使用免费神仙对话Hook
  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    isTyping: isChatTyping,
    error: chatError,
    sendMessage,
    clearHistory,
    retryLastMessage,
    isAPIConfigured,
    getQuickSuggestions,
    getDeityGreeting,
    getDeityInfo,
    getChatStats
  } = useFreeDeityChat()

  // 神仙信息数据库
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
      id: 'wenshu',
      name: '文殊菩萨',
      title: '大智文殊师利',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E6%96%87%E6%AE%8A%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '📚',
      specialty: '智慧修行 • 学问精进',
      element: 'air',
      color: '#8b5cf6',
      backgroundGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
      particles: 'floating-books',
      aura: 'scholarly',
      mood: '博学',
      greetingMessage: '文殊智慧如海深，有何学问需要探讨？'
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
      backgroundGradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 50%, #312e81 100%)',
      particles: 'stars',
      aura: 'mystical',
      mood: '神秘',
      greetingMessage: '虚空藏纳万物，今日有何心愿需要成就？'
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
      content: getDeityGreeting(currentDeity.id),
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
    enhancedAI.resetContext()
    setImageLoaded(false)
    setConversationInsights(null)
  }, [currentDeityIndex, clearHistory])

  // 更新对话洞察
  useEffect(() => {
    if (allMessages.length > 1) {
      const insights = enhancedAI.getConversationInsights()
      setConversationInsights(insights)
    }
  }, [allMessages])

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
    
    await sendMessage(messageText.trim(), currentDeity.id)
    setMessageText('')
    
    // 聚焦输入框
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleParticles = () => {
    setShowParticles(!showParticles)
  }

  const toggleAura = () => {
    setShowAura(!showAura)
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (isVoiceMode) {
      setIsListening(false)
    }
  }

  const handleVoiceInput = async () => {
    if (!isVoiceMode) return
    
    if (isListening) {
      setIsListening(false)
      return
    }
    
    try {
      setIsListening(true)
      // 这里应该集成语音识别功能
      // const transcript = await multimodalEngine.startVoiceInput()
      // setMessageText(transcript)
      
      // 模拟语音识别延迟
      setTimeout(() => {
        setIsListening(false)
        setMessageText('通过语音输入的消息示例')
      }, 2000)
    } catch (error) {
      console.error('语音输入失败:', error)
      setIsListening(false)
    }
  }

  const handleMessageAnimation = (messageId: string) => {
    setMessageAnimations(prev => new Map(prev.set(messageId, true)))
    setTimeout(() => {
      setMessageAnimations(prev => {
        const newMap = new Map(prev)
        newMap.delete(messageId)
        return newMap
      })
    }, 500)
  }

  const getQuickSuggestionsForDeity = () => {
    // 优先使用增强版AI的上下文感知建议
    const enhancedSuggestions = enhancedAI.getEnhancedQuickSuggestions(currentDeity.id)
    if (enhancedSuggestions.length > 0) {
      return enhancedSuggestions
    }
    // 回退到基础建议
    return getQuickSuggestions(currentDeity.id)
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
            style={{
              background: 'none',
              border: 'none',
              color: '#ffd700',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            ← 返回
          </button>
        </div>
        
        <div className="header-center">
          <div className="deity-indicator-pills" style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            {deities.map((deity, index) => (
              <button
                key={deity.id}
                className={`deity-pill ${index === currentDeityIndex ? 'active' : ''}`}
                onClick={() => setCurrentDeityIndex(index)}
                style={{ 
                  '--pill-color': deity.color,
                  background: index === currentDeityIndex ? `${deity.color}30` : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${index === currentDeityIndex ? deity.color : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
                title={deity.name}
              >
                {deity.fallbackEmoji}
              </button>
            ))}
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`effect-toggle ${isVoiceMode ? 'active' : ''}`}
            onClick={toggleVoiceMode}
            title="语音模式"
            style={{
              background: isVoiceMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🎤
          </button>
          <button 
            className={`effect-toggle ${showInsights ? 'active' : ''}`}
            onClick={() => setShowInsights(!showInsights)}
            title="对话洞察"
            style={{
              background: showInsights ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            📊
          </button>
          <button 
            className={`effect-toggle ${showParticles ? 'active' : ''}`}
            onClick={toggleParticles}
            title="切换粒子效果"
            style={{
              background: showParticles ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ✨
          </button>
          <button 
            className={`effect-toggle ${showAura ? 'active' : ''}`}
            onClick={toggleAura}
            title="切换光环效果"
            style={{
              background: showAura ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
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
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `3px solid ${currentDeity.color}`,
                  boxShadow: `0 0 20px ${currentDeity.color}50`
                }}
              />
            ) : (
              <div className="deity-fallback-enhanced" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `${currentDeity.color}30`,
                border: `3px solid ${currentDeity.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                {currentDeity.fallbackEmoji}
              </div>
            )}
            
            {/* 在线状态指示器 */}
            <div className="online-status-enhanced" style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '16px',
              height: '16px',
              background: '#10b981',
              borderRadius: '50%',
              border: '2px solid white',
              animation: 'pulse 2s infinite'
            }}>
            </div>
          </div>
          
          {/* 神仙切换按钮 */}
          <div className="deity-navigation" style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px'
          }}>
            <button 
              className="nav-btn prev"
              onClick={() => handleDeitySwitch('prev')}
              aria-label="上一位神仙"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#ffd700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ◀
            </button>
            <button 
              className="nav-btn next"
              onClick={() => handleDeitySwitch('next')}
              aria-label="下一位神仙"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#ffd700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ▶
            </button>
          </div>
        </div>
        
        <div className="deity-info-enhanced" style={{
          textAlign: 'center',
          marginLeft: '16px'
        }}>
          <h2 className="deity-name" style={{
            color: '#ffd700',
            fontSize: '1.5rem',
            margin: '0 0 4px 0'
          }}>
            {currentDeity.name}
          </h2>
          <p className="deity-title" style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem',
            margin: '0 0 8px 0'
          }}>
            {currentDeity.title}
          </p>
          <div className="deity-specialty" style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.9)',
            display: 'inline-block'
          }}>
            {currentDeity.specialty}
          </div>
          
                     {/* AI对话标识 */}
           <div style={{
             marginTop: '8px',
             padding: '4px 8px',
             background: 'rgba(139, 92, 246, 0.2)',
             border: '1px solid rgba(139, 92, 246, 0.5)',
             borderRadius: '12px',
             fontSize: '0.7rem',
             color: '#8b5cf6',
             display: 'inline-block'
           }}>
             💬 深度AI对话
           </div>
        </div>
      </div>

      {/* 对话洞察面板 */}
      {showInsights && conversationInsights && (
        <div className="conversation-insights" style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          margin: '0 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h3 style={{ 
              color: '#ffd700', 
              fontSize: '0.9rem', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📊 对话洞察
            </h3>
            <button 
              onClick={() => setShowInsights(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            <div className="insight-item">
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                关系深度
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px'
              }}>
                <div style={{ 
                  background: 'rgba(255, 215, 0, 0.2)',
                  borderRadius: '6px',
                  height: '4px',
                  flex: 1,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#ffd700',
                    height: '100%',
                    width: `${conversationInsights.relationshipDepth}%`,
                    transition: 'width 0.5s ease'
                  }}/>
                </div>
                <span style={{ 
                  color: '#ffd700', 
                  fontSize: '0.8rem',
                  minWidth: '25px'
                }}>
                  {Math.round(conversationInsights.relationshipDepth)}
                </span>
              </div>
            </div>
            
            <div className="insight-item">
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                信任度
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px'
              }}>
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '6px',
                  height: '4px',
                  flex: 1,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#22c55e',
                    height: '100%',
                    width: `${conversationInsights.trustLevel}%`,
                    transition: 'width 0.5s ease'
                  }}/>
                </div>
                <span style={{ 
                  color: '#22c55e', 
                  fontSize: '0.8rem',
                  minWidth: '25px'
                }}>
                  {Math.round(conversationInsights.trustLevel)}
                </span>
              </div>
            </div>
            
            <div className="insight-item">
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                对话质量
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px'
              }}>
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.2)',
                  borderRadius: '6px',
                  height: '4px',
                  flex: 1,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#8b5cf6',
                    height: '100%',
                    width: `${conversationInsights.conversationQuality}%`,
                    transition: 'width 0.5s ease'
                  }}/>
                </div>
                <span style={{ 
                  color: '#8b5cf6', 
                  fontSize: '0.8rem',
                  minWidth: '25px'
                }}>
                  {Math.round(conversationInsights.conversationQuality)}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.7rem'
            }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>情绪趋势: </span>
              <span style={{ color: '#ffd700' }}>{conversationInsights.emotionalTrend}</span>
            </div>
            
            {conversationInsights.significantMemories > 0 && (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.7rem'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>重要记忆: </span>
                <span style={{ color: '#22c55e' }}>{conversationInsights.significantMemories}个</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 消息区域 */}
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
                    <span className="typing-cursor" style={{
                      animation: 'blink 1s infinite',
                      marginLeft: '2px'
                    }}>|</span>
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
            {getQuickSuggestionsForDeity().slice(0, 4).map((suggestion, index) => (
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
          
          <div className="input-actions" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            {isVoiceMode && (
              <button
                onClick={handleVoiceInput}
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                title={isListening ? '停止录音' : '开始语音输入'}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: isListening 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  animation: isListening ? 'voicePulse 1s ease-in-out infinite' : 'none'
                }}
              >
                {isListening ? '🔴' : '🎤'}
              </button>
            )}
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
        
        {/* 错误提示 */}
        {chatError && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{chatError}</span>
            <button
              onClick={retryLastMessage}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '4px',
                color: '#fca5a5',
                padding: '4px 8px',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FreeChatPage 