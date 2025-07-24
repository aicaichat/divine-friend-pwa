// 共同成长数据模型

export interface GrowthProfile {
  userId: string
  startDate: Date
  currentLevel: number
  totalExperience: number
  companionshipDays: number
  lastActiveDate: Date
  preferences: UserPreferences
}

export interface UserPreferences {
  focusAreas: GrowthArea[]
  reminderTime: string
  privacyLevel: 'private' | 'friends' | 'public'
  goalUpdateFrequency: 'daily' | 'weekly' | 'monthly'
}

export type GrowthArea = 
  | 'spiritual'     // 精神修养
  | 'wisdom'        // 智慧提升
  | 'compassion'    // 慈悲心
  | 'mindfulness'   // 正念觉察
  | 'discipline'    // 自律品格
  | 'relationships' // 人际和谐
  | 'health'        // 身心健康
  | 'prosperity'    // 事业财运

export interface GrowthMetric {
  id: string
  area: GrowthArea
  name: string
  description: string
  unit: string
  currentValue: number
  targetValue: number
  historicalData: GrowthDataPoint[]
  trend: 'increasing' | 'stable' | 'decreasing'
  importance: 1 | 2 | 3 | 4 | 5
}

export interface GrowthDataPoint {
  date: Date
  value: number
  context?: string // 背景信息，如"完成了冥想"
  mood?: 1 | 2 | 3 | 4 | 5 // 心情评分
  notes?: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  category: GrowthArea
  requirements: MilestoneRequirement[]
  rewards: MilestoneReward[]
  unlockedAt?: Date
  isCompleted: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master'
  estimatedDays: number
  icon: string
  backgroundStory?: string // 背景故事，增加仪式感
}

export interface MilestoneRequirement {
  type: 'days_active' | 'metric_value' | 'streak' | 'total_sessions' | 'specific_action'
  description: string
  target: number
  current: number
  metricId?: string
}

export interface MilestoneReward {
  type: 'title' | 'badge' | 'unlock_feature' | 'deity_message' | 'special_content'
  name: string
  description: string
  icon?: string
  content?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  earnedAt: Date
  category: GrowthArea
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  shareCount: number
  relatedMilestone?: string
}

export interface GrowthInsight {
  id: string
  type: 'trend' | 'prediction' | 'recommendation' | 'celebration' | 'challenge'
  title: string
  content: string
  supportingData: any
  confidence: number // 0-1, AI 建议的置信度
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
  validUntil: Date
  relatedAreas: GrowthArea[]
}

export interface CompanionState {
  currentDeity: string
  relationshipLevel: number // 0-100, 与神仙朋友的关系深度
  lastInteraction: Date
  personalityTraits: string[] // 基于互动学到的用户特质
  preferredCommunicationStyle: 'encouraging' | 'wise' | 'playful' | 'direct'
  specialMemories: CompanionMemory[]
}

export interface CompanionMemory {
  id: string
  date: Date
  event: string
  significance: 'low' | 'medium' | 'high'
  emotionalContext: string
  learnings: string[]
}

export interface GrowthSession {
  id: string
  startTime: Date
  endTime?: Date
  type: 'meditation' | 'conversation' | 'reflection' | 'learning' | 'practice'
  focusArea: GrowthArea
  quality: 1 | 2 | 3 | 4 | 5 // 会话质量评分
  insights: string[]
  mood: {
    before: 1 | 2 | 3 | 4 | 5
    after: 1 | 2 | 3 | 4 | 5
  }
  keyTopics: string[]
  duration: number // 分钟
  notes?: string
}

export interface GrowthGoal {
  id: string
  title: string
  description: string
  category: GrowthArea
  targetDate: Date
  createdAt: Date
  isActive: boolean
  progress: number // 0-100
  milestones: string[] // milestone IDs
  customMetrics: string[] // custom metric IDs
  motivationLevel: 1 | 2 | 3 | 4 | 5
  reminderSettings: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'custom'
    time?: string
    customDays?: number[]
  }
}

export interface SocialGrowthData {
  friendsCount: number
  sharedAchievements: Achievement[]
  encouragementsGiven: number
  encouragementsReceived: number
  communityRanking?: number
  mentoringRelationships: {
    mentoring: string[] // 指导的用户IDs
    mentored_by: string[] // 被指导的关系
  }
}

// 成长分析结果类型
export interface GrowthAnalysis {
  overallScore: number // 0-100 综合成长分数
  areaScores: Record<GrowthArea, number>
  strengths: GrowthArea[]
  improvementAreas: GrowthArea[]
  insights: GrowthInsight[]
  nextRecommendations: string[]
  companionFeedback: string
  projectedMilestones: {
    milestone: Milestone
    estimatedDate: Date
    confidence: number
  }[]
}

// 时间维度统计
export interface GrowthTimeSeries {
  daily: GrowthDataPoint[]
  weekly: GrowthDataPoint[]
  monthly: GrowthDataPoint[]
  yearly: GrowthDataPoint[]
  peaks: GrowthDataPoint[] // 高峰时刻
  valleys: GrowthDataPoint[] // 低谷时刻
}

// 个性化推荐类型
export interface PersonalizedRecommendation {
  id: string
  type: 'practice' | 'reading' | 'conversation_topic' | 'challenge' | 'reflection'
  title: string
  description: string
  estimatedTime: number // 分钟
  difficulty: 1 | 2 | 3 | 4 | 5
  expectedBenefit: string
  relatedAreas: GrowthArea[]
  personalizedReason: string // 为什么推荐给这个用户
  content?: any // 具体内容，如冥想指导、阅读材料等
}