// 八字相关类型定义

export interface UserBirthInfo {
  name: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  birthMinute: number
  gender: 'male' | 'female'
}

export interface BaziPillar {
  stem: string
  branch: string
  element: string
  nayin?: string
}

export interface BaziChart {
  yearPillar: BaziPillar
  monthPillar: BaziPillar
  dayPillar: BaziPillar
  hourPillar: BaziPillar
  dayMaster: string
  elements: ElementBalance
  birthInfo: UserBirthInfo
  calculatedAt: Date
}

export interface ElementBalance {
  wood: number
  fire: number
  earth: number
  metal: number
  water: number
}

export type WuxingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

export interface DayunInfo {
  age: number
  year: number
  stem: string
  branch: string
  element: string
  description: string
  fortune: string
  start_age: number
  end_age: number
  gan_element: string
  zhi_element: string
}

export interface PersonalityTraits {
  strengths: string[]
  weaknesses: string[]
  characteristics: string[]
  suggestions: string[]
}

export interface BaziAnalysis {
  chart: BaziChart
  personality: PersonalityTraits
  career: {
    suggestions: string[]
    luckyElements: WuxingElement[]
    unluckyElements: WuxingElement[]
  }
  health: {
    suggestions: string[]
    attentionAreas: string[]
  }
  relationship: {
    suggestions: string[]
    timing: string[]
  }
  wealth: {
    suggestions: string[]
    luckyElements: WuxingElement[]
  }
  education: {
    suggestions: string[]
    subjects: string[]
  }
  parents: {
    relationship: string[]
    timing: string[]
  }
  children: {
    relationship: string[]
    timing: string[]
  }
  siblings: {
    relationship: string[]
  }
  majorEvents: string[]
  fortuneTiming: {
    marriage: string[]
    children: string[]
    health: string[]
    wealth: string[]
  }
  dayun_info?: {
    dayuns: DayunInfo[]
    current_dayun?: DayunInfo
    total_count: number
  }
}

export interface Deity {
  id: string
  name: string
  title: string
  elements: WuxingElement[]
  personality: string[]
  specialties: string[]
  seasonalAffinity: string[]
  blessingStyle: string
  guidanceStyle: string
  avatarUrl: string
  systemPrompt: string
  compatibilityFactors: Record<string, number>
}

export interface DeityMatch {
  deity: Deity
  compatibilityScore: number
  matchReasons: string[]
  personalizedBlessings: string[]
  guidanceSuggestions: string[]
}

export interface DeityRecommendation {
  primaryMatch: DeityMatch
  secondaryMatches: DeityMatch[]
  seasonalRecommendation?: DeityMatch
  explanation: string
}

// 后端API响应类型
export interface BaziApiResponse {
  success: boolean
  data?: {
    bazi_chart: {
      year_pillar: { stem: string; branch: string }
      month_pillar: { stem: string; branch: string }
      day_pillar: { stem: string; branch: string }
      hour_pillar: { stem: string; branch: string }
      day_master: string
      elements: ElementBalance
    }
    analysis: {
      personality: string[]
      career: string[]
      health: string[]
      relationship: string[]
      wealth: string[]
      education: string[]
      parents: string[]
      children: string[]
      siblings: string[]
      major_events: string[]
      fortune_timing: Record<string, string[]>
    }
    lunar_date: {
      year: number
      month: number
      day: number
    }
  }
  error?: string
}

export interface DeityApiResponse {
  success: boolean
  data?: {
    primary_match: {
      deity: {
        id: string
        name: string
        title: string
        avatar_url: string
        system_prompt: string
      }
      compatibility_score: number
      match_reasons: string[]
      personalized_blessings: string[]
      guidance_suggestions: string[]
    }
    secondary_matches: Array<{
      deity: {
        id: string
        name: string
        title: string
        avatar_url: string
      }
      compatibility_score: number
      match_reasons: string[]
    }>
    explanation: string
  }
  error?: string
}