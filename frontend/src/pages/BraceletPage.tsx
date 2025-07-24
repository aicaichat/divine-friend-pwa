import React, { useState, useEffect } from 'react'
import type { AppPage } from '../types'
import { useBracelet } from '../hooks/useBracelet'
import { MeritService } from '../services/braceletAPI'
import { NFCService, QRCodeService, BraceletVerificationService } from '../services/nfcService'
import { EnergyManager, ConsecrationManager, EnergyAnalyzer } from '../services/energyManager'

interface BraceletPageProps {
  onNavigate: (page: AppPage) => void
}

const BraceletPage: React.FC<BraceletPageProps> = ({ onNavigate }) => {
  const [braceletIdInput, setBraceletIdInput] = useState('')
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [sutraPlaying, setSutraPlaying] = useState(false)
  const [showSutraText, setShowSutraText] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'nfc' | 'qr'>('manual')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showEnergyDetails, setShowEnergyDetails] = useState(false)
  
  const {
    braceletInfo,
    status,
    meritRecord,
    loading,
    error,
    verifyBracelet,
    addMerit,
    refreshStatus,
    clearError
  } = useBracelet()

  // 心经文本
  const sutraText = `
    观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。
    舍利子，色不异空，空不异色；色即是空，空即是色；受想行识，亦复如是。
    舍利子，是诸法空相，不生不灭，不垢不净，不增不减。
    是故空中无色，无受想行识；无眼耳鼻舌身意，无色声香味触法；
    无眼界，乃至无意识界；无无明，亦无无明尽，乃至无老死，亦无老死尽；
    无苦集灭道，无智亦无得，以无所得故，菩提萨埵，依般若波罗蜜多故，
    心无罣碍，无罣碍故，无有恐怖，远离颠倒梦想，究竟涅槃。
    三世诸佛，依般若波罗蜜多故，得阿耨多罗三藐三菩提。
    故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒，
    能除一切苦，真实不虚。
    故说般若波罗蜜多咒，即说咒曰：揭谛，揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。
  `

  const handleVerifyBracelet = async () => {
    if (verificationMethod === 'manual' && !braceletIdInput.trim()) return
    
    setIsVerifying(true)
    
    try {
      const result = await BraceletVerificationService.performVerification(
        verificationMethod,
        braceletIdInput.trim()
      )
      
      if (result.success && result.braceletId) {
        await verifyBracelet(result.braceletId)
        setShowVerificationModal(false)
        setBraceletIdInput('')
      } else {
        // 显示验证失败信息
        console.error('验证失败:', result.error)
      }
    } catch (error) {
      console.error('验证过程出错:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleNFCVerification = async () => {
    setVerificationMethod('nfc')
    setIsVerifying(true)
    
    try {
      const result = await NFCService.readNFCTag()
      if (result.success && result.braceletId) {
        await verifyBracelet(result.braceletId)
        setShowVerificationModal(false)
      }
    } catch (error) {
      console.error('NFC验证失败:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleQRVerification = async () => {
    setVerificationMethod('qr')
    setIsVerifying(true)
    
    try {
      const result = await QRCodeService.scanQRCode()
      if (result.success && result.braceletId) {
        await verifyBracelet(result.braceletId)
        setShowVerificationModal(false)
      }
    } catch (error) {
      console.error('扫码验证失败:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCompletePractice = () => {
    addMerit(1)
    setSutraPlaying(false)
    
    // 显示完成反馈
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10b981' // green
      case 'disconnected': return '#ef4444' // red
      case 'verifying': return '#f59e0b' // yellow
      case 'error': return '#dc2626' // dark red
      default: return '#6b7280' // gray
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '已连接'
      case 'disconnected': return '未连接'
      case 'verifying': return '验证中'
      case 'error': return '连接错误'
      default: return '未知状态'
    }
  }

  const getMeritLevel = () => {
    if (!meritRecord) return null
    return MeritService.getMeritLevel(meritRecord.count)
  }

  // 如果没有手串信息，显示验证界面
  if (!braceletInfo) {
    return (
      <div className="bracelet-page">
        <div className="bracelet-hero-section">
          <div className="zen-card-main">
            <div className="card-header">
              <div className="bracelet-icon">📿</div>
              <h1 className="page-title">我的法宝手串</h1>
              <p className="page-subtitle">验证您的开光手串，开启修行之路</p>
            </div>

            {error && (
              <div className="error-message">
                <div className="error-content">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                  <button onClick={clearError} className="error-close">✕</button>
                </div>
              </div>
            )}

            <div className="verification-section">
              <div className="input-group">
                <label className="input-label">手串编号</label>
                <input
                  type="text"
                  value={braceletIdInput}
                  onChange={(e) => setBraceletIdInput(e.target.value)}
                  placeholder="请输入您的手串编号"
                  className="bracelet-input"
                  disabled={loading}
                />
              </div>

              <button
                className={`verify-button ${loading ? 'loading' : ''}`}
                onClick={handleVerifyBracelet}
                disabled={loading || !braceletIdInput.trim()}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    验证中...
                  </>
                ) : (
                  '验证手串'
                )}
              </button>

              <div className="verification-methods">
                <p className="methods-title">其他验证方式</p>
                <div className="methods-grid">
                  <button 
                    className="method-button" 
                    onClick={handleNFCVerification}
                    disabled={isVerifying}
                  >
                    <span className="method-icon">📱</span>
                    <span>NFC感应</span>
                    <small>{isVerifying && verificationMethod === 'nfc' ? '读取中...' : '快速验证'}</small>
                  </button>
                  <button 
                    className="method-button" 
                    onClick={handleQRVerification}
                    disabled={isVerifying}
                  >
                    <span className="method-icon">📷</span>
                    <span>扫码验证</span>
                    <small>{isVerifying && verificationMethod === 'qr' ? '扫描中...' : '扫码识别'}</small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 已验证手串，显示详情页面
  return (
    <div className="bracelet-page">
      {/* 手串状态卡片 */}
      <div className="bracelet-status-card">
        <div className="status-header">
          <div className="bracelet-image-container">
            {braceletInfo.imageUrl ? (
              <img
                src={braceletInfo.imageUrl}
                alt={`${braceletInfo.owner}的手串`}
                className="bracelet-image"
                loading="lazy"
              />
            ) : (
              <div className="bracelet-placeholder">
                <span className="bracelet-icon-large">📿</span>
              </div>
            )}
            <div 
              className="connection-indicator"
              style={{ backgroundColor: getStatusColor(status) }}
            >
              <span className="connection-pulse"></span>
            </div>
          </div>
          
          <div className="bracelet-info">
            <h2 className="bracelet-owner">{braceletInfo.owner}的法宝</h2>
            <div className="bracelet-details">
              <div className="detail-item">
                <span className="detail-label">芯片编号:</span>
                <span className="detail-value">{braceletInfo.chipId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">材质:</span>
                <span className="detail-value">{braceletInfo.material}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">佛珠:</span>
                <span className="detail-value">{braceletInfo.beadCount}颗</span>
              </div>
            </div>
            
            <div className="status-indicator">
              <span 
                className="status-dot"
                style={{ backgroundColor: getStatusColor(status) }}
              ></span>
              <span className="status-text">{getStatusText(status)}</span>
              <button
                className="refresh-button"
                onClick={refreshStatus}
                title="刷新状态"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 能量状态详情卡片 */}
      <div className="energy-analysis-card">
        <div className="energy-header">
          <h3 className="energy-title">能量状态分析</h3>
          <button
            className="energy-toggle"
            onClick={() => setShowEnergyDetails(!showEnergyDetails)}
          >
            {showEnergyDetails ? '简化' : '详情'}
          </button>
        </div>
        
        <div className="current-energy-display">
          <div className="energy-level-circle">
            <svg width="80" height="80" className="energy-progress-ring">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#ffd700"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${2 * Math.PI * 35 * (1 - (braceletInfo?.energyLevel || 100) / 100)}`}
                transform="rotate(-90 40 40)"
                className="energy-progress-stroke"
              />
            </svg>
            <div className="energy-level-text">
              <div className="energy-percentage">{braceletInfo?.energyLevel || 100}%</div>
              <div className="energy-label">能量</div>
            </div>
          </div>
          
          <div className="energy-status-text">
            <div className="energy-description">
              {(() => {
                const level = braceletInfo?.energyLevel || 100
                if (level >= 90) return '✨ 能量充沛，法力强大'
                if (level >= 70) return '🌟 能量良好，状态稳定'  
                if (level >= 50) return '💫 能量中等，需要补充'
                return '🔋 能量不足，急需充能'
              })()}
            </div>
            
            {showEnergyDetails && (
              <div className="energy-trend">
                {(() => {
                  const analysis = EnergyAnalyzer.analyzeEnergyTrend(braceletInfo?.id || '')
                  return (
                    <div className="trend-info">
                      <div className="trend-indicator">
                        趋势: {analysis.trend === 'increasing' ? '📈 上升' : 
                               analysis.trend === 'decreasing' ? '📉 下降' : '➡️ 稳定'}
                      </div>
                      <div className="trend-average">
                        7日平均: {analysis.averageLevel.toFixed(1)}%
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>

        {showEnergyDetails && (
          <div className="energy-recommendations">
            <h4 className="recommendations-title">个性化建议</h4>
            <div className="recommendations-list">
              {EnergyAnalyzer.generatePersonalizedAdvice(braceletInfo?.id || '').map((advice, index) => (
                <div key={index} className="recommendation-item">
                  {advice}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 功德显示卡片 */}
      {meritRecord && (
        <div className="merit-card">
          <div className="merit-header">
            <h3 className="merit-title">修行功德</h3>
            <div className="merit-level">
              {(() => {
                const level = getMeritLevel()
                return level ? (
                  <div 
                    className="level-badge"
                    style={{ backgroundColor: level.color }}
                  >
                    {level.level}
                  </div>
                ) : null
              })()}
            </div>
          </div>
          
          <div className="merit-stats">
            <div className="stat-item primary">
              <div className="stat-number">{meritRecord.count}</div>
              <div className="stat-label">总功德</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{meritRecord.dailyCount}</div>
              <div className="stat-label">今日修持</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{meritRecord.totalDays}</div>
              <div className="stat-label">修行天数</div>
            </div>
          </div>

          {(() => {
            const level = getMeritLevel()
            return level && level.progress < 100 ? (
              <div className="merit-progress">
                <div className="progress-label">
                  距离下一级还需 {level.nextLevelAt - meritRecord.count} 功德
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${level.progress}%` }}
                  ></div>
                </div>
              </div>
            ) : null
          })()}
        </div>
      )}

      {/* 修持心经区域 */}
      <div className="sutra-practice-card">
        <div className="practice-header">
          <h3 className="practice-title">修持心经</h3>
          <p className="practice-subtitle">诵读心经，增长智慧，积累功德</p>
        </div>

        {showSutraText && (
          <div className="sutra-text-container">
            <div className="sutra-text">
              {sutraText.trim()}
            </div>
          </div>
        )}

        <div className="practice-controls">
          <button
            className="practice-button secondary"
            onClick={() => setShowSutraText(!showSutraText)}
          >
            {showSutraText ? '收起经文' : '显示经文'}
          </button>
          
          <button
            className={`practice-button primary ${sutraPlaying ? 'playing' : ''}`}
            onClick={() => setSutraPlaying(!sutraPlaying)}
          >
            {sutraPlaying ? '⏸️ 暂停修持' : '▶️ 开始修持'}
          </button>
          
          <button
            className="practice-button success"
            onClick={handleCompletePractice}
            disabled={!sutraPlaying}
          >
            ✅ 完成修持 +1
          </button>
        </div>
      </div>

      {/* 开光信息卡片 */}
      {braceletInfo.consecrationDate && (
        <div className="consecration-card">
          <div className="consecration-header">
            <h3 className="consecration-title">开光信息</h3>
          </div>
          
          <div className="consecration-details">
            <div className="consecration-item">
              <span className="consecration-icon">📅</span>
              <div>
                <div className="consecration-label">开光时间</div>
                <div className="consecration-value">{braceletInfo.consecrationDate}</div>
              </div>
            </div>
            
            {braceletInfo.consecrationTemple && (
              <div className="consecration-item">
                <span className="consecration-icon">🏛️</span>
                <div>
                  <div className="consecration-label">开光寺院</div>
                  <div className="consecration-value">{braceletInfo.consecrationTemple}</div>
                </div>
              </div>
            )}
            
            {braceletInfo.consecrationMaster && (
              <div className="consecration-item">
                <span className="consecration-icon">👨‍🦲</span>
                <div>
                  <div className="consecration-label">主持法师</div>
                  <div className="consecration-value">{braceletInfo.consecrationMaster}</div>
                </div>
              </div>
            )}
          </div>

          {braceletInfo.consecrationVideo && (
            <div className="video-section">
              <h4 className="video-title">开光仪式视频</h4>
              <video
                controls
                className="consecration-video"
                poster={braceletInfo.imageUrl}
              >
                <source src={braceletInfo.consecrationVideo} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
            </div>
          )}
        </div>
      )}

      {/* 底部操作区域 */}
      <div className="bracelet-actions">
        <button
          className="action-button secondary"
          onClick={() => {
            setBraceletIdInput('')
            setShowVerificationModal(true)
          }}
        >
          更换手串
        </button>
        
        <button
          className="action-button primary"
          onClick={() => onNavigate('chat')}
        >
          与神仙对话
        </button>
      </div>

      {/* 验证模态框 */}
      {showVerificationModal && (
        <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>更换手串</h3>
              <button 
                className="modal-close"
                onClick={() => setShowVerificationModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">新的手串编号</label>
                <input
                  type="text"
                  value={braceletIdInput}
                  onChange={(e) => setBraceletIdInput(e.target.value)}
                  placeholder="请输入手串编号"
                  className="bracelet-input"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="modal-button secondary"
                onClick={() => setShowVerificationModal(false)}
              >
                取消
              </button>
              <button
                className="modal-button primary"
                onClick={handleVerifyBracelet}
                disabled={loading || !braceletIdInput.trim()}
              >
                {loading ? '验证中...' : '验证'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BraceletPage 