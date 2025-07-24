import React, { useState } from 'react'
import { EnhancedBaziService } from '../services/enhancedBaziService'
import type { UserBirthInfo, BaziAnalysis, DeityRecommendation } from '../types/bazi'
import ProfessionalBaziDisplay from '../components/ProfessionalBaziDisplay'
import DayunDisplay from '../components/DayunDisplay'

const BaziDemoPage: React.FC = () => {
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
  const [isCalculating, setIsCalculating] = useState(false)
  const [apiStatus, setApiStatus] = useState<boolean>(false)

  // 检查API状态
  React.useEffect(() => {
    const checkAPI = async () => {
      console.log('检查API状态...')
      const status = await EnhancedBaziService.checkAPIStatus()
      console.log('API状态结果:', status)
      setApiStatus(status)
    }
    checkAPI()
  }, [])

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

    console.log('开始计算八字...')
    console.log('出生信息:', birthInfo)
    setIsCalculating(true)
    
    try {
      console.log('调用EnhancedBaziService.calculateBaziWithAPI...')
      const result = await EnhancedBaziService.calculateBaziWithAPI(birthInfo)
      console.log('八字计算结果:', result)
      
      if (result.success && result.data) {
        console.log('转换API响应...')
        const analysis = transformApiResponse(result.data)
        setBaziAnalysis(analysis)
        
        console.log('匹配神仙...')
        const deityResult = await EnhancedBaziService.matchDeitiesWithAPI(analysis)
        if (deityResult.success && deityResult.data) {
          setDeityRecommendation(deityResult.data)
        }
        
        alert('✅ 八字计算成功！')
      } else {
        console.error('计算失败:', result.error)
        alert('❌ 计算失败: ' + (result.error || '未知错误'))
      }
      
    } catch (error) {
      console.error('计算八字失败:', error)
      alert('❌ 计算失败: ' + (error as Error).message)
    } finally {
      setIsCalculating(false)
    }
  }

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

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f4e8',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#d4af37',
          marginBottom: '30px',
          fontFamily: 'Ma Shan Zheng, serif'
        }}>
          🧮 八字计算演示
        </h1>

        {/* API状态 */}
        <div style={{ 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: apiStatus ? '#d4edda' : '#f8d7da',
          borderRadius: '5px',
          border: `1px solid ${apiStatus ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <strong>API状态:</strong> {apiStatus ? '✅ 连接正常' : '❌ 连接失败'}
        </div>

        {/* 输入表单 */}
        <div style={{ marginBottom: '30px' }}>
          <h3>📝 输入出生信息</h3>
          <div style={{ display: 'grid', gap: '15px', maxWidth: '600px' }}>
            <div>
              <label>姓名:</label>
              <input
                type="text"
                value={birthInfo.name}
                onChange={(e) => handleBirthInfoChange('name', e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="请输入姓名"
              />
            </div>

            <div>
              <label>性别:</label>
              <div style={{ marginTop: '5px' }}>
                <label style={{ marginRight: '15px' }}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={birthInfo.gender === 'male'}
                    onChange={(e) => handleBirthInfoChange('gender', e.target.value)}
                  />
                  男
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={birthInfo.gender === 'female'}
                    onChange={(e) => handleBirthInfoChange('gender', e.target.value)}
                  />
                  女
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label>年:</label>
                <select
                  value={birthInfo.birthYear}
                  onChange={(e) => handleBirthInfoChange('birthYear', parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  {Array.from({ length: 80 }, (_, i) => {
                    const year = new Date().getFullYear() - i
                    return <option key={year} value={year}>{year}年</option>
                  })}
                </select>
              </div>
              <div>
                <label>月:</label>
                <select
                  value={birthInfo.birthMonth}
                  onChange={(e) => handleBirthInfoChange('birthMonth', parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}月</option>
                  ))}
                </select>
              </div>
              <div>
                <label>日:</label>
                <select
                  value={birthInfo.birthDay}
                  onChange={(e) => handleBirthInfoChange('birthDay', parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}日</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>时:</label>
                <select
                  value={birthInfo.birthHour}
                  onChange={(e) => handleBirthInfoChange('birthHour', parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}时</option>
                  ))}
                </select>
              </div>
              <div>
                <label>分:</label>
                <select
                  value={birthInfo.birthMinute}
                  onChange={(e) => handleBirthInfoChange('birthMinute', parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, '0')}分</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ 
                color: apiStatus ? '#28a745' : '#dc3545',
                fontWeight: 'bold'
              }}>
                {apiStatus ? '✅ 后端服务正常' : '❌ 后端服务不可用'}
              </span>
            </div>
            
            <button
              onClick={calculateBazi}
              disabled={isCalculating || !apiStatus}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: isCalculating || !apiStatus ? '#ccc' : '#d4af37',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isCalculating || !apiStatus ? 'not-allowed' : 'pointer'
              }}
            >
              {isCalculating ? '计算中...' : '计算八字'}
            </button>
          </div>
        </div>

        {/* 八字结果 */}
        {baziAnalysis && (
          <div style={{ marginTop: '30px' }}>
            <ProfessionalBaziDisplay baziAnalysis={baziAnalysis} />
            
            {/* 大运信息 */}
            {baziAnalysis.dayun_info?.dayuns && (
              <div style={{ marginTop: '40px' }}>
                <DayunDisplay dayunData={baziAnalysis.dayun_info.dayuns} />
              </div>
            )}
          </div>
        )}

        {/* 神仙匹配结果 */}
        {deityRecommendation && (
          <div style={{ marginTop: '30px' }}>
            <h3>🙏 神仙匹配结果</h3>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <p><strong>推荐神仙:</strong> {deityRecommendation.primaryMatch?.deity?.name || '未知'}</p>
              <p><strong>匹配度:</strong> {deityRecommendation.primaryMatch?.compatibilityScore || 0}%</p>
              <p><strong>匹配原因:</strong></p>
              <ul>
                {deityRecommendation.primaryMatch?.matchReasons?.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BaziDemoPage 