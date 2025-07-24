/**
 * 多模态交互引擎
 * 支持语音、图片、表情、手势等多种交互方式
 */

interface VoiceConfig {
  enabled: boolean
  language: string
  pitch: number
  rate: number
  volume: number
  voiceURI?: string
}

interface VoiceMessage {
  id: string
  text: string
  audioData?: Blob
  duration?: number
  timestamp: number
}

interface ImageAnalysis {
  description: string
  emotions: string[]
  objects: string[]
  colors: string[]
  mood: string
  symbolism: string[]
}

interface GestureConfig {
  enabled: boolean
  sensitivity: number
  gestures: Map<string, string> // 手势名称 -> 动作
}

interface EmotionalExpression {
  type: 'emoji' | 'sticker' | 'animation'
  content: string
  intensity: number
  context: string
}

// 语音合成和识别管理器
class VoiceManager {
  private synthesis: SpeechSynthesis
  private recognition: SpeechRecognition | null = null
  private config: VoiceConfig
  private isListening = false
  
  constructor() {
    this.synthesis = window.speechSynthesis
    this.config = {
      enabled: true,
      language: 'zh-CN',
      pitch: 1,
      rate: 0.9,
      volume: 0.8
    }
    this.initializeRecognition()
  }
  
  private initializeRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = this.config.language
    } else if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = this.config.language
    }
  }
  
  // 文本转语音
  async speak(text: string, deityId?: string): Promise<void> {
    if (!this.config.enabled) return
    
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // 根据神仙选择合适的声音
      const voice = this.selectDeityVoice(deityId)
      if (voice) {
        utterance.voice = voice
      }
      
      utterance.pitch = this.config.pitch
      utterance.rate = this.config.rate
      utterance.volume = this.config.volume
      utterance.lang = this.config.language
      
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(event.error)
      
      // 停止当前语音
      this.synthesis.cancel()
      this.synthesis.speak(utterance)
    })
  }
  
  private selectDeityVoice(deityId?: string): SpeechSynthesisVoice | null {
    const voices = this.synthesis.getVoices()
    const chineseVoices = voices.filter(voice => voice.lang.startsWith('zh'))
    
    if (chineseVoices.length === 0) return null
    
    // 根据神仙特性选择声音
    const voicePreferences = {
      'guanyin': ['female', 'gentle', 'soft'],
      'budongzun': ['male', 'strong', 'powerful'],
      'dashizhi': ['male', 'wise', 'deep'],
      'wenshu': ['male', 'scholarly', 'elegant'],
      'xukong': ['neutral', 'mysterious', 'ethereal'],
      'amitabha': ['male', 'calm', 'serene']
    }
    
    const preferences = voicePreferences[deityId as keyof typeof voicePreferences] || ['neutral']
    
    // 简单的声音选择逻辑
    if (preferences.includes('female')) {
      return chineseVoices.find(voice => voice.name.includes('Female')) || chineseVoices[0]
    } else if (preferences.includes('male')) {
      return chineseVoices.find(voice => voice.name.includes('Male')) || chineseVoices[0]
    }
    
    return chineseVoices[0]
  }
  
  // 语音识别
  async startListening(): Promise<string> {
    if (!this.recognition || this.isListening) {
      throw new Error('语音识别不可用或正在进行中')
    }
    
    return new Promise((resolve, reject) => {
      this.isListening = true
      
      this.recognition!.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        this.isListening = false
        resolve(transcript)
      }
      
      this.recognition!.onerror = (event) => {
        this.isListening = false
        reject(new Error(`语音识别错误: ${event.error}`))
      }
      
      this.recognition!.onend = () => {
        this.isListening = false
      }
      
      try {
        this.recognition!.start()
      } catch (error) {
        this.isListening = false
        reject(error)
      }
    })
  }
  
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }
  
  stopSpeaking(): void {
    this.synthesis.cancel()
  }
  
  updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
  
  getConfig(): VoiceConfig {
    return { ...this.config }
  }
  
  isSupported(): boolean {
    return 'speechSynthesis' in window && (
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    )
  }
  
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices().filter(voice => voice.lang.startsWith('zh'))
  }
}

// 图像分析管理器
class ImageAnalyzer {
  // 分析上传的图片
  async analyzeImage(imageFile: File): Promise<ImageAnalysis> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        const imageData = event.target?.result as string
        
        try {
          // 创建图像元素进行分析
          const img = new Image()
          img.onload = () => {
            const analysis = this.performBasicAnalysis(img, imageData)
            resolve(analysis)
          }
          img.onerror = () => reject(new Error('图片加载失败'))
          img.src = imageData
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(imageFile)
    })
  }
  
  private performBasicAnalysis(img: HTMLImageElement, imageData: string): ImageAnalysis {
    // 基础图像分析（实际产品中会使用更高级的AI视觉API）
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    
    // 获取图像数据
    const imagePixelData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // 分析颜色
    const colors = this.analyzeColors(imagePixelData)
    
    // 基础描述生成
    const description = this.generateDescription(colors, img.width, img.height)
    
    // 情感分析（基于颜色和构图的简单推断）
    const emotions = this.inferEmotionsFromImage(colors)
    
    // 心情分析
    const mood = this.analyzeMood(colors, emotions)
    
    return {
      description,
      emotions,
      objects: [], // 简化版本不做对象识别
      colors,
      mood,
      symbolism: this.analyzeSymbolism(colors)
    }
  }
  
  private analyzeColors(imageData: ImageData): string[] {
    const data = imageData.data
    const colorFrequency = new Map<string, number>()
    
    // 采样分析（每10个像素采样一次）
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      const colorName = this.getColorName(r, g, b)
      colorFrequency.set(colorName, (colorFrequency.get(colorName) || 0) + 1)
    }
    
    // 返回出现频率最高的颜色
    return Array.from(colorFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color)
  }
  
  private getColorName(r: number, g: number, b: number): string {
    // 简化的颜色分类
    if (r > 200 && g > 200 && b > 200) return '白色'
    if (r < 50 && g < 50 && b < 50) return '黑色'
    if (r > 150 && g < 100 && b < 100) return '红色'
    if (r < 100 && g > 150 && b < 100) return '绿色'
    if (r < 100 && g < 100 && b > 150) return '蓝色'
    if (r > 150 && g > 150 && b < 100) return '黄色'
    if (r > 150 && g < 100 && b > 150) return '紫色'
    if (r > 150 && g > 100 && b < 100) return '橙色'
    if (r > 100 && g > 100 && b > 100) return '灰色'
    return '其他'
  }
  
  private generateDescription(colors: string[], width: number, height: number): string {
    const aspect = width / height
    let composition = ''
    
    if (aspect > 1.5) composition = '横向构图'
    else if (aspect < 0.7) composition = '纵向构图'
    else composition = '方形构图'
    
    const dominantColor = colors[0] || '多彩'
    
    return `这是一张${composition}的图片，以${dominantColor}为主色调，整体色彩${this.getColorMood(colors)}`
  }
  
  private getColorMood(colors: string[]): string {
    const warmColors = ['红色', '橙色', '黄色']
    const coolColors = ['蓝色', '绿色', '紫色']
    const neutralColors = ['白色', '黑色', '灰色']
    
    const warmCount = colors.filter(c => warmColors.includes(c)).length
    const coolCount = colors.filter(c => coolColors.includes(c)).length
    const neutralCount = colors.filter(c => neutralColors.includes(c)).length
    
    if (warmCount > coolCount && warmCount > neutralCount) return '温暖'
    if (coolCount > warmCount && coolCount > neutralCount) return '清冷'
    if (neutralCount > 2) return '素雅'
    return '和谐'
  }
  
  private inferEmotionsFromImage(colors: string[]): string[] {
    const emotions: string[] = []
    
    colors.forEach(color => {
      switch (color) {
        case '红色':
          emotions.push('热情', '活力', '兴奋')
          break
        case '蓝色':
          emotions.push('平静', '安宁', '深沉')
          break
        case '绿色':
          emotions.push('自然', '和谐', '生机')
          break
        case '黄色':
          emotions.push('快乐', '阳光', '希望')
          break
        case '紫色':
          emotions.push('神秘', '高雅', '浪漫')
          break
        case '黑色':
          emotions.push('深沉', '严肃', '神秘')
          break
        case '白色':
          emotions.push('纯净', '简约', '宁静')
          break
      }
    })
    
    return Array.from(new Set(emotions)).slice(0, 3)
  }
  
  private analyzeMood(colors: string[], emotions: string[]): string {
    if (emotions.includes('平静') || emotions.includes('宁静')) return '宁静'
    if (emotions.includes('热情') || emotions.includes('兴奋')) return '激昂'
    if (emotions.includes('快乐') || emotions.includes('阳光')) return '愉悦'
    if (emotions.includes('深沉') || emotions.includes('神秘')) return '深邃'
    if (emotions.includes('自然') || emotions.includes('和谐')) return '和谐'
    return '平和'
  }
  
  private analyzeSymbolism(colors: string[]): string[] {
    const symbolism: string[] = []
    
    colors.forEach(color => {
      switch (color) {
        case '红色':
          symbolism.push('吉祥', '喜庆', '力量')
          break
        case '金色':
          symbolism.push('富贵', '神圣', '智慧')
          break
        case '紫色':
          symbolism.push('贵族', '神秘', '灵性')
          break
        case '白色':
          symbolism.push('纯洁', '神圣', '新生')
          break
        case '绿色':
          symbolism.push('生命', '成长', '希望')
          break
        case '蓝色':
          symbolism.push('天空', '海洋', '无限')
          break
      }
    })
    
    return Array.from(new Set(symbolism)).slice(0, 3)
  }
}

// 手势识别管理器
class GestureManager {
  private config: GestureConfig
  private isTracking = false
  private gestureCallbacks = new Map<string, Function>()
  
  constructor() {
    this.config = {
      enabled: false, // 默认关闭，需要用户主动启用
      sensitivity: 0.5,
      gestures: new Map([
        ['wave', '挥手问候'],
        ['thumbsUp', '点赞'],
        ['peace', '和平手势'],
        ['heart', '心形手势'],
        ['pray', '祈祷手势']
      ])
    }
  }
  
  // 启动手势识别（需要摄像头权限）
  async startGestureTracking(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('当前设备不支持手势识别')
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      this.isTracking = true
      
      // 这里应该集成手势识别库，如 MediaPipe 或 TensorFlow.js
      // 简化版本只提供接口
      console.log('手势识别已启动')
      
      return Promise.resolve()
    } catch (error) {
      throw new Error('无法访问摄像头')
    }
  }
  
  stopGestureTracking(): void {
    this.isTracking = false
    console.log('手势识别已停止')
  }
  
  // 注册手势回调
  onGesture(gesture: string, callback: Function): void {
    this.gestureCallbacks.set(gesture, callback)
  }
  
  // 移除手势回调
  offGesture(gesture: string): void {
    this.gestureCallbacks.delete(gesture)
  }
  
  // 模拟手势触发（用于测试）
  simulateGesture(gesture: string): void {
    const callback = this.gestureCallbacks.get(gesture)
    if (callback) {
      callback(gesture)
    }
  }
  
  isSupported(): boolean {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  }
  
  getConfig(): GestureConfig {
    return { ...this.config }
  }
  
  updateConfig(newConfig: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// 情感表达管理器
class EmotionalExpressionManager {
  private expressions = new Map<string, EmotionalExpression[]>()
  
  constructor() {
    this.initializeExpressions()
  }
  
  private initializeExpressions(): void {
    // 基础表情包
    this.expressions.set('joy', [
      { type: 'emoji', content: '😊', intensity: 50, context: 'gentle_joy' },
      { type: 'emoji', content: '😄', intensity: 70, context: 'strong_joy' },
      { type: 'emoji', content: '🎉', intensity: 90, context: 'celebration' },
      { type: 'sticker', content: '开心.gif', intensity: 80, context: 'animated_joy' }
    ])
    
    this.expressions.set('sadness', [
      { type: 'emoji', content: '😢', intensity: 60, context: 'gentle_sadness' },
      { type: 'emoji', content: '😭', intensity: 80, context: 'strong_sadness' },
      { type: 'sticker', content: '安慰.gif', intensity: 70, context: 'comfort' }
    ])
    
    this.expressions.set('anger', [
      { type: 'emoji', content: '😤', intensity: 60, context: 'mild_anger' },
      { type: 'emoji', content: '😠', intensity: 80, context: 'strong_anger' }
    ])
    
    this.expressions.set('surprise', [
      { type: 'emoji', content: '😮', intensity: 60, context: 'mild_surprise' },
      { type: 'emoji', content: '😱', intensity: 90, context: 'shock' }
    ])
    
    this.expressions.set('love', [
      { type: 'emoji', content: '💕', intensity: 70, context: 'gentle_love' },
      { type: 'emoji', content: '❤️', intensity: 90, context: 'strong_love' },
      { type: 'sticker', content: '爱心.gif', intensity: 85, context: 'animated_love' }
    ])
    
    this.expressions.set('gratitude', [
      { type: 'emoji', content: '🙏', intensity: 70, context: 'thank_you' },
      { type: 'emoji', content: '🎊', intensity: 80, context: 'celebration_thanks' }
    ])
    
    this.expressions.set('peace', [
      { type: 'emoji', content: '☮️', intensity: 60, context: 'peace_symbol' },
      { type: 'emoji', content: '🕉️', intensity: 80, context: 'spiritual_peace' },
      { type: 'sticker', content: '莲花.gif', intensity: 90, context: 'lotus_peace' }
    ])
  }
  
  // 根据情感和强度选择表达方式
  selectExpression(emotion: string, intensity: number = 50, context?: string): EmotionalExpression | null {
    const emotionExpressions = this.expressions.get(emotion.toLowerCase())
    if (!emotionExpressions) return null
    
    // 筛选合适强度的表达方式
    const suitableExpressions = emotionExpressions.filter(expr => {
      const intensityMatch = Math.abs(expr.intensity - intensity) < 30
      const contextMatch = !context || expr.context.includes(context)
      return intensityMatch && contextMatch
    })
    
    if (suitableExpressions.length === 0) {
      return emotionExpressions[0] // 返回默认表达方式
    }
    
    // 随机选择一个合适的表达方式
    return suitableExpressions[Math.floor(Math.random() * suitableExpressions.length)]
  }
  
  // 获取所有可用的情感类型
  getAvailableEmotions(): string[] {
    return Array.from(this.expressions.keys())
  }
  
  // 添加自定义表达方式
  addCustomExpression(emotion: string, expression: EmotionalExpression): void {
    if (!this.expressions.has(emotion)) {
      this.expressions.set(emotion, [])
    }
    this.expressions.get(emotion)!.push(expression)
  }
  
  // 生成情感表达建议
  suggestExpressions(userMessage: string, emotion: string, intensity: number): EmotionalExpression[] {
    const suggestions: EmotionalExpression[] = []
    
    // 基于消息内容的表达建议
    const messageExpressions = this.analyzeMessageForExpressions(userMessage)
    suggestions.push(...messageExpressions)
    
    // 基于情感的表达建议
    const emotionExpression = this.selectExpression(emotion, intensity)
    if (emotionExpression) {
      suggestions.push(emotionExpression)
    }
    
    // 去重并限制数量
    const uniqueSuggestions = suggestions
      .filter((expr, index, self) => 
        index === self.findIndex(e => e.content === expr.content)
      )
      .slice(0, 4)
    
    return uniqueSuggestions
  }
  
  private analyzeMessageForExpressions(message: string): EmotionalExpression[] {
    const expressions: EmotionalExpression[] = []
    
    // 关键词匹配
    const keywords = {
      '谢谢': { type: 'emoji', content: '🙏', intensity: 70, context: 'gratitude' },
      '开心': { type: 'emoji', content: '😊', intensity: 70, context: 'joy' },
      '难过': { type: 'emoji', content: '😢', intensity: 60, context: 'sadness' },
      '生气': { type: 'emoji', content: '😤', intensity: 70, context: 'anger' },
      '惊讶': { type: 'emoji', content: '😮', intensity: 60, context: 'surprise' },
      '爱': { type: 'emoji', content: '💕', intensity: 80, context: 'love' },
      '祈祷': { type: 'emoji', content: '🙏', intensity: 80, context: 'prayer' },
      '平静': { type: 'emoji', content: '☮️', intensity: 60, context: 'peace' }
    }
    
    Object.entries(keywords).forEach(([keyword, expr]) => {
      if (message.includes(keyword)) {
        expressions.push(expr as EmotionalExpression)
      }
    })
    
    return expressions
  }
}

// 多模态交互引擎主类
export class MultimodalEngine {
  private voiceManager: VoiceManager
  private imageAnalyzer: ImageAnalyzer
  private gestureManager: GestureManager
  private emotionalExpressionManager: EmotionalExpressionManager
  private isInitialized = false
  
  constructor() {
    this.voiceManager = new VoiceManager()
    this.imageAnalyzer = new ImageAnalyzer()
    this.gestureManager = new GestureManager()
    this.emotionalExpressionManager = new EmotionalExpressionManager()
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      // 检查各种功能的支持情况
      const capabilities = {
        voice: this.voiceManager.isSupported(),
        gesture: this.gestureManager.isSupported(),
        camera: 'mediaDevices' in navigator
      }
      
      console.log('多模态交互引擎初始化完成', capabilities)
      this.isInitialized = true
    } catch (error) {
      console.error('多模态交互引擎初始化失败:', error)
      throw error
    }
  }
  
  // 语音功能
  async speakMessage(message: string, deityId?: string): Promise<void> {
    return this.voiceManager.speak(message, deityId)
  }
  
  async startVoiceInput(): Promise<string> {
    return this.voiceManager.startListening()
  }
  
  stopVoiceInput(): void {
    this.voiceManager.stopListening()
  }
  
  stopSpeaking(): void {
    this.voiceManager.stopSpeaking()
  }
  
  // 图像分析功能
  async analyzeUploadedImage(file: File): Promise<ImageAnalysis> {
    return this.imageAnalyzer.analyzeImage(file)
  }
  
  // 手势识别功能
  async enableGestureRecognition(): Promise<void> {
    return this.gestureManager.startGestureTracking()
  }
  
  disableGestureRecognition(): void {
    this.gestureManager.stopGestureTracking()
  }
  
  onGesture(gesture: string, callback: (gesture: string) => void): void {
    this.gestureManager.onGesture(gesture, callback)
  }
  
  // 情感表达功能
  suggestEmotionalExpressions(
    message: string, 
    emotion: string, 
    intensity: number = 50
  ): EmotionalExpression[] {
    return this.emotionalExpressionManager.suggestExpressions(message, emotion, intensity)
  }
  
  selectExpression(emotion: string, intensity: number = 50): EmotionalExpression | null {
    return this.emotionalExpressionManager.selectExpression(emotion, intensity)
  }
  
  // 配置管理
  updateVoiceConfig(config: Partial<VoiceConfig>): void {
    this.voiceManager.updateConfig(config)
  }
  
  updateGestureConfig(config: Partial<GestureConfig>): void {
    this.gestureManager.updateConfig(config)
  }
  
  // 功能支持检查
  getCapabilities() {
    return {
      voiceSupported: this.voiceManager.isSupported(),
      gestureSupported: this.gestureManager.isSupported(),
      cameraSupported: 'mediaDevices' in navigator,
      voiceConfig: this.voiceManager.getConfig(),
      gestureConfig: this.gestureManager.getConfig(),
      availableVoices: this.voiceManager.getAvailableVoices(),
      availableEmotions: this.emotionalExpressionManager.getAvailableEmotions()
    }
  }
  
  // 智能交互建议
  generateInteractionSuggestions(context: {
    currentEmotion: string
    messageType: string
    userPreferences: any
  }): {
    voice: boolean
    gestures: string[]
    expressions: EmotionalExpression[]
    imageUpload: boolean
  } {
    const suggestions = {
      voice: false,
      gestures: [] as string[],
      expressions: [] as EmotionalExpression[],
      imageUpload: false
    }
    
    // 基于情感状态的建议
    if (context.currentEmotion === 'sadness') {
      suggestions.voice = true // 建议使用语音，更有温度
      suggestions.gestures.push('pray', 'heart')
      suggestions.expressions.push(
        ...this.emotionalExpressionManager.suggestExpressions('', 'sadness', 70)
      )
    } else if (context.currentEmotion === 'joy') {
      suggestions.gestures.push('thumbsUp', 'wave')
      suggestions.expressions.push(
        ...this.emotionalExpressionManager.suggestExpressions('', 'joy', 80)
      )
    }
    
    // 基于消息类型的建议
    if (context.messageType === 'question') {
      suggestions.imageUpload = true // 可能需要展示相关图片
    } else if (context.messageType === 'sharing') {
      suggestions.voice = true // 分享内容建议语音
      suggestions.imageUpload = true // 可能想分享图片
    }
    
    return suggestions
  }
}

// 导出单例实例
export const multimodalEngine = new MultimodalEngine()

// 导出类型
export type { 
  VoiceConfig, 
  VoiceMessage, 
  ImageAnalysis, 
  GestureConfig, 
  EmotionalExpression 
}