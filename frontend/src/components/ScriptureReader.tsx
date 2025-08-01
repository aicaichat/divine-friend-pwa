import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

export interface Scripture {
  id: string
  title: string
  subtitle?: string
  description?: string
  content?: {
    fullText: string[]
    readingGuide?: {
      recommendedSpeed?: string
      pauseBetweenParagraphs?: boolean
      highlightKeywords?: boolean
      meditationBreaks?: boolean
    }
  }
  paragraphs?: string[] // 兼容旧格式
  metadata?: {
    totalParagraphs: number
    totalCharacters: number
    keywords: string[]
    benefits: string[]
  }
  practice?: {
    recommendedFrequency: string
    bestTime: string
    environment: string
    posture: string
    breathing: string
  }
  meditation?: {
    visualization: string
    mantra: string
    focus: string
  }
}

interface ScriptureReaderProps {
  scripture: Scripture
  onFinish?: () => void
}

/**
 * ScriptureReader – 基础经文阅读 + TTS 组件
 * 1. 支持滚动阅读
 * 2. 支持 Web-Speech-API TTS 跟读
 * 3. 读取完毕触发 onFinish
 */
const ScriptureReader: React.FC<ScriptureReaderProps> = ({ scripture, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [readingSpeed, setReadingSpeed] = useState(0.8)
  const [fontSize, setFontSize] = useState(18)
  const paragraphRefs = useRef<Array<HTMLParagraphElement | null>>([])

  // 获取经文段落
  const getParagraphs = () => {
    if (scripture.paragraphs) {
      return scripture.paragraphs
    }
    if (scripture.content?.fullText) {
      return scripture.content.fullText
    }
    return []
  }

  const paragraphs = getParagraphs()

  // 设计系统
  const designSystem = {
    colors: {
      primary: '#D4AF37',
      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 115, 85, 0.05) 100%)',
      text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.7)',
        accent: '#D4AF37'
      }
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px'
    }
  };

  // 自动滚动到当前句
  useEffect(() => {
    const el = paragraphRefs.current[currentIdx]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentIdx])

  // TTS 播放/暂停
  useEffect(() => {
    if (!isPlaying || paragraphs.length === 0) return () => {}
    const synth = window.speechSynthesis
    if (!synth) return () => {}

    const utter = new SpeechSynthesisUtterance(paragraphs[currentIdx])
    utter.lang = 'zh-CN'
    utter.rate = readingSpeed
    utter.pitch = 1
    utter.volume = 1
    
    utter.onend = () => {
      // 段落间停顿
      setTimeout(() => {
        if (currentIdx < paragraphs.length - 1) {
          setCurrentIdx((idx) => idx + 1)
        } else {
          setIsPlaying(false)
          onFinish?.()
        }
      }, 600)
    }
    
    synth.speak(utter)
    return () => {
      synth.cancel()
    }
  }, [isPlaying, currentIdx, paragraphs, onFinish, readingSpeed])

  if (paragraphs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: designSystem.colors.background,
          borderRadius: designSystem.borderRadius.lg
        }}
      >
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📜</span>
        <p style={{ 
          color: designSystem.colors.text.secondary,
          fontSize: '1.1rem'
        }}>
          经文内容加载失败，请稍后重试
        </p>
      </motion.div>
    )
  }

  return (
    <div style={{ 
      background: designSystem.colors.background,
      borderRadius: designSystem.borderRadius.lg,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      {/* 标题区域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(139, 115, 85, 0.1) 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)'
        }}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌸</span>
        <h2 style={{ 
          fontSize: '1.8rem',
          fontWeight: '700',
          color: designSystem.colors.text.primary,
          margin: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {scripture.subtitle || scripture.title}
        </h2>
      </motion.div>

      {/* 控制面板 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* 播放控制 */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {!isPlaying ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentIdx(0)
                  setIsPlaying(true)
                }}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: designSystem.borderRadius.md,
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ▶️ 开始跟读
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(false)}
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  border: 'none',
                  borderRadius: designSystem.borderRadius.md,
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ⏸️ 暂停跟读
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentIdx(0)}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                border: 'none',
                borderRadius: designSystem.borderRadius.md,
                color: 'white',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              🔄 重新开始
            </motion.button>
          </div>

          {/* 设置控制 */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: designSystem.colors.text.secondary
            }}>
              <span style={{ fontSize: '0.9rem' }}>语速:</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={readingSpeed}
                onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                style={{
                  width: '80px',
                  accentColor: designSystem.colors.primary
                }}
              />
              <span style={{ fontSize: '0.8rem', minWidth: '30px' }}>
                {readingSpeed}x
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: designSystem.colors.text.secondary
            }}>
              <span style={{ fontSize: '0.9rem' }}>字号:</span>
              <input
                type="range"
                min="14"
                max="24"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{
                  width: '80px',
                  accentColor: designSystem.colors.primary
                }}
              />
              <span style={{ fontSize: '0.8rem', minWidth: '30px' }}>
                {fontSize}px
              </span>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div style={{
          marginTop: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <motion.div
            animate={{
              width: `${((currentIdx + 1) / paragraphs.length) * 100}%`
            }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #D4AF37 0%, #F4D03F 100%)',
              borderRadius: '10px'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          color: designSystem.colors.text.secondary
        }}>
          <span>{currentIdx + 1} / {paragraphs.length}</span>
          <span>{Math.round(((currentIdx + 1) / paragraphs.length) * 100)}%</span>
        </div>
      </motion.div>

      {/* 经文内容 */}
      <div style={{ 
        maxHeight: '50vh', 
        overflowY: 'auto', 
        padding: '2rem',
        lineHeight: 1.8 
      }}>
        {paragraphs.map((paragraph, idx) => (
          <motion.p
            key={idx}
            ref={(el) => (paragraphRefs.current[idx] = el)}
            animate={{ 
              opacity: idx === currentIdx ? 1 : 0.5,
              scale: idx === currentIdx ? 1.02 : 1,
              background: idx === currentIdx ? 'rgba(212, 175, 55, 0.2)' : 'transparent'
            }}
            transition={{ duration: 0.3 }}
            onClick={() => setCurrentIdx(idx)}
            style={{ 
              fontSize: `${fontSize}px`,
              margin: '1rem 0',
              padding: '1rem',
              borderRadius: designSystem.borderRadius.sm,
              color: idx === currentIdx ? designSystem.colors.text.primary : designSystem.colors.text.secondary,
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: idx === currentIdx ? '600' : '400'
            }}
          >
            {paragraph}
          </motion.p>
        ))}
      </div>

      {/* 底部祈愿 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          padding: '1.5rem',
          background: 'rgba(212, 175, 55, 0.1)',
          borderTop: '1px solid rgba(212, 175, 55, 0.3)',
          textAlign: 'center'
        }}
      >
        <p style={{
          fontSize: '0.9rem',
          color: designSystem.colors.text.accent,
          margin: 0,
          fontStyle: 'italic'
        }}>
          🙏 愿以此功德，普及于一切，我等与众生，皆共成佛道
        </p>
      </motion.div>
    </div>
  )
}

export default ScriptureReader 