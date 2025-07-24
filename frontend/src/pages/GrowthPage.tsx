import React, { useState, useEffect } from 'react'
import type { AppPage } from '../types'
import { GrowthTrackingService } from '../services/growthService'
import type { GrowthProfile, GrowthMetric, Milestone, Achievement, GrowthInsight, PersonalizedRecommendation } from '../types/growth'

interface GrowthPageProps {
  onNavigate: (page: AppPage) => void
}

type GrowthTabType = 'overview' | 'metrics' | 'milestones' | 'insights' | 'timeline'

const GrowthPage: React.FC<GrowthPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<GrowthTabType>('overview')
  const [profile, setProfile] = useState<GrowthProfile | null>(null)
  const [metrics, setMetrics] = useState<GrowthMetric[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [insights, setInsights] = useState<GrowthInsight[]>([])
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGrowthData()
  }, [])

  const loadGrowthData = async () => {
    try {
      setIsLoading(true)
      const growthProfile = GrowthTrackingService.getGrowthProfile()
      const growthMetrics = GrowthTrackingService.getGrowthMetrics()
      const growthMilestones = GrowthTrackingService.getMilestones()
      const growthInsights = GrowthTrackingService.generateGrowthInsights()
      const growthRecommendations = GrowthTrackingService.generatePersonalizedRecommendations()

      setProfile(growthProfile)
      setMetrics(growthMetrics)
      setMilestones(growthMilestones)
      setInsights(growthInsights)
      setRecommendations(growthRecommendations)
    } catch (error) {
      console.error('加载成长数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMetricUpdate = (metricId: string, newValue: number) => {
    setMetrics(prev => prev.map(m => 
      m.id === metricId ? { ...m, currentValue: newValue } : m
    ))
  }

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100)
  }

  const getLevelProgress = (): number => {
    if (!profile) return 0
    const currentLevelExp = (profile.currentLevel - 1) * 100
    const nextLevelExp = profile.currentLevel * 100
    const progressInLevel = profile.totalExperience - currentLevelExp
    return (progressInLevel / 100) * 100
  }

  const renderOverview = () => {
    if (!profile) return null

    return (
      <div className="growth-overview space-y-6">
        {/* 成长概况卡片 */}
        <div className="growth-hero-card">
          <div className="growth-level-display">
            <div className="level-badge">
              <span className="level-number">{profile.currentLevel}</span>
              <span className="level-label">修行层次</span>
            </div>
            <div className="level-progress">
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{ width: `${getLevelProgress()}%` }}
                />
              </div>
              <div className="experience-text">
                {profile.totalExperience} / {profile.currentLevel * 100} 经验值
              </div>
            </div>
          </div>
          
          <div className="companionship-stats">
            <div className="stat-item">
              <span className="stat-icon">🌸</span>
              <span className="stat-number">{profile.companionshipDays}</span>
              <span className="stat-label">相伴天数</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-number">{milestones.filter(m => m.isCompleted).length}</span>
              <span className="stat-label">达成里程碑</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💎</span>
              <span className="stat-number">{metrics.reduce((sum, m) => sum + m.currentValue, 0)}</span>
              <span className="stat-label">总成长值</span>
            </div>
          </div>
        </div>

        {/* 核心指标概览 */}
        <div className="metrics-overview">
          <h3 className="section-title">📊 成长维度</h3>
          <div className="metrics-grid">
            {metrics.slice(0, 4).map(metric => (
              <div key={metric.id} className="metric-card">
                <div className="metric-header">
                  <span className="metric-name">{metric.name}</span>
                  <span className="metric-value">{metric.currentValue}/{metric.targetValue}</span>
                </div>
                <div className="metric-progress">
                  <div className="progress-track">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage(metric.currentValue, metric.targetValue)}%` }}
                    />
                  </div>
                </div>
                <div className="metric-trend">
                  <span className={`trend-indicator ${metric.trend}`}>
                    {metric.trend === 'increasing' ? '📈' : metric.trend === 'decreasing' ? '📉' : '➡️'}
                    {metric.trend === 'increasing' ? '上升中' : metric.trend === 'decreasing' ? '需关注' : '稳定'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近成就 */}
        <div className="recent-milestones">
          <h3 className="section-title">🎯 最新里程碑</h3>
          <div className="milestones-preview">
            {milestones.slice(0, 3).map(milestone => (
              <div key={milestone.id} className={`milestone-item ${milestone.isCompleted ? 'completed' : 'in-progress'}`}>
                <div className="milestone-icon">{milestone.icon}</div>
                <div className="milestone-info">
                  <h4 className="milestone-title">{milestone.title}</h4>
                  <p className="milestone-desc">{milestone.description}</p>
                  <div className="milestone-progress">
                    {milestone.requirements.map((req, idx) => (
                      <div key={idx} className="requirement-item">
                        <span className="req-progress">{req.current}/{req.target}</span>
                        <span className="req-desc">{req.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="milestone-status">
                  {milestone.isCompleted ? '✅' : '⏳'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 智慧洞察 */}
        {insights.length > 0 && (
          <div className="growth-insights">
            <h3 className="section-title">💡 成长洞察</h3>
            <div className="insights-list">
              {insights.slice(0, 2).map(insight => (
                <div key={insight.id} className={`insight-card ${insight.priority}`}>
                  <div className="insight-type">
                    {insight.type === 'trend' ? '📈' : 
                     insight.type === 'recommendation' ? '💭' : 
                     insight.type === 'celebration' ? '🎉' : '🔮'}
                  </div>
                  <div className="insight-content">
                    <h4 className="insight-title">{insight.title}</h4>
                    <p className="insight-text">{insight.content}</p>
                  </div>
                  <div className="insight-confidence">
                    <span className="confidence-bar">
                      <span 
                        className="confidence-fill" 
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </span>
                    <span className="confidence-text">{Math.round(insight.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderMetrics = () => {
    return (
      <div className="metrics-detailed space-y-6">
        <h3 className="section-title">📊 详细成长指标</h3>
        <div className="metrics-list">
          {metrics.map(metric => (
            <div key={metric.id} className="detailed-metric-card">
              <div className="metric-header">
                <h4 className="metric-name">{metric.name}</h4>
                <span className="metric-importance">重要度: {'⭐'.repeat(metric.importance)}</span>
              </div>
              <p className="metric-description">{metric.description}</p>
              
              <div className="metric-current-state">
                <div className="value-display">
                  <span className="current-value">{metric.currentValue}</span>
                  <span className="unit">/{metric.targetValue} {metric.unit}</span>
                </div>
                <div className="progress-visualization">
                  <div className="progress-track large">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage(metric.currentValue, metric.targetValue)}%` }}
                    />
                  </div>
                  <span className="progress-percentage">
                    {Math.round(getProgressPercentage(metric.currentValue, metric.targetValue))}%
                  </span>
                </div>
              </div>

              {/* 历史趋势 */}
              {metric.historicalData.length > 0 && (
                <div className="metric-history">
                  <h5>历史趋势</h5>
                  <div className="history-chart">
                    {metric.historicalData.slice(-7).map((point, idx) => (
                      <div key={idx} className="history-point">
                        <div 
                          className="point-bar"
                          style={{ 
                            height: `${(point.value / metric.targetValue) * 100}%`,
                            minHeight: '2px'
                          }}
                        />
                        <span className="point-date">
                          {point.date.getDate()}/{point.date.getMonth() + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderMilestones = () => {
    return (
      <div className="milestones-detailed space-y-6">
        <h3 className="section-title">🎯 修行里程碑</h3>
        <div className="milestones-timeline">
          {milestones.map(milestone => (
            <div key={milestone.id} className={`milestone-timeline-item ${milestone.isCompleted ? 'completed' : 'pending'}`}>
              <div className="timeline-marker">
                <span className="marker-icon">{milestone.icon}</span>
              </div>
              <div className="milestone-content">
                <div className="milestone-header">
                  <h4 className="milestone-title">{milestone.title}</h4>
                  <span className={`difficulty-badge ${milestone.difficulty}`}>
                    {milestone.difficulty === 'beginner' ? '初学' :
                     milestone.difficulty === 'intermediate' ? '进阶' :
                     milestone.difficulty === 'advanced' ? '高级' : '大师'}
                  </span>
                </div>
                <p className="milestone-description">{milestone.description}</p>
                
                {milestone.backgroundStory && (
                  <div className="milestone-story">
                    <span className="story-icon">📜</span>
                    <p className="story-text">{milestone.backgroundStory}</p>
                  </div>
                )}

                <div className="milestone-requirements">
                  <h5>完成条件</h5>
                  {milestone.requirements.map((req, idx) => (
                    <div key={idx} className="requirement-item">
                      <div className="req-progress-bar">
                        <div 
                          className="req-fill"
                          style={{ width: `${(req.current / req.target) * 100}%` }}
                        />
                      </div>
                      <span className="req-text">
                        {req.description}: {req.current}/{req.target}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="milestone-rewards">
                  <h5>解锁奖励</h5>
                  <div className="rewards-list">
                    {milestone.rewards.map((reward, idx) => (
                      <div key={idx} className="reward-item">
                        <span className="reward-icon">🎁</span>
                        <div className="reward-info">
                          <span className="reward-name">{reward.name}</span>
                          <span className="reward-desc">{reward.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {milestone.isCompleted && milestone.unlockedAt && (
                  <div className="completion-info">
                    <span className="completion-icon">🎉</span>
                    <span className="completion-date">
                      已于 {milestone.unlockedAt.toLocaleDateString()} 达成
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderInsights = () => {
    return (
      <div className="insights-detailed space-y-6">
        <h3 className="section-title">💡 智慧洞察</h3>
        <div className="insights-grid">
          {insights.map(insight => (
            <div key={insight.id} className={`detailed-insight-card ${insight.type} ${insight.priority}`}>
              <div className="insight-header">
                <span className="insight-type-icon">
                  {insight.type === 'trend' ? '📈' : 
                   insight.type === 'recommendation' ? '💭' : 
                   insight.type === 'celebration' ? '🎉' : 
                   insight.type === 'prediction' ? '🔮' : '⚡'}
                </span>
                <div className="insight-meta">
                  <h4 className="insight-title">{insight.title}</h4>
                  <div className="insight-tags">
                    <span className={`priority-tag ${insight.priority}`}>{insight.priority}</span>
                    <span className="type-tag">{insight.type}</span>
                  </div>
                </div>
                <div className="insight-confidence-display">
                  <span className="confidence-value">{Math.round(insight.confidence * 100)}%</span>
                  <span className="confidence-label">置信度</span>
                </div>
              </div>
              
              <div className="insight-content">
                <p className="insight-text">{insight.content}</p>
                
                {insight.relatedAreas.length > 0 && (
                  <div className="related-areas">
                    <span className="areas-label">相关领域:</span>
                    <div className="areas-tags">
                      {insight.relatedAreas.map(area => (
                        <span key={area} className="area-tag">
                          {area === 'spiritual' ? '精神修养' :
                           area === 'wisdom' ? '智慧提升' :
                           area === 'compassion' ? '慈悲心' :
                           area === 'mindfulness' ? '正念觉察' : area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {insight.actionable && (
                  <div className="actionable-note">
                    <span className="action-icon">⚡</span>
                    <span className="action-text">可付诸行动的建议</span>
                  </div>
                )}
              </div>
              
              <div className="insight-footer">
                <span className="valid-until">
                  有效期至: {insight.validUntil.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTimeline = () => {
    // 这里可以实现成长时间线功能
    return (
      <div className="timeline-view space-y-6">
        <h3 className="section-title">📅 成长时间线</h3>
        <div className="timeline-placeholder">
          <div className="placeholder-content">
            <span className="placeholder-icon">🚧</span>
            <h4>时间线功能开发中</h4>
            <p>将展示您与神仙朋友的互动历程、成长轨迹和重要时刻</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="growth-loading-container">
        <div className="loading-spinner">
          <div className="spinner-icon">🌸</div>
          <p>正在加载您的成长档案...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="growth-page-container">
      {/* 页面头部 */}
      <div className="growth-header">
        <div className="header-content">
          <button 
            onClick={() => onNavigate('home')}
            className="back-button"
          >
            <span className="back-icon">←</span>
          </button>
          <div className="header-title">
            <h1 className="page-title">🌱 共同成长</h1>
            <p className="page-subtitle">与神仙朋友一起的修行之路</p>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="growth-tabs">
        <div className="tabs-container">
          {[
            { id: 'overview', label: '总览', icon: '🏠' },
            { id: 'metrics', label: '指标', icon: '📊' },
            { id: 'milestones', label: '里程碑', icon: '🎯' },
            { id: 'insights', label: '洞察', icon: '💡' },
            { id: 'timeline', label: '时间线', icon: '📅' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as GrowthTabType)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="growth-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'milestones' && renderMilestones()}
        {activeTab === 'insights' && renderInsights()}
        {activeTab === 'timeline' && renderTimeline()}
      </div>
    </div>
  )
}

export default GrowthPage 