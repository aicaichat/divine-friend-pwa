/**
 * 深度AI对话入口组件
 * 在首页提供深度神仙对话的快速入口，支持多种AI引擎
 */

import React, { useState } from 'react'
import { useFreeDeityChat } from '../hooks/useFreeDeityChat'
import AIProviderSelector from './AIProviderSelector'

interface FreeAIEntryProps {
  className?: string
}

const FreeAIEntry: React.FC<FreeAIEntryProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showAISelector, setShowAISelector] = useState(false)
  const [currentDeity, setCurrentDeity] = useState('guanyin')
  const [messageText, setMessageText] = useState('')
  const [currentAIProvider, setCurrentAIProvider] = useState('current-template')

  // 添加调试日志
  console.log('FreeAIEntry render, isOpen:', isOpen)

  const {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    getQuickSuggestions,
    getDeityGreeting
  } = useFreeDeityChat()

  const deities = [
    { id: 'guanyin', name: '观音菩萨', emoji: '🧘‍♀️', color: '#22d3ee' },
    { id: 'budongzun', name: '不动尊菩萨', emoji: '⚔️', color: '#ef4444' },
    { id: 'dashizhi', name: '大势至菩萨', emoji: '💡', color: '#fbbf24' },
    { id: 'wenshu', name: '文殊菩萨', emoji: '📚', color: '#8b5cf6' },
    { id: 'xukong', name: '虚空藏菩萨', emoji: '🌌', color: '#6366f1' },
    { id: 'amitabha', name: '阿弥陀佛', emoji: '🙏', color: '#ec4899' }
  ]

  const handleSendMessage = async () => {
    if (!messageText.trim() || isLoading) return
    
    await sendMessage(messageText.trim(), currentDeity)
    setMessageText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAIProviderChange = (providerId: string, config: any) => {
    setCurrentAIProvider(providerId)
    // 这里可以保存配置到localStorage或状态管理
    localStorage.setItem('selectedAIProvider', providerId)
    if (config) {
      localStorage.setItem('aiProviderConfig', JSON.stringify(config))
    }
    clearHistory() // 切换AI后清空历史
  }

  const getAIProviderDisplay = () => {
    switch (currentAIProvider) {
      case 'current-template': return '模板AI'
      case 'huggingface-inference': return 'HuggingFace'
      case 'groq-api': return 'Groq'
      case 'ollama-local': return 'Ollama'
      default: return 'AI引擎'
    }
  }

  // 处理按钮点击
  const handleButtonClick = () => {
    console.log('Button clicked! Current isOpen:', isOpen)
    setIsOpen(true)
    console.log('setIsOpen(true) called')
  }

  if (!isOpen) {
    return (
      <div className={`free-ai-entry ${className}`}>
        <button
          onClick={handleButtonClick}
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
            justifyContent: 'center',
            pointerEvents: 'auto' // 确保可以点击
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          开始深度神仙对话
        </button>
        
        {/* 调试信息 */}
        <div style={{
          marginTop: '8px',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center'
        }}>
          调试: isOpen = {isOpen.toString()}
        </div>
      </div>
    )
  }

  console.log('Rendering modal, isOpen:', isOpen)

  return (
    <>
      <div className="free-ai-modal" style={{
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
            {/* AI引擎选择按钮 */}
            <button
              onClick={() => setShowAISelector(true)}
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '8px',
                padding: '4px 8px',
                color: '#8b5cf6',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="选择AI引擎"
            >
              🤖 {getAIProviderDisplay()}
            </button>
            
            {/* 神仙选择 */}
            <select
              value={currentDeity}
              onChange={(e) => {
                setCurrentDeity(e.target.value)
                clearHistory()
              }}
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
              onClick={() => {
                console.log('Close button clicked')
                setIsOpen(false)
              }}
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
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>
                {deities.find(d => d.id === currentDeity)?.emoji} {deities.find(d => d.id === currentDeity)?.name}
              </span>
              <span style={{
                background: currentAIProvider === 'current-template' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '0.6rem'
              }}>
                {getAIProviderDisplay()}
              </span>
            </div>
            <div style={{ color: '#fff', fontSize: '0.9rem' }}>
              {getDeityGreeting(currentDeity)}
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
                {message.isTyping && (
                  <span style={{ animation: 'blink 1s infinite', marginLeft: '2px' }}>|</span>
                )}
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
              {deities.find(d => d.id === currentDeity)?.name}正在思考中...
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
              {getQuickSuggestions(currentDeity).slice(0, 3).map((suggestion, index) => (
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
            placeholder={`与${deities.find(d => d.id === currentDeity)?.name}分享您的心声...`}
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

      {/* AI提供商选择器 */}
      {showAISelector && (
        <AIProviderSelector
          currentProvider={currentAIProvider}
          onProviderChange={handleAIProviderChange}
          onClose={() => setShowAISelector(false)}
        />
      )}
    </>
  )
}

export default FreeAIEntry 