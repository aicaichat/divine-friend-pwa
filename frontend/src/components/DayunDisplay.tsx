import React from 'react'

interface DayunInfo {
  age: number
  year: number
  stem: string
  branch: string
  element: string
  description: string
  fortune: string
}

interface DayunDisplayProps {
  dayunData: DayunInfo[]
  className?: string
}

// 示例大运数据
const sampleDayunData: DayunInfo[] = [
  {
    age: 0,
    year: 1990,
    stem: '乙',
    branch: '亥',
    element: 'wood',
    description: '木运当令，生机勃勃，充满活力',
    fortune: '适合创业发展，人际关系广泛'
  },
  {
    age: 10,
    year: 2000,
    stem: '甲',
    branch: '戌',
    element: 'wood',
    description: '木运当令，生机勃勃，充满活力',
    fortune: '适合创业发展，人际关系广泛'
  },
  {
    age: 20,
    year: 2010,
    stem: '癸',
    branch: '酉',
    element: 'water',
    description: '水运智慧，思维活跃，适应力强',
    fortune: '智慧增长，适合深造学习'
  },
  {
    age: 30,
    year: 2020,
    stem: '壬',
    branch: '申',
    element: 'water',
    description: '水运智慧，思维活跃，适应力强',
    fortune: '智慧增长，适合深造学习'
  },
  {
    age: 40,
    year: 2030,
    stem: '辛',
    branch: '未',
    element: 'metal',
    description: '金运坚毅，意志力强，执行力强',
    fortune: '事业突破，财运稳健'
  }
]

const DayunDisplay: React.FC<DayunDisplayProps> = ({ 
  dayunData = sampleDayunData, 
  className = '' 
}) => {
  // 五行颜色映射
  const elementColors = {
    wood: '#4CAF50',
    fire: '#F44336',
    earth: '#FF9800',
    metal: '#9E9E9E',
    water: '#2196F3'
  }

  const getElementColor = (element: string) => {
    return elementColors[element as keyof typeof elementColors] || '#666'
  }

  const renderDayunCard = (dayun: DayunInfo, index: number) => {
    return (
      <div key={index} style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        marginBottom: '15px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 大运标题 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: getElementColor(dayun.element),
              minWidth: '40px'
            }}>
              {dayun.stem}{dayun.branch}
            </div>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {dayun.age}岁大运
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666'
              }}>
                {dayun.year}年
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#999',
            textTransform: 'uppercase'
          }}>
            {dayun.element}
          </div>
        </div>

        {/* 大运描述 */}
        <div style={{
          marginBottom: '15px'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333'
          }}>
            大运特点
          </h4>
          <p style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#555',
            margin: 0
          }}>
            {dayun.description}
          </p>
        </div>

        {/* 运势预测 */}
        <div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333'
          }}>
            运势预测
          </h4>
          <p style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#555',
            margin: 0
          }}>
            {dayun.fortune}
          </p>
        </div>

        {/* 装饰性边框 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${getElementColor(dayun.element)}, ${getElementColor(dayun.element)}80)`
        }} />
      </div>
    )
  }

  const renderCurrentDayun = () => {
    // 找到当前大运（假设第一个是当前大运）
    const currentDayun = dayunData[0]
    if (!currentDayun) return null

    return (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>🌟</span>
          当前大运
        </h3>
        <div style={{
          padding: '25px',
          backgroundColor: '#fff3cd',
          borderRadius: '12px',
          border: '2px solid #ffc107',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: getElementColor(currentDayun.element)
            }}>
              {currentDayun.stem}{currentDayun.branch}
            </div>
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {currentDayun.age}岁大运
              </div>
              <div style={{
                fontSize: '16px',
                color: '#666'
              }}>
                {currentDayun.year}年 - {currentDayun.year + 10}年
              </div>
            </div>
          </div>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#555',
            margin: 0
          }}>
            {currentDayun.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`dayun-display ${className}`} style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '"Noto Serif SC", serif'
    }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '20px',
        color: '#333',
        textAlign: 'center'
      }}>
        大运信息
      </h2>

      {/* 当前大运 */}
      {renderCurrentDayun()}

      {/* 所有大运 */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          color: '#333'
        }}>
          大运总览
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {dayunData.map((dayun, index) => renderDayunCard(dayun, index))}
        </div>
      </div>

      {/* 大运说明 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginTop: '30px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#333'
        }}>
          大运说明
        </h3>
        <p style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#555',
          margin: 0
        }}>
          大运是八字命理中的重要概念，每十年为一个大运周期。大运干支与命主八字相互作用，
          影响人生各个方面的运势。通过分析大运与命局的关系，可以预测人生不同阶段的吉凶祸福。
        </p>
      </div>
    </div>
  )
}

export default DayunDisplay 