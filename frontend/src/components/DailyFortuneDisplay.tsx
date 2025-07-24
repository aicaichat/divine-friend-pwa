import React from 'react'

interface DailyFortuneData {
  date: string
  overall_score: number
  overall_level: string
  overall_description: string
  career_fortune: {
    score: number
    advice: string[]
    lucky_time: string
    description: string
  }
  wealth_fortune: {
    score: number
    advice: string[]
    lucky_time: string
    description: string
  }
  health_fortune: {
    score: number
    advice: string[]
    lucky_time: string
    description: string
  }
  relationship_fortune: {
    score: number
    advice: string[]
    lucky_time: string
    description: string
  }
  study_fortune: {
    score: number
    advice: string[]
    lucky_time: string
    description: string
  }
  lucky_directions: string[]
  lucky_colors: string[]
  lucky_numbers: number[]
  avoid_directions: string[]
  avoid_colors: string[]
  recommended_activities: string[]
  avoid_activities: string[]
  timing_advice: Record<string, string>
}

interface DailyFortuneDisplayProps {
  fortuneData: DailyFortuneData
}

const DailyFortuneDisplay: React.FC<DailyFortuneDisplayProps> = ({ fortuneData }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50'
    if (score >= 80) return '#8BC34A'
    if (score >= 70) return '#FFC107'
    if (score >= 50) return '#FF9800'
    return '#F44336'
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '极好': return '#4CAF50'
      case '很好': return '#8BC34A'
      case '好': return '#FFC107'
      case '一般': return '#FF9800'
      case '差': return '#F44336'
      default: return '#757575'
    }
  }

  const renderFortuneCard = (title: string, fortune: any, icon: string) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <span style={{ fontSize: '24px', marginRight: '10px' }}>{icon}</span>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {title}
        </h3>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: getScoreColor(fortune.score),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          marginRight: '15px'
        }}>
          {fortune.score}
        </div>
        <div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '5px'
          }}>
            {fortune.description}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#999'
          }}>
            吉利时辰: {fortune.lucky_time}
          </div>
        </div>
      </div>
      
      <div>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '10px'
        }}>
          今日建议:
        </h4>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          {fortune.advice.map((advice: string, index: number) => (
            <li key={index}>{advice}</li>
          ))}
        </ul>
      </div>
    </div>
  )

  const renderLuckyInfo = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      marginBottom: '20px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        🎯 今日吉利信息
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4CAF50',
            marginBottom: '10px'
          }}>
            ✅ 吉利方位
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {fortuneData.lucky_directions.map((direction, index) => (
              <span key={index} style={{
                backgroundColor: '#E8F5E8',
                color: '#4CAF50',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {direction}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#2196F3',
            marginBottom: '10px'
          }}>
            🎨 吉利颜色
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {fortuneData.lucky_colors.map((color, index) => (
              <span key={index} style={{
                backgroundColor: '#E3F2FD',
                color: '#2196F3',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {color}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#FF9800',
            marginBottom: '10px'
          }}>
            🔢 吉利数字
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {fortuneData.lucky_numbers.map((number, index) => (
              <span key={index} style={{
                backgroundColor: '#FFF3E0',
                color: '#FF9800',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {number}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #e0e0e0'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#F44336',
          marginBottom: '10px'
        }}>
          ⚠️ 避免事项
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>避免方位:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {fortuneData.avoid_directions.map((direction, index) => (
                <span key={index} style={{
                  backgroundColor: '#FFEBEE',
                  color: '#F44336',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}>
                  {direction}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>避免颜色:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {fortuneData.avoid_colors.map((color, index) => (
                <span key={index} style={{
                  backgroundColor: '#FFEBEE',
                  color: '#F44336',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}>
                  {color}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderActivityAdvice = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      marginBottom: '20px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        📅 今日活动建议
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4CAF50',
            marginBottom: '10px'
          }}>
            ✅ 推荐活动
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            {fortuneData.recommended_activities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#F44336',
            marginBottom: '10px'
          }}>
            ⚠️ 避免活动
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            {fortuneData.avoid_activities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )

  const renderTimingAdvice = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        ⏰ 时辰建议
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        {Object.entries(fortuneData.timing_advice).map(([time, advice]) => (
          <div key={time} style={{
            backgroundColor: '#F5F5F5',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              {time}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              lineHeight: '1.4'
            }}>
              {advice}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* 综合运势 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '10px'
        }}>
          🌟 {fortuneData.date} 今日运势
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: getScoreColor(fortuneData.overall_score),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            marginRight: '20px'
          }}>
            {fortuneData.overall_score}
          </div>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: getLevelColor(fortuneData.overall_level),
              marginBottom: '5px'
            }}>
              {fortuneData.overall_level}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              综合运势评分
            </div>
          </div>
        </div>
        
        <div style={{
          fontSize: '16px',
          color: '#333',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {fortuneData.overall_description}
        </div>
      </div>

      {/* 吉利信息 */}
      {renderLuckyInfo()}

      {/* 活动建议 */}
      {renderActivityAdvice()}

      {/* 各维度运势 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {renderFortuneCard('💼 事业运势', fortuneData.career_fortune, '💼')}
        {renderFortuneCard('💰 财运', fortuneData.wealth_fortune, '💰')}
        {renderFortuneCard('🏥 健康运势', fortuneData.health_fortune, '🏥')}
        {renderFortuneCard('👥 人际关系', fortuneData.relationship_fortune, '👥')}
        {renderFortuneCard('📚 学习运势', fortuneData.study_fortune, '📚')}
      </div>

      {/* 时辰建议 */}
      {renderTimingAdvice()}
    </div>
  )
}

export default DailyFortuneDisplay 