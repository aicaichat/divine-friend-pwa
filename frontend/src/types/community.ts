// 神仙圈子社区数据模型

export interface CommunityUser {
  id: string
  username: string
  displayName: string
  avatar: string
  level: number
  title?: string // 修行称号，如"初心修行者"、"静心禅师"等
  joinDate: Date
  lastActive: Date
  location?: string
  bio?: string
  companionDeity: string // 主要神仙朋友
  growthAreas: string[] // 关注的成长领域
  achievementBadges: string[] // 成就徽章
  karmaPoints: number // 善业积分
  contributionScore: number // 社区贡献度
  followersCount: number
  followingCount: number
  isVerified: boolean // 是否认证用户
  privacySettings: {
    profileVisibility: 'public' | 'friends' | 'private'
    allowDirectMessage: boolean
    showGrowthProgress: boolean
    showLocation: boolean
  }
}

export interface CommunityPost {
  id: string
  authorId: string
  author: CommunityUser
  type: 'sharing' | 'question' | 'blessing' | 'meditation' | 'wisdom' | 'gratitude'
  title?: string
  content: string
  images?: string[]
  tags: string[]
  category: CommunityCategory
  createdAt: Date
  updatedAt?: Date
  likeCount: number
  commentCount: number
  shareCount: number
  isLiked: boolean
  isBookmarked: boolean
  visibility: 'public' | 'friends' | 'circle'
  targetCircles?: string[] // 如果是circle可见，指定哪些圈子
  mood?: 'peaceful' | 'grateful' | 'confused' | 'joyful' | 'contemplative' | 'blessed'
  location?: {
    name: string
    coordinates?: [number, number] // 经纬度
  }
  relatedPractice?: {
    type: 'meditation' | 'chanting' | 'reading' | 'pilgrimage'
    duration?: number
    method?: string
  }
  blessingCount?: number // 如果是blessing类型，收到的祝福数量
}

export interface CommunityComment {
  id: string
  postId: string
  authorId: string
  author: CommunityUser
  content: string
  createdAt: Date
  updatedAt?: Date
  likeCount: number
  isLiked: boolean
  parentCommentId?: string // 回复评论的ID
  replies?: CommunityComment[]
  mood?: 'supportive' | 'wise' | 'encouraging' | 'questioning'
}

export interface CommunityCircle {
  id: string
  name: string
  description: string
  avatar: string
  category: CommunityCategory
  memberCount: number
  postCount: number
  createdAt: Date
  creatorId: string
  moderators: string[]
  isJoined: boolean
  isPrivate: boolean
  tags: string[]
  rules: string[]
  focusAreas: string[] // 专注的修行领域
  activityLevel: 'low' | 'medium' | 'high' | 'very_high'
  weeklyEvents?: CommunityEvent[]
}

export interface CommunityEvent {
  id: string
  title: string
  description: string
  type: 'meditation' | 'discussion' | 'sharing' | 'ceremony' | 'pilgrimage' | 'study'
  organizer: CommunityUser
  circleId?: string
  startTime: Date
  endTime: Date
  timezone: string
  isOnline: boolean
  location?: {
    name: string
    address?: string
    coordinates?: [number, number]
  }
  maxParticipants?: number
  currentParticipants: number
  participants: string[] // 用户ID列表
  isJoined: boolean
  requirements?: string[]
  materials?: string[]
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: 'zh-CN' | 'en' | 'multi'
}

export interface DirectMessage {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'blessing' | 'wisdom_quote' | 'meditation_invite' | 'image'
  createdAt: Date
  isRead: boolean
  metadata?: {
    blessingType?: string
    quoteSource?: string
    meditationDuration?: number
    imageUrl?: string
  }
}

export interface BlessingExchange {
  id: string
  senderId: string
  receiverId: string
  type: 'daily' | 'special_occasion' | 'support' | 'gratitude' | 'prayer'
  category: 'health' | 'wisdom' | 'peace' | 'prosperity' | 'love' | 'protection'
  message: string
  deityBlessings: string[] // 来自不同神仙的祝福
  createdAt: Date
  isReceived: boolean
  reciprocated?: boolean // 是否已回赠
}

export interface WisdomShare {
  id: string
  authorId: string
  title: string
  content: string
  source?: string // 经典出处
  translation?: string // 白话翻译
  commentary?: string // 个人感悟
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  likeCount: number
  saveCount: number
  shareCount: number
  createdAt: Date
  category: 'buddhist' | 'taoist' | 'confucian' | 'folk' | 'modern'
}

export interface MeditationSession {
  id: string
  hostId: string
  host: CommunityUser
  title: string
  description: string
  type: 'guided' | 'silent' | 'group_chanting' | 'walking' | 'visualization'
  technique: string
  duration: number // 分钟
  maxParticipants: number
  currentParticipants: string[]
  scheduledAt: Date
  timezone: string
  isJoined: boolean
  requirements?: string[]
  preparationNotes?: string
  backgroundMusic?: string
  language: 'zh-CN' | 'en'
}

export interface CommunityNotification {
  id: string
  userId: string
  type: 'like' | 'comment' | 'follow' | 'blessing' | 'event_invite' | 'circle_invite' | 'milestone_reached' | 'daily_reminder'
  title: string
  message: string
  actionUrl?: string
  metadata?: any
  createdAt: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface CommunityStats {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  totalBlessings: number
  totalMeditations: number
  topCircles: CommunityCircle[]
  recentActivities: CommunityActivity[]
}

export interface CommunityActivity {
  id: string
  type: 'post_created' | 'blessing_sent' | 'circle_joined' | 'milestone_achieved' | 'event_attended'
  userId: string
  user: CommunityUser
  description: string
  relatedId?: string // 相关的帖子、圈子等ID
  createdAt: Date
  metadata?: any
}

export type CommunityCategory = 
  | 'meditation'      // 冥想修行
  | 'wisdom'          // 智慧分享
  | 'daily_practice'  // 日常修行
  | 'questions'       // 疑问求助
  | 'celebrations'    // 庆祝分享
  | 'pilgrimage'      // 朝圣游记
  | 'book_study'      // 经典研读
  | 'life_sharing'    // 生活感悟
  | 'blessing_circle' // 祝福圈
  | 'newcomer'        // 新人专区

export interface CommunitySearchResult {
  users: CommunityUser[]
  posts: CommunityPost[]
  circles: CommunityCircle[]
  events: CommunityEvent[]
  wisdomShares: WisdomShare[]
}

export interface CommunityFeed {
  posts: CommunityPost[]
  hasMore: boolean
  nextCursor?: string
  totalCount: number
}

export interface UserInteraction {
  userId: string
  targetId: string
  targetType: 'post' | 'comment' | 'user' | 'circle' | 'event'
  action: 'like' | 'follow' | 'join' | 'bookmark' | 'share' | 'report'
  createdAt: Date
  metadata?: any
}

export interface CommunityModerationReport {
  id: string
  reporterId: string
  targetId: string
  targetType: 'post' | 'comment' | 'user' | 'circle'
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other'
  description: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: Date
  reviewedAt?: Date
  reviewerId?: string
  resolution?: string
}

// 前端状态管理相关类型
export interface CommunityState {
  currentUser: CommunityUser | null
  feed: CommunityFeed
  myCircles: CommunityCircle[]
  notifications: CommunityNotification[]
  unreadCount: number
  onlineUsers: string[]
  isLoading: boolean
  error: string | null
}

export interface CommunityPreferences {
  feedAlgorithm: 'chronological' | 'recommended' | 'following'
  showOnlineStatus: boolean
  autoJoinRecommendedCircles: boolean
  notificationSettings: {
    likes: boolean
    comments: boolean
    follows: boolean
    blessings: boolean
    events: boolean
    dailyReminders: boolean
    weeklyDigest: boolean
  }
  privacySettings: {
    profileSearchable: boolean
    showGrowthStats: boolean
    allowStranger Messages: boolean
  }
  contentPreferences: {
    preferredCategories: CommunityCategory[]
    hideCategories: CommunityCategory[]
    contentLanguage: 'zh-CN' | 'en' | 'both'
  }
}

// API 响应类型
export interface CommunityApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}