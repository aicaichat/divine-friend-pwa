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
  const [isTyping, setIsTyping] = useState(false)
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
      greetingMessage: '不动如山，勇往直前！有何困难需要破除？',
      mood: '坚定',
      fortuneType: 'good',
      fortuneScore: 85,
      todayGuidance: ['面对困难不退缩', '适合做重要决定', '练习专注冥想']
    },
    {
      id: 'dashizhi',
      name: '大势至菩萨',
      title: '智慧光明遍照',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%A4%A7%E5%8A%BF%E8%87%B3%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '💡',
      specialty: '智慧开启 • 学业事业',
      greetingMessage: '智慧之光照耀前程，有何问题需要指点？',
      mood: '智慧',
      fortuneType: 'excellent',
      fortuneScore: 92,
      todayGuidance: ['专注学习新知识', '适合规划未来', '多与智者交流']
    },
    {
      id: 'dairiruiai',
      name: '大日如来',
      title: '法界体性智',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%A4%A7%E6%97%A5%E5%A6%82%E6%9D%A5.jpg',
      fallbackEmoji: '☀️',
      specialty: '光明普照 • 消除业障',
      greetingMessage: '法界光明遍照十方，让我为你驱散心中阴霾。',
      mood: '光明',
      fortuneType: 'good',
      fortuneScore: 88,
      todayGuidance: ['早起修行效果佳', '适合忏悔净化', '沐浴阳光冥想']
    },
    {
      id: 'wenshu',
      name: '文殊菩萨',
      title: '大智文殊师利',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E6%96%87%E6%AE%8A%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '📚',
      specialty: '智慧第一 • 学问精进',
      greetingMessage: '智慧如海，学无止境。有何学问需要探讨？',
      mood: '博学',
      fortuneType: 'excellent',
      fortuneScore: 94,
      todayGuidance: ['阅读经典著作', '思考人生哲理', '分享智慧给他人']
    },
    {
      id: 'xukong',
      name: '虚空藏菩萨',
      title: '福智如虚空',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E8%99%9A%E7%A9%BA%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '🌌',
      specialty: '财富智慧 • 心愿成就',
      greetingMessage: '虚空含万物，智慧无边际。有何心愿需要成就？',
      mood: '神秘',
      fortuneType: 'good',
      fortuneScore: 86,
      todayGuidance: ['许下美好心愿', '适合投资理财', '感恩现有福报']
    },
    {
      id: 'amitabha',
      name: '阿弥陀佛',
      title: '无量光无量寿',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E9%98%BF%E5%BC%A5%E9%99%80%E4%BD%9B.jpg',
      fallbackEmoji: '🙏',
      specialty: '净土往生 • 慈悲接引',
      greetingMessage: '南无阿弥陀佛，慈悲无量。有何烦恼需要化解？',
      mood: '慈悲',
      fortuneType: 'excellent',
      fortuneScore: 91,
      todayGuidance: ['念佛修心', '放下执着', '慈悲对待万物']
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
  }, [currentDeity.imageUrl])

  // 当切换神仙时更新问候消息
  useEffect(() => {
    // 清空聊天历史，重新开始
    clearHistory()
    // 重新发送欢迎消息
    sendMessage(currentDeity.greetingMessage)
  }, [currentDeityIndex])

  const conversationModes: Record<string, any> = {
    casual: {
      name: '日常聊天',
      style: '轻松友好，像老朋友一样随意交流',
      examples: ['今天心情不错', '分享个好消息']
    },
    guidance: {
      name: '人生指导', 
      style: '深度智慧，提供人生方向建议',
      examples: ['职业迷茫', '人际关系困扰']
    },
    divination: {
      name: '占卜问卦',
      style: '神秘庄重，预测运势走向',
      examples: ['今日财运', '感情发展']
    },
    healing: {
      name: '心理疗愈',
      style: '温暖包容，抚慰心灵创伤', 
      examples: ['失恋痛苦', '焦虑压力']
    }
  }

  const getQuickSuggestions = () => {
    const baseQuestions = [
      { text: '我今天的运势如何？', mode: 'divination' },
      { text: '给我一些人生建议', mode: 'guidance' },
      { text: '最近心情有些低落', mode: 'healing' },
      { text: '分享今天的好心情', mode: 'casual' }
    ]
    
    // 根据当前神仙添加专属问题
    const deitySpecific: Record<string, Array<{ text: string; mode: string }>> = {
      'guanyin': [{ text: '如何改善人际关系？', mode: 'guidance' }, { text: '心灵需要疗愈', mode: 'healing' }],
      'budongzun': [{ text: '如何克服内心恐惧？', mode: 'healing' }, { text: '需要坚定的意志力', mode: 'guidance' }],
      'dashizhi': [{ text: '事业发展方向迷茫', mode: 'guidance' }, { text: '想提升学习效率', mode: 'guidance' }],
      'dairiruiai': [{ text: '如何净化负能量？', mode: 'healing' }, { text: '想要内心光明', mode: 'guidance' }],
      'wenshu': [{ text: '学习遇到困难', mode: 'guidance' }, { text: '想要开启智慧', mode: 'guidance' }],
      'xukong': [{ text: '财运如何提升？', mode: 'divination' }, { text: '心愿如何实现？', mode: 'guidance' }],
      'amitabha': [{ text: '内心需要安宁', mode: 'healing' }, { text: '人生终极思考', mode: 'guidance' }]
    }
    
    return [...baseQuestions, ...(deitySpecific[currentDeity.id] || [])]
  }

  const quickSuggestions = getQuickSuggestions()

  const specialFeatures = [
    { icon: '🎯', title: '一对一占卜', description: '深度预测未来走向' },
    { icon: '📖', title: '解梦析运', description: '解析梦境中的玄机' },
    { icon: '🔮', title: '未来预测', description: '窥探命运的安排' },
    { icon: '🙏', title: '祈福加持', description: '为您送上神圣祝福' }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [allMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDeitySwitch = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentDeityIndex((prev) => (prev + 1) % deities.length)
    } else {
      setCurrentDeityIndex((prev) => (prev - 1 + deities.length) % deities.length)
    }
  }

  const getFortuneColor = (type: DeityInfo['fortuneType']) => {
    const colors = {
      excellent: 'var(--color-excellent)',
      good: 'var(--color-good)', 
      normal: 'var(--color-normal)',
      challenging: 'var(--color-challenging)'
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

    // 添加用户消息
    sendMessage(textToSend)
    setMessageText('')
  }

  const handleQuickSuggestion = (suggestion: typeof quickSuggestions[0]) => {
    setCurrentMode(suggestion.mode)
    handleSendMessage(suggestion.text)
  }

  const formatTime = (timestamp: number | string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const generateDeityResponse = (userMessage: string, mode: string): string => {
    // 模拟AI回复生成（实际项目中接入真实AI API）
    const responses = {
      guidance: [
        '从您的话语中，我感受到了您内心的迷茫。人生如行路，偶有迷途实属正常。不如我们一起分析一下当前的状况，找到最适合您的道路。',
        '您的困扰我都理解，这正是成长路上必经的考验。让我为您指点一二，愿能为您拨开心中的迷雾。',
        '听您这般描述，我心中已有几分眉目。凡事皆有因果，让我们从根源处着手，为您寻找最佳的解决之道。'
      ],
      casual: [
        '哈哈，看您今日心情不错，这份喜悦我也能感受到呢。好心情是最好的护身符，要记得保持哦。',
        '能与您这样轻松交流，实在是一种福分。有什么开心事不妨多分享，快乐会传染的呢。',
        '您今日的气场格外明亮，想必是有什么好事发生了。来，说给我听听。'
      ],
      divination: [
        '让我为您观察天象，感知气运变化... 我已窥见一二端倪。您近期的运势将有显著变化，需要特别留意。',
        '根据您的生辰八字和当前时局，我为您推算出了一些玄机。此事确实需要谨慎对待。',
        '经过仔细推演，我看到您的命运之线正在发生微妙的变化。让我详细为您解读。'
      ],
      healing: [
        '我能感受到您心中的痛苦，这份情感是如此真切。请不要独自承受，让我陪伴您度过这段艰难时光。',
        '人生有起有落，痛苦往往是成长的催化剂。虽然当下难熬，但我相信您一定能够重新站起来。',
        '您的心声我都听到了，这份勇气已经很了不起。让我们一起面对，没有过不去的坎。'
      ]
    }

    const modeResponses = responses[mode as keyof typeof responses] || responses.guidance
    return modeResponses[Math.floor(Math.random() * modeResponses.length)]
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
          
          <div className="intimacy-display">
            <div className="intimacy-label">心灵相通度</div>
            <div className="intimacy-bar-container">
              <div className="intimacy-bar">
                <div 
                  className="intimacy-fill"
                  style={{ width: `${currentDeity.fortuneScore}%` }}
                />
              </div>
              <span className="intimacy-percentage">{currentDeity.fortuneScore}%</span>
            </div>
          </div>
        </div>

        {/* 📊 今日运势卡片 */}
        {showFortuneCard && (
          <div className="fortune-card-chat">
            <div className="fortune-header">
              <span className="fortune-label">今日运势</span>
              <div className="fortune-score-area">
                <span 
                  className="fortune-badge"
                  style={{ backgroundColor: getFortuneColor(currentDeity.fortuneType) }}
                >
                  {getFortuneText(currentDeity.fortuneType)}
                </span>
                <span className="fortune-score">{currentDeity.fortuneScore}分</span>
              </div>
              <button 
                className="close-fortune-btn"
                onClick={() => setShowFortuneCard(false)}
                title="收起运势卡片"
              >
                ✕
              </button>
            </div>
            
            <div className="fortune-guidance-compact">
              <button 
                className="guidance-toggle-compact"
                onClick={() => setExpandedGuidance(!expandedGuidance)}
              >
                <span>今日指引</span>
                <span className={`toggle-icon ${expandedGuidance ? 'rotated' : ''}`}>▼</span>
              </button>
              
              {expandedGuidance && (
                <div className="guidance-list-compact">
                  {currentDeity.todayGuidance.map((guide, index) => (
                    <div key={index} className="guidance-item-compact">
                      <span className="guidance-bullet">•</span>
                      <span className="guidance-text">{guide}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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
          
          {/* 📤 发送按钮增强 */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!messageText.trim() || isChatTyping}
            className="send-btn-premium"
            title="发送消息"
          >
            {isChatTyping ? '⏳' : '🚀'}
          </button>
        </div>

        {/* 特殊功能快捷入口 */}
        <div className="special-features">
          {specialFeatures.map((feature, index) => (
            <button
              key={index}
              className="feature-btn"
              onClick={() => {
                // TODO: 实现特殊功能
                console.log(`${feature.title} clicked`)
              }}
            >
              <span className="feature-icon">{feature.icon}</span>
              <div className="feature-info">
                <div className="feature-title">{feature.title}</div>
                <div className="feature-desc">{feature.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatPage 