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
    utter.rate = 0.9
    utter.onend = () => {
      // 下一句
      if (currentIdx < paragraphs.length - 1) {
        setCurrentIdx((idx) => idx + 1)
      } else {
        setIsPlaying(false)
        onFinish?.()
      }
    }
    synth.speak(utter)
    return () => {
      synth.cancel()
    }
  }, [isPlaying, currentIdx, paragraphs, onFinish])

  if (paragraphs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>经文内容加载失败，请稍后重试</p>
      </div>
    )
  }

  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1rem', lineHeight: 1.8 }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {scripture.subtitle || scripture.title}
      </h2>
      {paragraphs.map((p, idx) => (
        <motion.p
          key={idx}
          ref={(el) => (paragraphRefs.current[idx] = el)}
          animate={{ opacity: idx === currentIdx ? 1 : 0.6 }}
          style={{ fontSize: '1rem', margin: '0.5rem 0', color: idx === currentIdx ? '#fff' : '#bbb' }}
        >
          {p}
        </motion.p>
      ))}

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {!isPlaying ? (
          <button
            onClick={() => {
              setCurrentIdx(0)
              setIsPlaying(true)
            }}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#4F46E5', color: '#fff' }}
          >
            ▶️ 开始跟读
          </button>
        ) : (
          <button
            onClick={() => setIsPlaying(false)}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff' }}
          >
            ⏸️ 暂停
          </button>
        )}
      </div>
    </div>
  )
}

export default ScriptureReader 