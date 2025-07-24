import React, { useState, useEffect } from 'react'
import type { AppPage } from '../types'
import { CommunityService } from '../services/communityService'
import type { 
  CommunityUser, 
  CommunityPost, 
  CommunityCircle, 
  CommunityFeed,
  BlessingExchange,
  WisdomShare,
  MeditationSession,
  CommunityCategory 
} from '../types/community'

interface CommunityPageProps {
  onNavigate: (page: AppPage) => void
}

type CommunityTabType = 'feed' | 'circles' | 'blessings' | 'wisdom' | 'meditations'

const CommunityPage: React.FC<CommunityPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<CommunityTabType>('feed')
  const [currentUser, setCurrentUser] = useState<CommunityUser | null>(null)
  const [feed, setFeed] = useState<CommunityFeed>({ posts: [], hasMore: false, totalCount: 0 })
  const [circles, setCircles] = useState<CommunityCircle[]>([])
  const [blessings, setBlessings] = useState<BlessingExchange[]>([])
  const [wisdom, setWisdom] = useState<WisdomShare[]>([])
  const [meditations, setMeditations] = useState<MeditationSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | undefined>()
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    initializeCommunity()
  }, [])

  const initializeCommunity = async () => {
    try {
      setIsLoading(true)
      
      // 初始化用户
      const user = CommunityService.initializeCurrentUser()
      setCurrentUser(user)
      
      // 加载数据
      await loadCommunityData()
    } catch (error) {
      console.error('初始化社区失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCommunityData = async () => {
    const feedData = CommunityService.getCommunityFeed(1, 20, selectedCategory)
    const circlesData = CommunityService.getCommunityCircles()
    const blessingsData = CommunityService.getBlessingExchanges()
    const wisdomData = CommunityService.getWisdomShares()
    const meditationsData = CommunityService.getMeditationSessions()

    setFeed(feedData)
    setCircles(circlesData)
    setBlessings(blessingsData)
    setWisdom(wisdomData)
    setMeditations(meditationsData)
  }

  const handleLikePost = (postId: string) => {
    const success = CommunityService.likePost(postId)
    if (success) {
      setFeed(prev => ({
        ...prev,
        posts: prev.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
            }
          }
          return post
        })
      }))
    }
  }

  const handleJoinCircle = (circleId: string) => {
    const success = CommunityService.joinCircle(circleId)
    if (success) {
      setCircles(prev => prev.map(circle => {
        if (circle.id === circleId) {
          return {
            ...circle,
            isJoined: true,
            memberCount: circle.memberCount + 1
          }
        }
        return circle
      }))
    }
  }

  const handleJoinMeditation = (sessionId: string) => {
    const success = CommunityService.joinMeditationSession(sessionId)
    if (success) {
      setMeditations(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            isJoined: true,
            currentParticipants: [...session.currentParticipants, currentUser?.id || '']
          }
        }
        return session
      }))
    }
  }

  const handleCreatePost = (content: string, type: CommunityPost['type'], category: CommunityCategory) => {
    try {
      const newPost = CommunityService.createPost({
        type,
        content,
        category,
        tags: [],
        visibility: 'public'
      })
      
      setFeed(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts],
        totalCount: prev.totalCount + 1
      }))
      
      setShowCreatePost(false)
    } catch (error) {
      console.error('发布动态失败:', error)
    }
  }

  const renderFeed = () => {
    return (
      <div className="community-feed space-y-4">
        {/* 发布动态按钮 */}
        <div className="create-post-section">
          <button 
            className="create-post-btn"
            onClick={() => setShowCreatePost(true)}
          >
            <span className="create-icon">✨</span>
            <span>分享修行感悟...</span>
          </button>
        </div>

        {/* 分类过滤 */}
        <div className="category-filters">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(undefined)}
            >
              全部
            </button>
            {[
              { key: 'meditation', label: '🧘 禅修', value: 'meditation' as CommunityCategory },
              { key: 'wisdom', label: '📿 智慧', value: 'wisdom' as CommunityCategory },
              { key: 'blessing_circle', label: '🙏 祝福', value: 'blessing_circle' as CommunityCategory },
              { key: 'questions', label: '❓ 求助', value: 'questions' as CommunityCategory }
            ].map(category => (
              <button
                key={category.key}
                className={`filter-tab ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 动态列表 */}
        <div className="posts-list">
          {feed.posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="author-info">
                  <span className="author-avatar">{post.author.avatar}</span>
                  <div className="author-details">
                    <span className="author-name">{post.author.displayName}</span>
                    {post.author.title && (
                      <span className="author-title">{post.author.title}</span>
                    )}
                    <span className="post-time">{post.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="post-category">
                  <span className="category-badge">
                    {post.category === 'meditation' ? '🧘 禅修' :
                     post.category === 'wisdom' ? '📿 智慧' :
                     post.category === 'blessing_circle' ? '🙏 祝福' :
                     post.category === 'questions' ? '❓ 求助' :
                     post.category === 'daily_practice' ? '📅 日常' : '💭 分享'}
                  </span>
                </div>
              </div>
              
              {post.title && (
                <h3 className="post-title">{post.title}</h3>
              )}
              
              <div className="post-content">
                <p>{post.content}</p>
              </div>
              
              {post.mood && (
                <div className="post-mood">
                  <span className="mood-indicator">
                    {post.mood === 'peaceful' ? '😌 平静' :
                     post.mood === 'grateful' ? '🙏 感恩' :
                     post.mood === 'joyful' ? '😊 喜悦' :
                     post.mood === 'contemplative' ? '🤔 深思' :
                     post.mood === 'blessed' ? '✨ 蒙福' : '😕 困惑'}
                  </span>
                </div>
              )}
              
              {post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="post-actions">
                <button 
                  className={`action-btn ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLikePost(post.id)}
                >
                  <span className="action-icon">{post.isLiked ? '❤️' : '🤍'}</span>
                  <span className="action-count">{post.likeCount}</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">💭</span>
                  <span className="action-count">{post.commentCount}</span>
                </button>
                {post.type === 'blessing' && post.blessingCount && (
                  <button className="action-btn blessing">
                    <span className="action-icon">🙏</span>
                    <span className="action-count">{post.blessingCount}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderCircles = () => {
    return (
      <div className="community-circles space-y-4">
        <div className="section-header">
          <h3 className="section-title">🔮 修行圈子</h3>
          <p className="section-desc">加入志同道合的修行社群</p>
        </div>
        
        <div className="circles-grid">
          {circles.map(circle => (
            <div key={circle.id} className="circle-card">
              <div className="circle-header">
                <div className="circle-avatar">{circle.avatar}</div>
                <div className="circle-info">
                  <h4 className="circle-name">{circle.name}</h4>
                  <p className="circle-desc">{circle.description}</p>
                </div>
              </div>
              
              <div className="circle-stats">
                <div className="stat-item">
                  <span className="stat-icon">👥</span>
                  <span className="stat-text">{circle.memberCount}人</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📝</span>
                  <span className="stat-text">{circle.postCount}帖</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⚡</span>
                  <span className="stat-text">
                    {circle.activityLevel === 'very_high' ? '非常活跃' :
                     circle.activityLevel === 'high' ? '很活跃' :
                     circle.activityLevel === 'medium' ? '较活跃' : '一般'}
                  </span>
                </div>
              </div>
              
              <div className="circle-tags">
                {circle.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              
              <div className="circle-action">
                {circle.isJoined ? (
                  <button className="btn-joined">已加入 ✓</button>
                ) : (
                  <button 
                    className="btn-join"
                    onClick={() => handleJoinCircle(circle.id)}
                  >
                    加入圈子
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderBlessings = () => {
    return (
      <div className="community-blessings space-y-4">
        <div className="section-header">
          <h3 className="section-title">🙏 祝福交换</h3>
          <p className="section-desc">传递善意，收获慈悲</p>
        </div>
        
        <div className="blessing-exchange-section">
          <button className="send-blessing-btn">
            <span className="blessing-icon">✨</span>
            <span>发送祝福</span>
          </button>
        </div>
        
        <div className="blessings-list">
          {blessings.map(blessing => (
            <div key={blessing.id} className="blessing-card">
              <div className="blessing-header">
                <span className="blessing-type">
                  {blessing.type === 'daily' ? '日常祝福' :
                   blessing.type === 'support' ? '支持祝福' :
                   blessing.type === 'gratitude' ? '感恩祝福' : '特殊祝福'}
                </span>
                <span className="blessing-time">
                  {blessing.createdAt.toLocaleDateString()}
                </span>
              </div>
              
              <div className="blessing-content">
                <p>{blessing.message}</p>
              </div>
              
              <div className="blessing-deities">
                {blessing.deityBlessings.map(deity => (
                  <span key={deity} className="deity-blessing">
                    {deity}
                  </span>
                ))}
              </div>
              
              <div className="blessing-actions">
                {!blessing.reciprocated && (
                  <button className="reciprocate-btn">
                    回赠祝福 🙏
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderWisdom = () => {
    return (
      <div className="community-wisdom space-y-4">
        <div className="section-header">
          <h3 className="section-title">💎 智慧分享</h3>
          <p className="section-desc">经典智慧，共同学习</p>
        </div>
        
        <div className="wisdom-list">
          {wisdom.map(item => (
            <div key={item.id} className="wisdom-card">
              <div className="wisdom-header">
                <h4 className="wisdom-title">{item.title}</h4>
                <span className="wisdom-category">
                  {item.category === 'buddhist' ? '佛学' :
                   item.category === 'taoist' ? '道学' :
                   item.category === 'confucian' ? '儒学' : '民俗'}
                </span>
              </div>
              
              <div className="wisdom-content">
                <blockquote className="wisdom-quote">
                  {item.content}
                </blockquote>
                
                {item.source && (
                  <cite className="wisdom-source">—— {item.source}</cite>
                )}
                
                {item.translation && (
                  <div className="wisdom-translation">
                    <strong>白话:</strong> {item.translation}
                  </div>
                )}
                
                {item.commentary && (
                  <div className="wisdom-commentary">
                    <strong>感悟:</strong> {item.commentary}
                  </div>
                )}
              </div>
              
              <div className="wisdom-tags">
                {item.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              
              <div className="wisdom-stats">
                <span className="stat">👍 {item.likeCount}</span>
                <span className="stat">💾 {item.saveCount}</span>
                <span className="stat">📤 {item.shareCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderMeditations = () => {
    return (
      <div className="community-meditations space-y-4">
        <div className="section-header">
          <h3 className="section-title">🧘‍♂️ 共修冥想</h3>
          <p className="section-desc">一起禅修，共同精进</p>
        </div>
        
        <div className="meditations-list">
          {meditations.map(session => (
            <div key={session.id} className="meditation-card">
              <div className="meditation-header">
                <div className="host-info">
                  <span className="host-avatar">{session.host.avatar}</span>
                  <div className="host-details">
                    <span className="host-name">{session.host.displayName}</span>
                    {session.host.title && (
                      <span className="host-title">{session.host.title}</span>
                    )}
                  </div>
                </div>
                <div className="session-type">
                  {session.type === 'guided' ? '引导冥想' :
                   session.type === 'silent' ? '静默冥想' :
                   session.type === 'group_chanting' ? '集体诵经' : '行走冥想'}
                </div>
              </div>
              
              <div className="meditation-content">
                <h4 className="session-title">{session.title}</h4>
                <p className="session-desc">{session.description}</p>
                
                <div className="session-details">
                  <div className="detail-item">
                    <span className="detail-icon">⏱️</span>
                    <span>{session.duration}分钟</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🕐</span>
                    <span>{session.scheduledAt.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👥</span>
                    <span>{session.currentParticipants.length}/{session.maxParticipants}人</span>
                  </div>
                </div>
                
                {session.technique && (
                  <div className="session-technique">
                    <strong>方法:</strong> {session.technique}
                  </div>
                )}
              </div>
              
              <div className="meditation-action">
                {session.isJoined ? (
                  <button className="btn-joined">已报名 ✓</button>
                ) : (
                  <button 
                    className="btn-join"
                    onClick={() => handleJoinMeditation(session.id)}
                    disabled={session.currentParticipants.length >= session.maxParticipants}
                  >
                    {session.currentParticipants.length >= session.maxParticipants ? '人数已满' : '报名参加'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="community-loading-container">
        <div className="loading-spinner">
          <div className="spinner-icon">🌸</div>
          <p>正在加载神仙圈子...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="community-page-container">
      {/* 页面头部 */}
      <div className="community-header">
        <div className="header-content">
          <button 
            onClick={() => onNavigate('home')}
            className="back-button"
          >
            <span className="back-icon">←</span>
          </button>
          <div className="header-title">
            <h1 className="page-title">👥 神仙圈子</h1>
            <p className="page-subtitle">善友同修，道在人间</p>
          </div>
          {currentUser && (
            <div className="user-info">
              <span className="user-avatar">{currentUser.avatar}</span>
              <span className="user-level">Lv.{currentUser.level}</span>
            </div>
          )}
        </div>
      </div>

      {/* 标签导航 */}
      <div className="community-tabs">
        <div className="tabs-container">
          {[
            { id: 'feed', label: '动态', icon: '📱' },
            { id: 'circles', label: '圈子', icon: '🔮' },
            { id: 'blessings', label: '祝福', icon: '🙏' },
            { id: 'wisdom', label: '智慧', icon: '💎' },
            { id: 'meditations', label: '共修', icon: '🧘‍♂️' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as CommunityTabType)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="community-content">
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'circles' && renderCircles()}
        {activeTab === 'blessings' && renderBlessings()}
        {activeTab === 'wisdom' && renderWisdom()}
        {activeTab === 'meditations' && renderMeditations()}
      </div>

      {/* 创建帖子模态框 */}
      {showCreatePost && (
        <div className="create-post-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>分享修行感悟</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreatePost(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <textarea 
                placeholder="分享你的修行心得，或向大家提出问题..."
                className="post-textarea"
                rows={6}
              />
              <div className="post-options">
                <select className="post-type-select">
                  <option value="sharing">🌸 修行分享</option>
                  <option value="question">❓ 求助提问</option>
                  <option value="wisdom">💎 智慧感悟</option>
                  <option value="blessing">🙏 祈福祝愿</option>
                  <option value="gratitude">🌟 感恩分享</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowCreatePost(false)}>取消</button>
              <button className="btn-publish">发布</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityPage 