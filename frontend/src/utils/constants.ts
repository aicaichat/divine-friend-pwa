// 应用常量定义
export const APP_NAME = '交个神仙朋友'
export const APP_VERSION = '1.0.0'

// API 端点
export const API_ENDPOINTS = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.divinefriend.com' 
    : 'http://localhost:3000',
  DEITY_CHAT: '/api/deity/chat',
  FORTUNE_ANALYSIS: '/api/fortune/analysis',
  NFC_VERIFY: '/api/nfc/verify',
  BLESSING_SEND: '/api/blessing/send',
  USER_SETTINGS: '/api/user/settings'
}

// 本地存储键名
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'divine-friend-preferences',
  CHAT_HISTORY: 'divine-friend-chat-history',
  FORTUNE_DATA: 'divine-friend-fortune-data',
  BLESSING_HISTORY: 'divine-friend-blessing-history',
  NFC_SCAN_HISTORY: 'divine-friend-nfc-history'
}

// 神仙类型
export const DEITY_TYPES = {
  GUANYIN: 'guanyin',
  WENSHU: 'wenshu',
  DIZANG: 'dizang',
  MILETO: 'mileto',
  LAOZI: 'laozi'
} as const

// 五行元素
export const WUXING_ELEMENTS = {
  WOOD: 'wood',
  FIRE: 'fire',
  EARTH: 'earth',
  METAL: 'metal',
  WATER: 'water'
} as const

// 页面路由
export const ROUTES = {
  HOME: '/',
  DEITY_FRIEND: '/deity-friend',
  FORTUNE_ANALYSIS: '/fortune-analysis',
  NFC_BRACELET: '/nfc-bracelet',
  SUTRA_READING: '/sutra-reading',
  DIVINATION: '/divination',
  BLESSING_CENTER: '/blessing-center',
  SETTINGS: '/settings'
} as const

// 主题色彩
export const THEME_COLORS = {
  GOLD: '#C9A961',
  WOOD: '#7BA05B',
  WATER: '#5B9BD5',
  FIRE: '#E07B39',
  EARTH: '#8B7355'
} as const

// 动画持续时间
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800
} as const 