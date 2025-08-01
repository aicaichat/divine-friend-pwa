// 应用页面类型
export type AppPage = 'home' | 'today' | 'today-fortune' | 'chat' | 'free-chat' | 'deepseek-demo' | 'bracelet' | 'growth' | 'community' | 'settings' | 'settings-optimized' | 'settings-enhanced' | 'test' | 'bazi-demo' | 'dayun-demo' | 'daily-fortune-demo' | 'guiren'

// 导出社区相关类型
export * from './community'

// 用户信息类型
export interface UserProfile {
  id: string
  name: string
  daysSinceStart: number
  userLevel: 'beginner' | 'growing' | 'master'
  braceletConnected: boolean
  blessingEnergy: number
}

// 运势数据类型
export interface FortuneData {
  verse: string
  elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  advice: {
    bestTime: string
    luckyDirection: string
    luckyColor: string
    recommendation: string
  }
}

// 每日任务类型
export interface TaskItem {
  id: string
  icon: string
  title: string
  description: string
  completed: boolean
  reward: number
  completedAt?: string
}

// 祝福信息类型
export interface BlessingItem {
  id: string
  userName: string
  avatar: string
  content: string
  timestamp: string
  likes: number
}

// 神仙朋友对话类型
export interface ChatMessage {
  id: string
  type: 'user' | 'deity'
  content: string
  timestamp: string
  mood?: string
  avatar?: string
}

// 对话模式类型
export interface ConversationMode {
  name: string
  style: string
  examples: string[]
}

// 手串信息类型
export interface BraceletInfo {
  id: string
  name: string
  material: string
  temple: string
  master: string
  blessedDate: string
  energy: number
  protection: number
  connection: number
  wearingDays: number
  wearingHours: number
  chargeCount: number
}

// 成长数据类型
export interface GrowthStats {
  companionDays: number
  guidanceReceived: number
  conversations: number
  adoptionRate: number
}

// 社区数据类型
export interface CommunityStats {
  totalMembers: number
  activeToday: number
  mutualHelps: number
  totalEnergy: number
}

export interface VerificationResult {
  isValid: boolean;
  message: string;
  braceletInfo?: BraceletInfo;
}

export interface BlessingInfo {
  id: string;
  braceletId: string;
  blessing: string;
  timestamp: Date;
  monk?: string;
  temple?: string;
  date?: Date;
}

export interface NFCData {
  id: string;
  type: string;
  data: any;
}

export interface Sutra {
  id: string;
  title: string;
  author: string;
  description: string;
  audioUrl: string;
  textUrl: string;
  duration: number;
  category: 'buddhist' | 'taoist' | 'confucian';
}
