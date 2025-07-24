// 手串相关类型定义

export interface BraceletInfo {
  id: string
  owner: string
  chipId: string
  material: string
  beadCount: number | string
  level: string
  imageUrl: string
  consecrationDate: string
  consecrationTemple: string
  consecrationHall: string
  consecrationMaster: string
  consecrationVideo: string
  lampOfferingVideo: string
  description?: string
  energyLevel?: number
  isActive?: boolean
}

export interface MeritRecord {
  id: string
  braceletId: string
  count: number
  lastUpdated: Date
  dailyCount: number
  totalDays: number
}

export interface BraceletVerification {
  braceletId: string
  isVerified: boolean
  verificationDate: Date
  method: 'nfc' | 'qr' | 'manual'
}

export interface SutraProgress {
  braceletId: string
  currentVerse: number
  completedSessions: number
  totalMerit: number
  streak: number // 连续天数
  lastSessionDate: Date
}

export type BraceletStatus = 'connected' | 'disconnected' | 'verifying' | 'error'

export interface BraceletPageState {
  braceletInfo: BraceletInfo | null
  status: BraceletStatus
  meritRecord: MeritRecord | null
  sutraProgress: SutraProgress | null
  loading: boolean
  error: string | null
}