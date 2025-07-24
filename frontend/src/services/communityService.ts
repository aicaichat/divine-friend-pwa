// 神仙圈子社区服务层

import {
  CommunityUser,
  CommunityPost,
  CommunityComment,
  CommunityCircle,
  CommunityEvent,
  DirectMessage,
  BlessingExchange,
  WisdomShare,
  MeditationSession,
  CommunityNotification,
  CommunityStats,
  CommunityActivity,
  CommunityFeed,
  UserInteraction,
  CommunitySearchResult,
  CommunityPreferences,
  CommunityCategory
} from '../types/community'

export class CommunityService {
  private static STORAGE_PREFIX = 'divine-community'
  
  /**
   * 获取当前用户信息
   */
  static getCurrentUser(): CommunityUser | null {
    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}-current-user`)
    if (!stored) return null
    
    try {
      const user = JSON.parse(stored)
      return {
        ...user,
        joinDate: new Date(user.joinDate),
        lastActive: new Date(user.lastActive)
      }
    } catch (error) {
      console.error('解析用户信息失败:', error)
      return null
    }
  }

  /**
   * 初始化或更新当前用户
   */
  static initializeCurrentUser(userData?: Partial<CommunityUser>): CommunityUser {
    let user = this.getCurrentUser()
    
    if (!user) {
      // 创建新用户
      user = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        username: `修行者${Math.floor(Math.random() * 9999)}`,
        displayName: '新修行者',
        avatar: '🌸', // 默认头像
        level: 1,
        joinDate: new Date(),
        lastActive: new Date(),
        companionDeity: 'guanyin',
        growthAreas: ['spiritual', 'mindfulness'],
        achievementBadges: [],
        karmaPoints: 100,
        contributionScore: 0,
        followersCount: 0,
        followingCount: 0,
        isVerified: false,
        privacySettings: {
          profileVisibility: 'public',
          allowDirectMessage: true,
          showGrowthProgress: true,
          showLocation: false
        },
        ...userData
      }
      
      this.saveCurrentUser(user)
    } else {
      // 更新现有用户
      user = { ...user, ...userData, lastActive: new Date() }
      this.saveCurrentUser(user)
    }
    
    return user
  }

  /**
   * 保存当前用户信息
   */
  static saveCurrentUser(user: CommunityUser): void {
    localStorage.setItem(`${this.STORAGE_PREFIX}-current-user`, JSON.stringify(user))
  }

  /**
   * 获取社区动态
   */
  static getCommunityFeed(page = 1, limit = 10, category?: CommunityCategory): CommunityFeed {
    const key = `${this.STORAGE_PREFIX}-feed`
    let posts: CommunityPost[] = []
    
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const rawPosts = JSON.parse(stored)
        posts = rawPosts.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined
        }))
      } else {
        posts = this.generateSamplePosts()
        localStorage.setItem(key, JSON.stringify(posts))
      }
    } catch (error) {
      console.error('获取社区动态失败:', error)
      posts = this.generateSamplePosts()
    }

    // 按类别过滤
    if (category) {
      posts = posts.filter(post => post.category === category)
    }

    // 按时间排序
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // 分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPosts = posts.slice(startIndex, endIndex)

    return {
      posts: paginatedPosts,
      hasMore: endIndex < posts.length,
      nextCursor: endIndex < posts.length ? endIndex.toString() : undefined,
      totalCount: posts.length
    }
  }

  /**
   * 创建新帖子
   */
  static createPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'author' | 'likeCount' | 'commentCount' | 'shareCount' | 'isLiked' | 'isBookmarked'>): CommunityPost {
    const currentUser = this.getCurrentUser()
    if (!currentUser) throw new Error('用户未登录')

    const newPost: CommunityPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      authorId: currentUser.id,
      author: currentUser,
      createdAt: new Date(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isLiked: false,
      isBookmarked: false,
      ...postData
    }

    // 保存到存储
    const key = `${this.STORAGE_PREFIX}-feed`
    const stored = localStorage.getItem(key)
    let posts: CommunityPost[] = []
    
    if (stored) {
      try {
        posts = JSON.parse(stored)
      } catch (error) {
        console.error('解析帖子数据失败:', error)
      }
    }

    posts.unshift(newPost)
    localStorage.setItem(key, JSON.stringify(posts))

    return newPost
  }

  /**
   * 点赞帖子
   */
  static likePost(postId: string): boolean {
    const key = `${this.STORAGE_PREFIX}-feed`
    const stored = localStorage.getItem(key)
    if (!stored) return false

    try {
      const posts: CommunityPost[] = JSON.parse(stored)
      const postIndex = posts.findIndex(p => p.id === postId)
      
      if (postIndex !== -1) {
        const post = posts[postIndex]
        if (post.isLiked) {
          post.likeCount -= 1
          post.isLiked = false
        } else {
          post.likeCount += 1
          post.isLiked = true
        }
        
        localStorage.setItem(key, JSON.stringify(posts))
        return true
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
    }

    return false
  }

  /**
   * 获取圈子列表
   */
  static getCommunityCircles(): CommunityCircle[] {
    const key = `${this.STORAGE_PREFIX}-circles`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const circles = JSON.parse(stored)
        return circles.map((circle: any) => ({
          ...circle,
          createdAt: new Date(circle.createdAt)
        }))
      } catch (error) {
        console.error('解析圈子数据失败:', error)
      }
    }

    // 生成示例圈子数据
    const sampleCircles = this.generateSampleCircles()
    localStorage.setItem(key, JSON.stringify(sampleCircles))
    return sampleCircles
  }

  /**
   * 加入圈子
   */
  static joinCircle(circleId: string): boolean {
    const key = `${this.STORAGE_PREFIX}-circles`
    const stored = localStorage.getItem(key)
    if (!stored) return false

    try {
      const circles: CommunityCircle[] = JSON.parse(stored)
      const circleIndex = circles.findIndex(c => c.id === circleId)
      
      if (circleIndex !== -1) {
        const circle = circles[circleIndex]
        if (!circle.isJoined) {
          circle.isJoined = true
          circle.memberCount += 1
          localStorage.setItem(key, JSON.stringify(circles))
          return true
        }
      }
    } catch (error) {
      console.error('加入圈子失败:', error)
    }

    return false
  }

  /**
   * 获取祝福交换记录
   */
  static getBlessingExchanges(): BlessingExchange[] {
    const key = `${this.STORAGE_PREFIX}-blessings`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const blessings = JSON.parse(stored)
        return blessings.map((blessing: any) => ({
          ...blessing,
          createdAt: new Date(blessing.createdAt)
        }))
      } catch (error) {
        console.error('解析祝福数据失败:', error)
      }
    }

    return this.generateSampleBlessings()
  }

  /**
   * 发送祝福
   */
  static sendBlessing(blessingData: Omit<BlessingExchange, 'id' | 'createdAt' | 'isReceived' | 'reciprocated'>): BlessingExchange {
    const newBlessing: BlessingExchange = {
      id: `blessing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      isReceived: false,
      reciprocated: false,
      ...blessingData
    }

    const key = `${this.STORAGE_PREFIX}-blessings`
    const stored = localStorage.getItem(key)
    let blessings: BlessingExchange[] = []
    
    if (stored) {
      try {
        blessings = JSON.parse(stored)
      } catch (error) {
        console.error('解析祝福数据失败:', error)
      }
    }

    blessings.unshift(newBlessing)
    localStorage.setItem(key, JSON.stringify(blessings))

    return newBlessing
  }

  /**
   * 获取智慧分享
   */
  static getWisdomShares(): WisdomShare[] {
    const key = `${this.STORAGE_PREFIX}-wisdom`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const wisdom = JSON.parse(stored)
        return wisdom.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }))
      } catch (error) {
        console.error('解析智慧分享数据失败:', error)
      }
    }

    return this.generateSampleWisdom()
  }

  /**
   * 获取冥想活动
   */
  static getMeditationSessions(): MeditationSession[] {
    const key = `${this.STORAGE_PREFIX}-meditations`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      try {
        const sessions = JSON.parse(stored)
        return sessions.map((session: any) => ({
          ...session,
          scheduledAt: new Date(session.scheduledAt),
          host: {
            ...session.host,
            joinDate: new Date(session.host.joinDate),
            lastActive: new Date(session.host.lastActive)
          }
        }))
      } catch (error) {
        console.error('解析冥想活动数据失败:', error)
      }
    }

    return this.generateSampleMeditations()
  }

  /**
   * 参加冥想活动
   */
  static joinMeditationSession(sessionId: string): boolean {
    const key = `${this.STORAGE_PREFIX}-meditations`
    const stored = localStorage.getItem(key)
    if (!stored) return false

    const currentUser = this.getCurrentUser()
    if (!currentUser) return false

    try {
      const sessions: MeditationSession[] = JSON.parse(stored)
      const sessionIndex = sessions.findIndex(s => s.id === sessionId)
      
      if (sessionIndex !== -1) {
        const session = sessions[sessionIndex]
        if (!session.isJoined && session.currentParticipants.length < session.maxParticipants) {
          session.isJoined = true
          session.currentParticipants.push(currentUser.id)
          localStorage.setItem(key, JSON.stringify(sessions))
          return true
        }
      }
    } catch (error) {
      console.error('参加冥想活动失败:', error)
    }

    return false
  }

  /**
   * 搜索社区内容
   */
  static searchCommunity(query: string): CommunitySearchResult {
    const posts = this.getCommunityFeed(1, 50).posts.filter(post => 
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.title?.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    const circles = this.getCommunityCircles().filter(circle =>
      circle.name.toLowerCase().includes(query.toLowerCase()) ||
      circle.description.toLowerCase().includes(query.toLowerCase()) ||
      circle.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    const wisdom = this.getWisdomShares().filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    return {
      users: [], // 简化实现，暂不搜索用户
      posts: posts.slice(0, 10),
      circles: circles.slice(0, 5),
      events: [], // 简化实现，暂不搜索事件
      wisdomShares: wisdom.slice(0, 10)
    }
  }

  /**
   * 生成示例帖子数据
   */
  private static generateSamplePosts(): CommunityPost[] {
    const sampleUsers = this.generateSampleUsers()
    const posts: CommunityPost[] = []

    const sampleContents = [
      {
        type: 'sharing' as const,
        category: 'meditation' as const,
        title: '今日禅修心得',
        content: '今晨在山中禅修，听鸟语闻花香，内心格外宁静。与大自然融为一体的感觉真是美妙，仿佛能感受到宇宙的韵律。🌸',
        tags: ['禅修', '自然', '宁静'],
        mood: 'peaceful' as const
      },
      {
        type: 'wisdom' as const,
        category: 'wisdom' as const,
        title: '分享《心经》感悟',
        content: '"色不异空，空不异色"，这句话今天突然有了新的理解。世间万物看似实有，实则如梦幻泡影。修行就是要看透这份虚幻，回归本心。',
        tags: ['心经', '佛法', '感悟'],
        mood: 'contemplative' as const
      },
      {
        type: 'question' as const,
        category: 'questions' as const,
        title: '关于打坐时的杂念',
        content: '请教各位师兄师姐，打坐时总是有很多杂念涌现，应该如何对治？有时越想压制杂念，杂念反而越多。求指导！',
        tags: ['打坐', '杂念', '求助'],
        mood: 'confused' as const
      },
      {
        type: 'blessing' as const,
        category: 'blessing_circle' as const,
        title: '为生病的朋友祈福',
        content: '我的好友生病了，希望大家一起为她祈福。愿观音菩萨保佑她早日康复，身体健康！🙏',
        tags: ['祈福', '健康', '观音菩萨'],
        mood: 'blessed' as const,
        blessingCount: 23
      },
      {
        type: 'gratitude' as const,
        category: 'daily_practice' as const,
        title: '感恩今日的小确幸',
        content: '今天遇到了很多温暖的小事：公车司机等我上车，陌生人的微笑，还有家里的花开了。感恩这些美好的瞬间！✨',
        tags: ['感恩', '日常', '美好'],
        mood: 'joyful' as const
      }
    ]

    sampleContents.forEach((content, index) => {
      const author = sampleUsers[index % sampleUsers.length]
      const hoursAgo = Math.floor(Math.random() * 24)
      
      posts.push({
        id: `post-${Date.now()}-${index}`,
        authorId: author.id,
        author,
        type: content.type,
        title: content.title,
        content: content.content,
        tags: content.tags,
        category: content.category,
        createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
        likeCount: Math.floor(Math.random() * 50),
        commentCount: Math.floor(Math.random() * 20),
        shareCount: Math.floor(Math.random() * 10),
        isLiked: Math.random() > 0.7,
        isBookmarked: Math.random() > 0.8,
        visibility: 'public',
        mood: content.mood,
        blessingCount: content.type === 'blessing' ? (content as any).blessingCount : undefined
      })
    })

    return posts
  }

  /**
   * 生成示例用户数据
   */
  private static generateSampleUsers(): CommunityUser[] {
    const avatars = ['🌸', '🍃', '⛩️', '🕯️', '🌙', '☯️', '🎋', '🪷']
    const deities = ['guanyin', 'wenshu', 'puxian', 'dizang', 'amitabha']
    const titles = ['初心修行者', '静心禅师', '慈悲行者', '智慧学者', '正念导师']
    const names = ['莲心', '静观', '慧明', '觉悟', '慈航', '普贤', '文殊', '观自在']

    return names.map((name, index) => ({
      id: `user-${index + 1}`,
      username: `${name}${index + 1}`,
      displayName: name,
      avatar: avatars[index % avatars.length],
      level: Math.floor(Math.random() * 10) + 1,
      title: titles[index % titles.length],
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      companionDeity: deities[index % deities.length],
      growthAreas: ['spiritual', 'wisdom', 'mindfulness'].slice(0, Math.floor(Math.random() * 3) + 1),
      achievementBadges: ['first_week', 'meditation_master'].slice(0, Math.floor(Math.random() * 2) + 1),
      karmaPoints: Math.floor(Math.random() * 1000) + 100,
      contributionScore: Math.floor(Math.random() * 500),
      followersCount: Math.floor(Math.random() * 100),
      followingCount: Math.floor(Math.random() * 50),
      isVerified: Math.random() > 0.7,
      privacySettings: {
        profileVisibility: 'public',
        allowDirectMessage: true,
        showGrowthProgress: true,
        showLocation: false
      }
    }))
  }

  /**
   * 生成示例圈子数据
   */
  private static generateSampleCircles(): CommunityCircle[] {
    const circles = [
      {
        id: 'circle-meditation',
        name: '禅修共修社',
        description: '每日共修打坐，分享禅修心得，共同精进修行',
        avatar: '🧘‍♂️',
        category: 'meditation' as CommunityCategory,
        memberCount: 156,
        postCount: 234,
        createdAt: new Date('2024-01-15'),
        creatorId: 'user-1',
        moderators: ['user-1', 'user-2'],
        isJoined: true,
        isPrivate: false,
        tags: ['禅修', '打坐', '共修', '正念'],
        rules: ['保持正念觉知', '尊重他人修行', '分享真实体验', '互帮互助'],
        focusAreas: ['mindfulness', 'spiritual'],
        activityLevel: 'high' as const
      },
      {
        id: 'circle-wisdom',
        name: '经典智慧研读会',
        description: '一起研读佛经、道德经等经典，探讨其中的人生智慧',
        avatar: '📿',
        category: 'book_study' as CommunityCategory,
        memberCount: 89,
        postCount: 167,
        createdAt: new Date('2024-02-01'),
        creatorId: 'user-3',
        moderators: ['user-3'],
        isJoined: false,
        isPrivate: false,
        tags: ['经典', '智慧', '研读', '讨论'],
        rules: ['理性讨论', '引经据典', '保持开放心态', '避免争执'],
        focusAreas: ['wisdom', 'spiritual'],
        activityLevel: 'medium' as const
      },
      {
        id: 'circle-blessing',
        name: '祈福互助圈',
        description: '为彼此祈福，互相支持，传递正能量和爱心',
        avatar: '🙏',
        category: 'blessing_circle' as CommunityCategory,
        memberCount: 203,
        postCount: 445,
        createdAt: new Date('2024-01-20'),
        creatorId: 'user-2',
        moderators: ['user-2', 'user-4'],
        isJoined: true,
        isPrivate: false,
        tags: ['祈福', '互助', '正能量', '慈悲'],
        rules: ['传递正能量', '真心祈福', '互相关爱', '感恩回馈'],
        focusAreas: ['compassion', 'relationships'],
        activityLevel: 'very_high' as const
      },
      {
        id: 'circle-beginner',
        name: '修行新人指导站',
        description: '为初入修行的朋友提供指导和帮助，解答修行疑问',
        avatar: '🌱',
        category: 'newcomer' as CommunityCategory,
        memberCount: 78,
        postCount: 123,
        createdAt: new Date('2024-03-01'),
        creatorId: 'user-5',
        moderators: ['user-5'],
        isJoined: false,
        isPrivate: false,
        tags: ['新人', '指导', '基础', '入门'],
        rules: ['耐心指导', '友善回答', '分享经验', '鼓励新人'],
        focusAreas: ['spiritual', 'wisdom'],
        activityLevel: 'medium' as const
      }
    ]

    return circles
  }

  /**
   * 生成示例祝福数据
   */
  private static generateSampleBlessings(): BlessingExchange[] {
    const blessings = [
      {
        id: 'blessing-1',
        senderId: 'user-1',
        receiverId: 'current-user',
        type: 'daily' as const,
        category: 'peace' as const,
        message: '愿你内心平静如水，智慧如莲花般绽放！🌸',
        deityBlessings: ['观音菩萨慈悲护佑'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isReceived: true,
        reciprocated: false
      },
      {
        id: 'blessing-2',
        senderId: 'user-3',
        receiverId: 'current-user',
        type: 'support' as const,
        category: 'wisdom' as const,
        message: '在迷茫时，愿智慧明灯为你指引前路！✨',
        deityBlessings: ['文殊菩萨智慧加持'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        isReceived: true,
        reciprocated: true
      }
    ]

    return blessings
  }

  /**
   * 生成示例智慧分享数据
   */
  private static generateSampleWisdom(): WisdomShare[] {
    return [
      {
        id: 'wisdom-1',
        authorId: 'user-4',
        title: '心经精句分享',
        content: '色不异空，空不异色，色即是空，空即是色。',
        source: '《般若波罗蜜多心经》',
        translation: '一切物质现象与空性本质是一致的，现象就是空性，空性就是现象。',
        commentary: '这句话教导我们要透过现象看本质，不要被表面的事物所迷惑。在日常生活中，当我们遇到困难时，要记住这些都是无常的，都会过去。',
        tags: ['心经', '空性', '般若智慧'],
        difficulty: 'intermediate',
        likeCount: 45,
        saveCount: 23,
        shareCount: 12,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        category: 'buddhist'
      },
      {
        id: 'wisdom-2',
        authorId: 'user-2',
        title: '道德经智慧',
        content: '知人者智，自知者明。',
        source: '《道德经》第三十三章',
        translation: '能够了解别人的人是聪明的，能够了解自己的人是明智的。',
        commentary: '真正的智慧不在于了解外界，而在于了解自己。只有认识自己的内心，才能获得真正的自由和平静。',
        tags: ['道德经', '自知', '智慧'],
        difficulty: 'beginner',
        likeCount: 32,
        saveCount: 18,
        shareCount: 8,
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        category: 'taoist'
      }
    ]
  }

  /**
   * 生成示例冥想活动数据
   */
  private static generateSampleMeditations(): MeditationSession[] {
    const hosts = this.generateSampleUsers()
    
    return [
      {
        id: 'meditation-1',
        hostId: hosts[0].id,
        host: hosts[0],
        title: '晨光静心冥想',
        description: '在清晨的第一缕阳光中，一起进行正念呼吸练习，开启美好的一天',
        type: 'guided',
        technique: '正念呼吸',
        duration: 20,
        maxParticipants: 50,
        currentParticipants: ['user-2', 'user-3'],
        scheduledAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12小时后
        timezone: 'Asia/Shanghai',
        isJoined: false,
        requirements: ['安静的环境', '舒适的坐姿'],
        preparationNotes: '请准备一个舒适的坐垫，穿着宽松的衣服',
        backgroundMusic: '禅修音乐',
        language: 'zh-CN'
      },
      {
        id: 'meditation-2',
        hostId: hosts[1].id,
        host: hosts[1],
        title: '慈悲心冥想共修',
        description: '通过慈悲心冥想，培养对自己和他人的慈悲与爱心',
        type: 'guided',
        technique: '慈悲心观想',
        duration: 30,
        maxParticipants: 30,
        currentParticipants: ['user-1'],
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后
        timezone: 'Asia/Shanghai',
        isJoined: true,
        requirements: ['基础冥想经验'],
        preparationNotes: '建议先学习基础的正念冥想',
        backgroundMusic: '西藏颂钵',
        language: 'zh-CN'
      }
    ]
  }
}