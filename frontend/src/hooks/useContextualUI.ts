import { useState, useEffect, useCallback } from 'react'
import { aiIntelligenceService } from '../services/aiIntelligenceService'

interface UIContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  lighting: 'bright' | 'dim' | 'dark'
  colorScheme: 'warm' | 'cool' | 'neutral'
  ambientMode: 'energetic' | 'calm' | 'focused' | 'contemplative'
  userMood: string
  conversationDepth: number // 0-100
  intimacyLevel: number // 0-100
}

interface AdaptiveTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  shadowColor: string
  gradientBackground: string
  particleColor: string
  glowEffect: string
}

/**
 * 🎨 情境感知的UI适配Hook
 * 根据时间、情绪、对话深度自动调整界面视觉效果
 */
export const useContextualUI = (deityId: string, conversationHistory: any[] = []) => {
  const [uiContext, setUIContext] = useState<UIContext>({
    timeOfDay: 'morning',
    lighting: 'bright',
    colorScheme: 'warm',
    ambientMode: 'calm',
    userMood: 'neutral',
    conversationDepth: 0,
    intimacyLevel: 0
  })

  const [adaptiveTheme, setAdaptiveTheme] = useState<AdaptiveTheme>({
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#f093fb',
    shadowColor: 'rgba(102, 126, 234, 0.3)',
    gradientBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    particleColor: '#f093fb',
    glowEffect: '0 0 20px rgba(240, 147, 251, 0.4)'
  })

  // 时间感知
  const updateTimeContext = useCallback(() => {
    const hour = new Date().getHours()
    let timeOfDay: UIContext['timeOfDay']
    let lighting: UIContext['lighting']
    
    if (hour >= 6 && hour < 12) {
      timeOfDay = 'morning'
      lighting = 'bright'
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon'
      lighting = 'bright'
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'evening'
      lighting = 'dim'
    } else {
      timeOfDay = 'night'
      lighting = 'dark'
    }

    setUIContext(prev => ({
      ...prev,
      timeOfDay,
      lighting
    }))
  }, [])

  // 分析对话深度和亲密度
  const analyzeConversationContext = useCallback(() => {
    const conversationDepth = Math.min(100, conversationHistory.length * 5)
    const intimacyLevel = Math.min(100, conversationHistory.length * 3 + 20)
    
    // 分析最近消息的情绪
    let userMood = 'neutral'
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1]
      if (lastMessage?.role === 'user') {
        const emotion = aiIntelligenceService.analyzeEmotion(lastMessage.content)
        userMood = emotion.emotion
      }
    }

    setUIContext(prev => ({
      ...prev,
      conversationDepth,
      intimacyLevel,
      userMood
    }))
  }, [conversationHistory])

  // 生成适应性主题
  const generateAdaptiveTheme = useCallback(() => {
    const { timeOfDay, lighting, userMood, conversationDepth, intimacyLevel } = uiContext

    // 基础神仙主题色
    const deityBaseThemes = {
      guanyin: {
        primary: '#FFE4B5',
        secondary: '#F0E68C',
        accent: '#FFD700'
      },
      budongzun: {
        primary: '#FF6B6B',
        secondary: '#FF8E8E', 
        accent: '#FF4757'
      },
      dashizhi: {
        primary: '#4FACFE',
        secondary: '#00F2FE',
        accent: '#0984e3'
      },
      wenshu: {
        primary: '#43E97B',
        secondary: '#38F9D7',
        accent: '#00b894'
      },
      xukong: {
        primary: '#A8E6CF',
        secondary: '#C4E1F0',
        accent: '#74b9ff'
      },
      amitabha: {
        primary: '#FFB347',
        secondary: '#FFCC70',
        accent: '#fdcb6e'
      }
    }

    const baseTheme = deityBaseThemes[deityId as keyof typeof deityBaseThemes] || 
      deityBaseThemes.guanyin

    // 根据时间调整色调
    let timeModifier = 1
    let darknessLevel = 0
    
    switch (timeOfDay) {
      case 'morning':
        timeModifier = 1.1 // 更亮
        darknessLevel = 0
        break
      case 'afternoon':
        timeModifier = 1
        darknessLevel = 0
        break
      case 'evening':
        timeModifier = 0.9
        darknessLevel = 0.1
        break
      case 'night':
        timeModifier = 0.7
        darknessLevel = 0.3
        break
    }

    // 根据情绪调整色彩
    const moodModifiers = {
      joy: { saturation: 1.2, brightness: 1.1 },
      sadness: { saturation: 0.7, brightness: 0.8 },
      anger: { saturation: 1.3, brightness: 1.0, hueShift: 15 },
      fear: { saturation: 0.6, brightness: 0.7 },
      calm: { saturation: 0.9, brightness: 0.95 },
      love: { saturation: 1.1, brightness: 1.05, hueShift: -10 },
      wisdom: { saturation: 0.8, brightness: 1.0 }
    }

    const moodMod = moodModifiers[userMood as keyof typeof moodModifiers] || 
      moodModifiers.calm

    // 根据亲密度调整透明度和发光效果
    const intimacyAlpha = Math.max(0.6, Math.min(1, intimacyLevel / 100))
    const glowIntensity = Math.max(0.2, Math.min(0.6, intimacyLevel / 100))

    // 构建最终主题
    const theme: AdaptiveTheme = {
      primaryColor: baseTheme.primary,
      secondaryColor: baseTheme.secondary,
      backgroundColor: `linear-gradient(135deg, 
        rgba(${hexToRgb(baseTheme.primary)}, ${intimacyAlpha}) 0%, 
        rgba(${hexToRgb(baseTheme.secondary)}, ${intimacyAlpha}) 100%)`,
      textColor: lighting === 'dark' ? '#e0e0e0' : '#ffffff',
      accentColor: baseTheme.accent,
      shadowColor: `rgba(${hexToRgb(baseTheme.primary)}, ${glowIntensity})`,
      gradientBackground: `
        radial-gradient(circle at 20% 80%, rgba(${hexToRgb(baseTheme.primary)}, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(${hexToRgb(baseTheme.secondary)}, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, ${baseTheme.primary} 0%, ${baseTheme.secondary} 100%)
      `,
      particleColor: baseTheme.accent,
      glowEffect: `0 0 ${20 + intimacyLevel * 0.3}px rgba(${hexToRgb(baseTheme.accent)}, ${glowIntensity})`
    }

    setAdaptiveTheme(theme)
  }, [uiContext, deityId])

  // 辅助函数：hex转rgb
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return '0, 0, 0'
    
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ].join(', ')
  }

  // 初始化和更新
  useEffect(() => {
    updateTimeContext()
    analyzeConversationContext()
    
    // 每分钟检查时间变化
    const timeInterval = setInterval(updateTimeContext, 60000)
    
    return () => clearInterval(timeInterval)
  }, [updateTimeContext, analyzeConversationContext])

  useEffect(() => {
    generateAdaptiveTheme()
  }, [generateAdaptiveTheme])

  // 获取当前氛围模式
  const getAmbientMode = useCallback((): UIContext['ambientMode'] => {
    const { timeOfDay, conversationDepth, userMood } = uiContext
    
    if (userMood === 'sadness' || userMood === 'fear') return 'contemplative'
    if (userMood === 'joy' || userMood === 'love') return 'energetic' 
    if (conversationDepth > 70) return 'focused'
    if (timeOfDay === 'night' || timeOfDay === 'evening') return 'calm'
    
    return 'calm'
  }, [uiContext])

  // 获取自适应CSS变量
  const getAdaptiveCSSVariables = useCallback((): Record<string, string> => {
    return {
      '--adaptive-primary': adaptiveTheme.primaryColor,
      '--adaptive-secondary': adaptiveTheme.secondaryColor,
      '--adaptive-background': adaptiveTheme.backgroundColor,
      '--adaptive-text': adaptiveTheme.textColor,
      '--adaptive-accent': adaptiveTheme.accentColor,
      '--adaptive-shadow': adaptiveTheme.shadowColor,
      '--adaptive-gradient': adaptiveTheme.gradientBackground,
      '--adaptive-particle': adaptiveTheme.particleColor,
      '--adaptive-glow': adaptiveTheme.glowEffect,
      '--intimacy-level': `${uiContext.intimacyLevel}%`,
      '--conversation-depth': `${uiContext.conversationDepth}%`
    }
  }, [adaptiveTheme, uiContext])

  return {
    uiContext,
    adaptiveTheme,
    ambientMode: getAmbientMode(),
    cssVariables: getAdaptiveCSSVariables(),
    updateContext: analyzeConversationContext
  }
}