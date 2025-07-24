/**
 * 修复版深度AI对话入口组件
 * 移除了可能有问题的依赖，专注于核心功能
 */

import React, { useState } from 'react'

interface FreeAIEntryFixedProps {
  className?: string
}

const FreeAIEntryFixed: React.FC<FreeAIEntryFixedProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDeity, setCurrentDeity] = useState('guanyin')
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<Array<{
    id: string
    role: 'user' | 'deity'
    content: string
    timestamp: number
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  console.log('FreeAIEntry-Fixed render, isOpen:', isOpen)

  const deities = [
    { id: 'guanyin', name: '观音菩萨', emoji: '🧘‍♀️', greeting: '阿弥陀佛，善信有何心事需要倾诉？观音在此聆听。' },
    { id: 'budongzun', name: '不动尊菩萨', emoji: '⚔️', greeting: '不动如山，勇往直前！有何困难需要破除？' },
    { id: 'dashizhi', name: '大势至菩萨', emoji: '💡', greeting: '智慧之光照耀前程，有何问题需要指点？' },
    { id: 'wenshu', name: '文殊菩萨', emoji: '📚', greeting: '文殊智慧如海深，有何学问需要探讨？' },
    { id: 'xukong', name: '虚空藏菩萨', emoji: '🌌', greeting: '虚空藏纳万物，今日有何心愿需要成就？' },
    { id: 'amitabha', name: '阿弥陀佛', emoji: '🙏', greeting: '南无阿弥陀佛，慈悲无量。有何烦恼需要化解？' }
  ]

  const quickSuggestions = [
    '我最近心情很低落，该怎么办？',
    '人际关系让我很困扰',
    '如何保持内心的平静？',
    '请给我一些人生建议'
  ]

  // 简单的AI回复模拟
  const generateSimpleResponse = (message: string, deityId: string): string => {
    const responses = [
      '善信所言甚有道理，这确实需要深思。',
      '人生路上多磨砺，保持内心的平静最为重要。',
      '每个人的经历都是独特的，相信你能找到属于自己的答案。',
      '静心思考，答案往往就在心中。',
      '缘起缘灭，一切都有其因果。顺其自然，尽人事听天命。'
    ]
    
    const deity = deities.find(d => d.id === deityId)
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    // 根据神仙添加个性化前后缀
    let prefix = ''
    let suffix = ''
    
    switch (deityId) {
      case 'guanyin':
        prefix = '慈悲为怀，'
        suffix = '南无观世音菩萨。'
        break
      case 'budongzun':
        prefix = '勇者，'
        suffix = '勇往直前！'
        break
      case 'dashizhi':
        prefix = '智者，'
        suffix = '智慧指引方向。'
        break
      case 'wenshu':
        prefix = '博学之士，'
        suffix = '学而有得。'
        break
      case 'xukong':
        prefix = '虚空之中，'
        suffix = '缘起缘灭。'
        break
      case 'amitabha':
        prefix = '善信，'
        suffix = '愿你安好。'
        break
    }
    
    return `${prefix}${randomResponse}${suffix}`
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || isLoading) return
    
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user' as const,
      content: messageText.trim(),
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setMessageText('')
    setIsLoading(true)
    
    // 模拟AI思考延迟
    setTimeout(() => {
      const aiResponse = generateSimpleResponse(messageText, currentDeity)
      const deityMessage = {
        id: `msg_${Date.now()}_deity`,
        role: 'deity' as const,
        content: aiResponse,
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, deityMessage])
      setIsLoading(false)
    }, 1000 + Math.random() * 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className={`free-ai-entry ${className}`}>
        <button
          onClick={() => {
            console.log('Button clicked!')
            setIsOpen(true)
          }}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 24px',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          开始深度神仙对话
        </button>
      </div>
    )
  }

  const currentDeityInfo = deities.find(d => d.id === currentDeity) || deities[0]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)'
      }}>
        <h2 style={{
          color: '#ffd700',
          margin: 0,
          fontSize: '1.2rem'
        }}>
          💬 深度AI神仙对话
        </h2>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={currentDeity}
            onChange={(e) => setCurrentDeity(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          >
            {deities.map(deity => (
              <option key={deity.id} value={deity.id} style={{ color: '#000' }}>
                {deity.emoji} {deity.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        paddingBottom: '120px'
      }}>
        {/* 欢迎消息 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '12px 16px',
          marginBottom: '16px',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#ffd700',
            marginBottom: '4px'
          }}>
            {currentDeityInfo.emoji} {currentDeityInfo.name}
          </div>
          <div style={{ color: '#fff', fontSize: '0.9rem' }}>
            {currentDeityInfo.greeting}
          </div>
        </div>

        {/* 消息列表 */}
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              background: message.role === 'user' 
                ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: message.role === 'user' ? '#000' : '#fff',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              {message.content}
            </div>
          </div>
        ))}

        {/* 加载指示器 */}
        {isLoading && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.8rem',
            padding: '8px'
          }}>
            {currentDeityInfo.name}正在思考中...
          </div>
        )}
      </div>

      {/* 快速建议 */}
      {messages.length === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '16px',
          right: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '12px',
          padding: '12px'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            💭 快速开始对话
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {quickSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setMessageText(suggestion)}
                style={{
                  background: 'rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '16px',
                  padding: '6px 12px',
                  color: '#fff',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  flex: 1,
                  minWidth: '0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        borderTop: '1px solid rgba(255, 215, 0, 0.3)',
        padding: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end'
      }}>
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`与${currentDeityInfo.name}分享您的心声...`}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '0.9rem',
            resize: 'none',
            maxHeight: '80px',
            minHeight: '40px'
          }}
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isLoading}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: messageText.trim() && !isLoading 
              ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
              : 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            color: messageText.trim() && !isLoading ? '#000' : '#666',
            cursor: messageText.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {isLoading ? '...' : '💬'}
        </button>
      </div>
    </div>
  )
}

export default FreeAIEntryFixed 