import React, { useState } from 'react'
import ProfessionalBaziDisplay from '../components/ProfessionalBaziDisplay'
import DayunDisplay from '../components/DayunDisplay'
import type { BaziAnalysis } from '../types/bazi'

const SettingsTestPage: React.FC = () => {
  const [testData, setTestData] = useState<BaziAnalysis>({
    chart: {
      yearPillar: { stem: '己', branch: '巳', element: 'earth' },
      monthPillar: { stem: '丙', branch: '子', element: 'fire' },
      dayPillar: { stem: '丙', branch: '寅', element: 'fire' },
      hourPillar: { stem: '甲', branch: '午', element: 'wood' },
      dayMaster: '丙',
      elements: { wood: 2, fire: 4, earth: 1, metal: 0, water: 1 },
      birthInfo: {
        name: '测试用户',
        birthYear: 1990,
        birthMonth: 1,
        birthDay: 1,
        birthHour: 12,
        birthMinute: 0,
        gender: 'male'
      },
      calculatedAt: new Date()
    },
    personality: {
      strengths: ['坚韧不拔', '热情奔放', '创造力强'],
      weaknesses: ['有时过于冲动', '需要更多耐心'],
      characteristics: ['日主丙火，性格热情', '具有领导才能'],
      suggestions: ['建议多学习，提升自我', '注意情绪管理']
    },
    career: {
      suggestions: ['适合从事与火相关的行业', '具有领导才能'],
      luckyElements: ['fire', 'wood'],
      unluckyElements: ['water']
    },
    health: {
      suggestions: ['注意心脏健康', '定期体检'],
      attentionAreas: ['心血管系统', '消化系统']
    },
    relationship: {
      suggestions: ['缘分自有天定', '保持真诚'],
      timing: ['25-30岁是重要时期']
    },
    wealth: {
      suggestions: ['财运稳健', '量入为出'],
      luckyElements: ['fire', 'earth']
    },
    education: {
      suggestions: ['学习能力强', '适合深造'],
      subjects: ['理工科', '管理类']
    },
    parents: {
      relationship: ['与父母关系和谐'],
      timing: ['早年家庭环境良好']
    },
    children: {
      relationship: ['子女缘分良好'],
      timing: ['30岁后适合生育']
    },
    siblings: {
      relationship: ['手足情深']
    },
    majorEvents: ['人生重要节点需要把握'],
    fortuneTiming: {
      marriage: ['缘分自有天定'],
      children: ['子女缘分良好'],
      health: ['注意保养'],
      wealth: ['财运稳健']
    },
    dayun_info: {
      dayuns: [
        {
          age: 0,
          year: 1990,
          stem: '乙',
          branch: '亥',
          element: 'wood',
          description: '木运当令，生机勃勃，充满活力',
          fortune: '适合创业发展，人际关系广泛',
          start_age: 0,
          end_age: 9,
          gan_element: 'wood',
          zhi_element: 'water'
        },
        {
          age: 10,
          year: 2000,
          stem: '甲',
          branch: '戌',
          element: 'wood',
          description: '木运当令，生机勃勃，充满活力',
          fortune: '适合创业发展，人际关系广泛',
          start_age: 10,
          end_age: 19,
          gan_element: 'wood',
          zhi_element: 'earth'
        },
        {
          age: 20,
          year: 2010,
          stem: '癸',
          branch: '酉',
          element: 'water',
          description: '水运智慧，思维活跃，适应力强',
          fortune: '智慧增长，适合深造学习',
          start_age: 20,
          end_age: 29,
          gan_element: 'water',
          zhi_element: 'metal'
        }
      ],
      current_dayun: {
        age: 0,
        year: 1990,
        stem: '乙',
        branch: '亥',
        element: 'wood',
        description: '木运当令，生机勃勃，充满活力',
        fortune: '适合创业发展，人际关系广泛',
        start_age: 0,
        end_age: 9,
        gan_element: 'wood',
        zhi_element: 'water'
      },
      total_count: 3
    }
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '30px',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
            textAlign: 'center'
          }}>
            🎯 设置页面专业八字展示测试
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            textAlign: 'center',
            margin: '10px 0 0 0'
          }}>
            测试专业八字分析界面和大运信息展示
          </p>
        </div>
        
        <div className="professional-bazi-settings">
          {/* 专业八字展示 */}
          <div className="bazi-section">
            <ProfessionalBaziDisplay baziAnalysis={testData} />
          </div>
          
          {/* 大运信息展示 */}
          <div className="dayun-section">
            <DayunDisplay dayunData={testData.dayun_info?.dayuns || []} />
          </div>
          
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
              color: '#333',
              textAlign: 'center'
            }}>
              八字分析操作
            </h3>
            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                重新计算八字
              </button>
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                查看神仙匹配
              </button>
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                查看运势分析
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsTestPage 