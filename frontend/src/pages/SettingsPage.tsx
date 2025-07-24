import React, { useState, useEffect } from 'react'
import type { AppPage } from '../types'
import { BaziService } from '../services/baziService'
import { FortuneService } from '../services/fortuneService'
import { EnhancedBaziService } from '../services/enhancedBaziService'
import type { UserBirthInfo, BaziAnalysis, DeityRecommendation } from '../types/bazi'
import ProfessionalBaziDisplay from '../components/ProfessionalBaziDisplay'
import DayunDisplay from '../components/DayunDisplay'

interface SettingsPageProps {
  onNavigate: (page: AppPage) => void
}

type SettingsTabType = 'profile' | 'bazi' | 'deity' | 'fortune' | 'preferences'

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('profile')
  const [birthInfo, setBirthInfo] = useState<UserBirthInfo>({
    name: '',
    gender: 'male',
    birthYear: new Date().getFullYear() - 25,
    birthMonth: 1,
    birthDay: 1,
    birthHour: 12,
    birthMinute: 0
  })
  const [baziAnalysis, setBaziAnalysis] = useState<BaziAnalysis | null>(null)
  const [deityRecommendation, setDeityRecommendation] = useState<DeityRecommendation | null>(null)
  const [dailyFortune, setDailyFortune] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [hasExistingData, setHasExistingData] = useState(false)
  const [apiStatus, setApiStatus] = useState<boolean>(false)

  useEffect(() => {
    // 检查API状态
    checkAPIStatus()
    
    // 加载现有数据
    const savedData = EnhancedBaziService.getSavedBaziInfo()
    if (savedData) {
      setBirthInfo(savedData.birthInfo || birthInfo)
      setBaziAnalysis(savedData.baziData?.analysis || null)
      setDeityRecommendation(savedData.baziData?.recommendation || null)
      setHasExistingData(true)
    }
  }, [])

  const checkAPIStatus = async () => {
    const status = await EnhancedBaziService.checkAPIStatus()
    setApiStatus(status)
  }

  const handleBirthInfoChange = (field: keyof UserBirthInfo, value: any) => {
    setBirthInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateBazi = async () => {
    if (!birthInfo.name.trim()) {
      alert('请输入姓名')
      return
    }

    setIsCalculating(true)
    
    try {
      // 使用增强的八字服务计算
      const result = await EnhancedBaziService.calculateBaziWithAPI(birthInfo)
      
      if (result.success && result.data) {
        // 转换API响应为前端格式
        const analysis = transformApiResponse(result.data)
        setBaziAnalysis(analysis)
        
        // 匹配神仙
        const deityResult = await EnhancedBaziService.matchDeitiesWithAPI(analysis)
        if (deityResult.success && deityResult.data) {
          setDeityRecommendation(deityResult.data)
        }
        
        setHasExistingData(true)
        setActiveTab('bazi')
        
        // 显示成功消息
        alert('八字计算成功！请查看八字分析结果。')
      } else {
        alert(result.error || '计算失败，请检查输入信息')
      }
      
    } catch (error) {
      console.error('计算八字失败:', error)
      alert('计算失败，请检查输入信息')
    } finally {
      setIsCalculating(false)
    }
  }

  // 转换API响应为前端格式
  const transformApiResponse = (apiData: any): BaziAnalysis => {
    return {
      chart: {
        yearPillar: {
          stem: apiData.bazi_chart?.year_pillar?.stem || '甲',
          branch: apiData.bazi_chart?.year_pillar?.branch || '子',
          element: 'wood'
        },
        monthPillar: {
          stem: apiData.bazi_chart?.month_pillar?.stem || '乙',
          branch: apiData.bazi_chart?.month_pillar?.branch || '丑',
          element: 'earth'
        },
        dayPillar: {
          stem: apiData.bazi_chart?.day_pillar?.stem || '丙',
          branch: apiData.bazi_chart?.day_pillar?.branch || '寅',
          element: 'fire'
        },
        hourPillar: {
          stem: apiData.bazi_chart?.hour_pillar?.stem || '丁',
          branch: apiData.bazi_chart?.hour_pillar?.branch || '卯',
          element: 'fire'
        },
        dayMaster: apiData.bazi_chart?.day_master || '丙',
        elements: apiData.bazi_chart?.elements || { wood: 1, fire: 2, earth: 1, metal: 0, water: 0 },
        birthInfo: birthInfo,
        calculatedAt: new Date()
      },
      personality: {
        strengths: apiData.analysis?.personality || ['性格温和'],
        weaknesses: [],
        characteristics: [],
        suggestions: []
      },
      career: {
        suggestions: apiData.analysis?.career || ['事业稳定'],
        luckyElements: [],
        unluckyElements: []
      },
      health: {
        suggestions: apiData.analysis?.health || ['注意保养'],
        attentionAreas: []
      },
      relationship: {
        suggestions: apiData.analysis?.relationship || ['感情美满'],
        timing: []
      },
      wealth: {
        suggestions: apiData.analysis?.wealth || ['财运稳健'],
        luckyElements: []
      },
      education: {
        suggestions: apiData.analysis?.education || ['学习能力强'],
        subjects: []
      },
      parents: {
        relationship: apiData.analysis?.parents || ['关系和谐'],
        timing: []
      },
      children: {
        relationship: apiData.analysis?.children || ['缘分良好'],
        timing: []
      },
      siblings: {
        relationship: apiData.analysis?.siblings || ['手足情深']
      },
      majorEvents: apiData.analysis?.major_events || ['把握重要节点'],
      fortuneTiming: {
        marriage: apiData.analysis?.fortune_timing?.marriage || ['缘分自有天定'],
        children: apiData.analysis?.fortune_timing?.children || ['子女缘分良好'],
        health: apiData.analysis?.fortune_timing?.health || ['注意保养'],
        wealth: apiData.analysis?.fortune_timing?.wealth || ['财运稳健']
      }
    }
  }

  const renderProfile = () => {
    return (
      <div className="profile-settings space-y-6">
        <div className="section-header">
          <h3 className="section-title">个人信息</h3>
          <p className="section-desc">输入您的出生信息，计算八字命理</p>
          {!apiStatus && (
            <div className="api-warning">
              ⚠️ 后端服务不可用，将使用本地计算
            </div>
          )}
        </div>

        <div className="birth-info-form">
          <div className="form-group">
            <label className="form-label">姓名</label>
            <input
              type="text"
              className="form-input"
              value={birthInfo.name}
              onChange={(e) => handleBirthInfoChange('name', e.target.value)}
              placeholder="请输入您的姓名"
            />
          </div>

          <div className="form-group">
            <label className="form-label">性别</label>
            <div className="gender-selection">
              <button
                className={`gender-btn ${birthInfo.gender === 'male' ? 'active' : ''}`}
                onClick={() => handleBirthInfoChange('gender', 'male')}
              >
                👨 男
              </button>
              <button
                className={`gender-btn ${birthInfo.gender === 'female' ? 'active' : ''}`}
                onClick={() => handleBirthInfoChange('gender', 'female')}
              >
                👩 女
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">出生日期</label>
            <div className="date-inputs">
              <select
                className="form-select"
                value={birthInfo.birthYear}
                onChange={(e) => handleBirthInfoChange('birthYear', parseInt(e.target.value))}
              >
                {Array.from({ length: 80 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>{year}年</option>
                  )
                })}
              </select>
              <select
                className="form-select"
                value={birthInfo.birthMonth}
                onChange={(e) => handleBirthInfoChange('birthMonth', parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}月</option>
                ))}
              </select>
              <select
                className="form-select"
                value={birthInfo.birthDay}
                onChange={(e) => handleBirthInfoChange('birthDay', parseInt(e.target.value))}
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}日</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">出生时间</label>
            <div className="time-inputs">
              <select
                className="form-select"
                value={birthInfo.birthHour}
                onChange={(e) => handleBirthInfoChange('birthHour', parseInt(e.target.value))}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}时</option>
                ))}
              </select>
              <select
                className="form-select"
                value={birthInfo.birthMinute}
                onChange={(e) => handleBirthInfoChange('birthMinute', parseInt(e.target.value))}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}分</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn-calculate"
              onClick={calculateBazi}
              disabled={isCalculating}
            >
              {isCalculating ? '计算中...' : hasExistingData ? '重新计算八字' : '计算八字命理'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderBazi = () => {
    if (!baziAnalysis) {
      return (
        <div className="no-data">
          <div className="no-data-icon">🤷‍♂️</div>
          <h3>还未计算八字</h3>
          <p>请先在个人信息中输入出生信息</p>
          <button 
            className="btn-primary"
            onClick={() => setActiveTab('profile')}
          >
            去输入信息
          </button>
        </div>
      )
    }

    return (
      <div className="professional-bazi-settings">
        {/* 专业八字展示 */}
        <div className="bazi-section">
          <ProfessionalBaziDisplay baziAnalysis={baziAnalysis} />
        </div>
        
        {/* 大运信息展示 */}
        {baziAnalysis.dayun_info?.dayuns && (
          <div className="dayun-section">
            <DayunDisplay dayunData={baziAnalysis.dayun_info.dayuns} />
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="bazi-actions" style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#333'
          }}>
            八字分析操作
          </h3>
          <div style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <button 
              className="btn-primary"
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              重新计算八字
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setActiveTab('deity')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              查看神仙匹配
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setActiveTab('fortune')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              查看运势分析
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderDeity = () => {
    if (!deityRecommendation) {
      return (
        <div className="no-data">
          <div className="no-data-icon">🙏</div>
          <h3>还未匹配神仙朋友</h3>
          <p>请先计算八字后再查看神仙匹配</p>
          <button 
            className="btn-primary"
            onClick={() => setActiveTab('profile')}
          >
            去计算八字
          </button>
        </div>
      )
    }

    return (
      <div className="deity-recommendation space-y-6">
        <div className="section-header">
          <h3 className="section-title">神仙朋友匹配</h3>
          <p className="section-desc">根据您的八字特征推荐的神仙朋友</p>
        </div>

        {/* 推荐说明 */}
        <div className="recommendation-explanation">
          <p className="explanation-text">{deityRecommendation.explanation}</p>
        </div>

        {/* 主要神仙 */}
        <div className="primary-deity">
          <h4 className="subsection-title">您的主要神仙朋友</h4>
          <div className="deity-card primary">
            <div className="deity-header">
              <div className="deity-avatar">🙏</div>
              <div className="deity-info">
                <h5 className="deity-name">{deityRecommendation.primaryMatch.deity.name}</h5>
                <p className="deity-title">{deityRecommendation.primaryMatch.deity.title}</p>
                <div className="compatibility-score">
                  <span className="score-label">匹配度:</span>
                  <span className="score-value">{deityRecommendation.primaryMatch.compatibilityScore}%</span>
                </div>
              </div>
            </div>
            <div className="match-reasons">
              <h6>匹配原因:</h6>
              <ul className="reasons-list">
                {deityRecommendation.primaryMatch.matchReasons.map((reason, index) => (
                  <li key={index} className="reason-item">{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderFortune = () => {
    if (!dailyFortune) {
      return (
        <div className="no-data">
          <div className="no-data-icon">🔮</div>
          <h3>还未生成运势</h3>
          <p>请先计算八字后再查看运势</p>
          <button 
            className="btn-primary"
            onClick={() => setActiveTab('profile')}
          >
            去计算八字
          </button>
        </div>
      )
    }

    return (
      <div className="fortune-display space-y-6">
        <div className="section-header">
          <h3 className="section-title">今日运势</h3>
          <p className="section-desc">运势分析</p>
        </div>
        <div className="fortune-content">
          <p>运势功能开发中...</p>
        </div>
      </div>
    )
  }

  const renderPreferences = () => {
    return (
      <div className="preferences-settings space-y-6">
        <div className="section-header">
          <h3 className="section-title">偏好设置</h3>
          <p className="section-desc">个性化您的使用体验</p>
        </div>

        <div className="preferences-form">
          <div className="form-section">
            <h4 className="form-section-title">通知设置</h4>
            <div className="form-group">
              <label className="switch-label">
                <input type="checkbox" className="switch-input" defaultChecked />
                <span className="switch-slider"></span>
                每日运势推送
              </label>
            </div>
            <div className="form-group">
              <label className="switch-label">
                <input type="checkbox" className="switch-input" defaultChecked />
                <span className="switch-slider"></span>
                神仙指导提醒
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title">显示设置</h4>
            <div className="form-group">
              <label className="form-label">运势详细度</label>
              <select className="form-select">
                <option value="simple">简单</option>
                <option value="detailed" selected>详细</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page-container">
      {/* 页面头部 */}
      <div className="settings-header">
        <div className="header-content">
          <button 
            onClick={() => onNavigate('home')}
            className="back-button"
          >
            <span className="back-icon">←</span>
          </button>
          <div className="header-title">
            <h1 className="page-title">⚙️ 我的设置</h1>
            <p className="page-subtitle">个性化您的神仙体验</p>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="settings-tabs">
        <div className="tabs-container">
          {[
            { id: 'profile', label: '个人信息', icon: '👤' },
            { id: 'bazi', label: '八字命理', icon: '☯️' },
            { id: 'deity', label: '神仙匹配', icon: '🙏' },
            { id: 'fortune', label: '今日运势', icon: '🔮' },
            { id: 'preferences', label: '偏好设置', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as SettingsTabType)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="settings-content">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'bazi' && renderBazi()}
        {activeTab === 'deity' && renderDeity()}
        {activeTab === 'fortune' && renderFortune()}
        {activeTab === 'preferences' && renderPreferences()}
      </div>
    </div>
  )
}

export default SettingsPage

// 添加专业八字展示的样式
const styles = `
  .professional-bazi-settings {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .bazi-section {
    margin-bottom: 40px;
  }
  
  .dayun-section {
    margin-bottom: 40px;
  }
  
  .bazi-actions {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .bazi-actions h3 {
    color: #333;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .bazi-actions button {
    transition: all 0.3s ease;
    font-weight: 500;
    min-width: 120px;
  }
  
  .bazi-actions button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  }
  
  .btn-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
  }
  
  .btn-secondary:last-child {
    background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  }
  
  @media (max-width: 768px) {
    .professional-bazi-settings {
      padding: 10px;
    }
    
    .bazi-actions {
      padding: 20px;
    }
    
    .bazi-actions button {
      min-width: 100px;
      font-size: 12px;
      padding: 8px 16px;
    }
  }
`

// 注入样式
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
} 