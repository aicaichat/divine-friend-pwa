/**
 * 移动端聊天页面
 * 专为移动端优化的AI对话体验
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import MobileLayout from '../components/mobile/MobileLayout'
import MobileBottomSheet from '../components/mobile/MobileBottomSheet'
import MobileGestures from '../components/mobile/MobileGestures'
import useMobileOptimization from '../hooks/useMobileOptimization'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  avatar?: string
  typing?: boolean
  reactions?: string[]
}

interface ChatGuide {
  type: 'buddha' | 'taisui'
  name: string
  avatar: string
  description: string
  color: string
}

const MobileChatPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { hapticFeedback, cacheManager, shouldReduceAnimations } = useMobileOptimization()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGuideInfo, setShowGuideInfo] = useState(false)
  const [currentGuide, setCurrentGuide] = useState<ChatGuide | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 从路由状态获取导师信息
  useEffect(() => {
    const state = location.state as any
    if (state?.guideType) {
      const guideData = {
        buddha: {
          type: 'buddha' as const,
          name: '大势至菩萨',
          avatar: '🙏',
          description: '智慧光明，慈悲指导',
          color: '#9C27B0'
        },
        taisui: {
          type: 'taisui' as const,
          name: '甲子太岁金辨大将军',
          avatar: '⚔️',
          description: '威严护法，庇佑平安',
          color: '#F44336'
        }
      }
      setCurrentGuide(guideData[state.guideType])
      
      // 添加欢迎消息
      const welcomeMessage: Message = {
        id: 'welcome',
        text: `善信，我是${guideData[state.guideType].name}。有什么困惑需要指点吗？`,
        isUser: false,
        timestamp: new Date(),
        avatar: guideData[state.guideType].avatar
      }
      setMessages([welcomeMessage])
    }
  }, [location.state])

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim() || !currentGuide) return

    hapticFeedback('light')

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // 模拟AI回复
    setTimeout(() => {
      const responses = [
        '阿弥陀佛，这个问题需要从因果的角度来看...',
        '据你的八字来看，当下正值转运之时...',
        '静心修行，答案自然显现...',
        '太岁护佑，此事会有转机...',
        '心若清净，万事皆顺...'
      ]
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
        avatar: currentGuide.avatar
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  // 处理键盘输入
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 快捷回复选项
  const quickReplies = [
    '今日运势如何？',
    '事业发展建议',
    '感情问题咨询',
    '健康方面指导',
    '财运分析',
    '修行建议'
  ]

  // 表情符号
  const emojis = ['🙏', '🧘', '🌟', '✨', '💫', '🔮', '📿', '🌸', '🌺', '🍃']

  // 渲染消息
  const renderMessage = (message: Message) => (
    <motion.div
      key={message.id}
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceAnimations ? 0.1 : 0.3 }}
    >
      <div className={`max-w-[75%] ${message.isUser ? 'order-2' : 'order-1'}`}>
        <div className="flex items-end gap-2">
          {!message.isUser && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg flex-shrink-0">
              {message.avatar || '🤖'}
            </div>
          )}
          
          <div
            className={`px-4 py-3 rounded-2xl ${
              message.isUser
                ? 'bg-purple-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
            <div className={`text-xs mt-1 ${
              message.isUser ? 'text-purple-100' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  // 渲染输入状态
  const renderTypingIndicator = () => (
    <motion.div
      className="flex justify-start mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-end gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">
          {currentGuide?.avatar || '🤖'}
        </div>
        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <MobileLayout
      title={currentGuide?.name || '智能对话'}
      showBackButton={true}
      backgroundColor="#f8fafc"
    >
      <div className="flex flex-col h-full">
        {/* 聊天头部信息 */}
        {currentGuide && (
          <motion.div
            className="bg-white border-b border-gray-100 p-4 cursor-pointer"
            onClick={() => setShowGuideInfo(true)}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${currentGuide.color}20` }}
              >
                {currentGuide.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{currentGuide.name}</h3>
                <p className="text-sm text-gray-600">{currentGuide.description}</p>
              </div>
              <div className="text-gray-400">ℹ️</div>
            </div>
          </motion.div>
        )}

        {/* 消息列表 */}
        <div className="flex-1 overflow-auto p-4 pb-2">
          <MobileGestures enableSwipe={false}>
            <div className="space-y-2">
              {messages.map(renderMessage)}
              <AnimatePresence>
                {isTyping && renderTypingIndicator()}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </MobileGestures>
        </div>

        {/* 快捷回复 */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {quickReplies.map((reply, index) => (
                <motion.button
                  key={index}
                  className="flex-shrink-0 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setInputText(reply)
                    hapticFeedback('light')
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="bg-white border-t border-gray-100 p-4">
          <div className="flex items-end gap-3">
            <button
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg"
              onClick={() => setShowEmojiPicker(true)}
            >
              😊
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                className="w-full px-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent focus:border-purple-500"
                maxLength={500}
              />
              <div className="absolute right-3 bottom-1 text-xs text-gray-400">
                {inputText.length}/500
              </div>
            </div>
            
            <motion.button
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                inputText.trim() ? 'bg-purple-500' : 'bg-gray-300'
              }`}
              onClick={sendMessage}
              disabled={!inputText.trim()}
              whileTap={{ scale: 0.9 }}
            >
              ✈️
            </motion.button>
          </div>
        </div>
      </div>

      {/* 表情选择器 */}
      <MobileBottomSheet
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        title="选择表情"
        height="auto"
      >
        <div className="p-4">
          <div className="grid grid-cols-5 gap-4">
            {emojis.map((emoji, index) => (
              <motion.button
                key={index}
                className="w-12 h-12 text-2xl rounded-lg bg-gray-50 hover:bg-gray-100"
                onClick={() => {
                  setInputText(prev => prev + emoji)
                  setShowEmojiPicker(false)
                  hapticFeedback('light')
                }}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </MobileBottomSheet>

      {/* 导师信息 */}
      <MobileBottomSheet
        isOpen={showGuideInfo}
        onClose={() => setShowGuideInfo(false)}
        title="导师信息"
        height="half"
      >
        {currentGuide && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                style={{ backgroundColor: `${currentGuide.color}20` }}
              >
                {currentGuide.avatar}
              </div>
              <h2 className="text-xl font-bold mb-2">{currentGuide.name}</h2>
              <p className="text-gray-600">{currentGuide.description}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">专长领域</h3>
                <div className="flex flex-wrap gap-2">
                  {(currentGuide.type === 'buddha' 
                    ? ['智慧开发', '内心平静', '业障消除', '慈悲修行']
                    : ['事业发展', '财运提升', '健康护佑', '化解困难']
                  ).map(function(skill, index) {
                    return (
                      <span key={index} className="px-3 py-1 bg-white rounded-full text-sm">
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">修行建议</h3>
                <p className="text-sm text-gray-600">
                  {currentGuide.type === 'buddha' 
                    ? '每日念诵心咒，保持慈悲心，积累功德，净化心灵。'
                    : '面向太岁方位祈祷，供奉清水，诚心祈求护佑平安。'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </MobileBottomSheet>
    </MobileLayout>
  )
}

export default MobileChatPage