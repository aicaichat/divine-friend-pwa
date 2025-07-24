import React, { useState, useEffect, useRef } from 'react'
import '../styles/chat-enhanced.css'

interface EnhancedAIChatProps {
  deity: {
    id: string
    name: string
    imageUrl: string
    fallbackEmoji: string
    mood: string
  }
  messages: Array<{
    id: string
    role: 'user' | 'deity'
    content: string
    timestamp: number
    emotion?: string
  }>
  onSendMessage: (message: string) => void
  isTyping: boolean
  imageError: boolean
}

const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({
  deity,
  messages,
  onSendMessage,
  isTyping,
  imageError
}) => {
  const [messageText, setMessageText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [emotionParticles, setEmotionParticles] = useState<Array<{id: string, x: number, y: number}>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const particleIdRef = useRef(0)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 情感识别
  const detectEmotion = (content: string): string => {
    const emotions = {
      '😊': ['开心', '高兴', '快乐', '喜悦', '哈哈', '不错', '好的'],
      '😢': ['难过', '伤心', '痛苦', '哭', '失落', '沮丧'],
      '😤': ['生气', '愤怒', '气', '不爽', '烦'],
      '😌': ['平静', '安静', '淡定', '平和', '冥想'],
      '🤔': ['思考', '困惑', '不懂', '疑问', '为什么']
    }

    for (const [emoji, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return emoji
      }
    }
    return '😊' // 默认情感
  }

  // 创建情感粒子
  const createEmotionParticles = (x: number, y: number) => {
    const newParticles = Array.from({ length: 5 }, () => ({
      id: `particle-${particleIdRef.current++}`,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40
    }))

    setEmotionParticles(prev => [...prev, ...newParticles])

    // 2秒后清理粒子
    setTimeout(() => {
      setEmotionParticles(prev => 
        prev.filter(p => !newParticles.find(np => np.id === p.id))
      )
    }, 2000)
  }

  // 处理消息发送
  const handleSendMessage = () => {
    if (!messageText.trim() || isTyping) return
    
    onSendMessage(messageText)
    setMessageText('')
    
    // 创建发送粒子效果
    createEmotionParticles(window.innerWidth - 50, window.innerHeight - 100)
  }

  // 语音输入模拟
  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    
    if (!isRecording) {
      // 模拟语音识别
      setTimeout(() => {
        setIsRecording(false)
        setMessageText('通过语音输入的消息...')
      }, 2000)
    }
  }

  // 触觉反馈
  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30])
    }
  }

  return (
    <div className="enhanced-ai-chat">
      {/* 情感粒子系统 */}
      {emotionParticles.map(particle => (
        <div
          key={particle.id}
          className="emotion-particles"
          style={{
            left: particle.x,
            top: particle.y,
            position: 'fixed',
            zIndex: 9999
          }}
        />
      ))}

      {/* 消息列表 */}
      <div className="messages-scroll-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble-ai ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
            onClick={() => createEmotionParticles(
              Math.random() * window.innerWidth,
              Math.random() * window.innerHeight
            )}
          >
            {message.role === 'deity' && (
              <div className="deity-avatar-premium">
                {!imageError ? (
                  <img 
                    src={deity.imageUrl}
                    alt={deity.name}
                    className="deity-avatar-image"
                  />
                ) : (
                  <div className="deity-fallback-avatar">
                    {deity.fallbackEmoji}
                  </div>
                )}
                <div className="deity-status-indicator"></div>
              </div>
            )}
            
            <div className="message-content">
              {message.role === 'deity' && (
                <div className="message-header">
                  <span className="sender-name">{deity.name}</span>
                  <span className="message-mood">• {deity.mood}</span>
                </div>
              )}
              
              <div className="message-text">
                {message.content}
              </div>
              
              {/* 情感识别指示器 */}
              <div className="emotion-indicator">
                {detectEmotion(message.content)}
              </div>
              
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {/* 打字指示器 */}
        {isTyping && (
          <div className="typing-indicator-premium">
            <div className="deity-avatar-premium">
              {!imageError ? (
                <img 
                  src={deity.imageUrl}
                  alt={deity.name}
                  className="deity-avatar-image"
                />
              ) : (
                <div className="deity-fallback-avatar">
                  {deity.fallbackEmoji}
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

      {/* 智能输入系统 */}
      <div className="input-container-premium">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={`与${deity.name}分享您的心声...`}
          className="message-input-premium"
          rows={1}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
              hapticFeedback()
            }
          }}
        />
        
        {/* 语音输入按钮 */}
        <button 
          className={`voice-input-btn ${isRecording ? 'recording' : ''}`}
          onClick={handleVoiceInput}
          title="语音输入"
        >
          🎤
        </button>
        
        {/* 发送按钮增强 */}
        <button
          onClick={() => {
            handleSendMessage()
            hapticFeedback()
          }}
          disabled={!messageText.trim() || isTyping}
          className="send-btn-premium"
          title="发送消息"
        >
          {isTyping ? '⏳' : '🚀'}
        </button>
      </div>
    </div>
  )
}

export default EnhancedAIChat