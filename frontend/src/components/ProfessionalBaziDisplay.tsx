import React from 'react'
import type { BaziAnalysis } from '../types/bazi'

interface ProfessionalBaziDisplayProps {
  baziAnalysis: BaziAnalysis
  className?: string
}

const ProfessionalBaziDisplay: React.FC<ProfessionalBaziDisplayProps> = ({ 
  baziAnalysis, 
  className = '' 
}) => {
  const { chart } = baziAnalysis

  // 五行颜色映射
  const elementColors = {
    wood: '#4CAF50',
    fire: '#F44336',
    earth: '#FF9800',
    metal: '#9E9E9E',
    water: '#2196F3'
  }

  // 天干地支五行映射
  const stemElements = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  }

  const branchElements = {
    '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
    '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
    '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
  }

  const getElementColor = (element: string) => {
    return elementColors[element as keyof typeof elementColors] || '#666'
  }

  const renderPillar = (pillar: any, title: string) => {
    const stemElement = stemElements[pillar.stem as keyof typeof stemElements] || 'earth'
    const branchElement = branchElements[pillar.branch as keyof typeof branchElements] || 'earth'
    
    return (
      <div className="pillar-container" style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          color: '#333'
        }}>
          {title}
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: '60px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: getElementColor(stemElement),
              marginBottom: '5px'
            }}>
              {pillar.stem}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              textTransform: 'uppercase'
            }}>
              {stemElement}
            </div>
          </div>
          <div style={{ fontSize: '20px', color: '#999' }}>+</div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: '60px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: getElementColor(branchElement),
              marginBottom: '5px'
            }}>
              {pillar.branch}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              textTransform: 'uppercase'
            }}>
              {branchElement}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderElementsAnalysis = () => {
    const elements = chart.elements || {}
    const total = Object.values(elements).reduce((sum: number, count: any) => sum + count, 0)
    
    return (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          color: '#333'
        }}>
          五行分析
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          flexWrap: 'wrap',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          {Object.entries(elements).map(([element, count]) => {
            const percentage = total > 0 ? Math.round((count as number / total) * 100) : 0
            return (
              <div key={element} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '80px'
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: getElementColor(element),
                  marginBottom: '5px'
                }}>
                  {count}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  textTransform: 'capitalize',
                  marginBottom: '5px'
                }}>
                  {element}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#999'
                }}>
                  {percentage}%
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderAnalysisSection = (title: string, items: string[], icon: string) => {
    if (!items || items.length === 0) return null
    
    return (
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          {title}
        </h3>
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          {items.map((item: string, index: number) => (
            <div key={index} style={{
              padding: '8px 0',
              borderBottom: index < items.length - 1 ? '1px solid #e9ecef' : 'none',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#555'
            }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderFortuneTiming = () => {
    if (!baziAnalysis.fortuneTiming) return null
    
    return (
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          color: '#333'
        }}>
          运势时机
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {Object.entries(baziAnalysis.fortuneTiming).map(([timing, items]) => (
            <div key={timing} style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#333'
              }}>
                {timing}
              </h4>
              {items.map((item: string, index: number) => (
                <div key={index} style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#555',
                  marginBottom: '5px'
                }}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`professional-bazi-display ${className}`} style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '"Noto Serif SC", serif'
    }}>
      {/* 八字图表 */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#333',
          textAlign: 'center'
        }}>
          八字命盘
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {renderPillar(chart.yearPillar, '年柱')}
          {renderPillar(chart.monthPillar, '月柱')}
          {renderPillar(chart.dayPillar, '日柱')}
          {renderPillar(chart.hourPillar, '时柱')}
        </div>
      </div>

      {/* 五行分析 */}
      {renderElementsAnalysis()}

      {/* 日主信息 */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          color: '#333'
        }}>
          日主信息
        </h3>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: getElementColor(stemElements[chart.dayPillar.stem as keyof typeof stemElements] || 'earth'),
            marginBottom: '10px'
          }}>
            {chart.dayPillar.stem}
          </div>
          <div style={{
            fontSize: '16px',
            color: '#666'
          }}>
            日主 - {stemElements[chart.dayPillar.stem as keyof typeof stemElements] || 'earth'} 命
          </div>
        </div>
      </div>

      {/* 分析结果 */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#333',
          textAlign: 'center'
        }}>
          命理分析
        </h2>
        
        {renderAnalysisSection('性格分析', baziAnalysis.personality.characteristics, '🧠')}
        {renderAnalysisSection('事业分析', baziAnalysis.career.suggestions, '💼')}
        {renderAnalysisSection('财富分析', baziAnalysis.wealth.suggestions, '💰')}
        {renderAnalysisSection('健康分析', baziAnalysis.health.suggestions, '🏥')}
        {renderAnalysisSection('婚姻分析', baziAnalysis.relationship.suggestions, '💕')}
        {renderAnalysisSection('学业分析', baziAnalysis.education.suggestions, '📚')}
        {renderAnalysisSection('父母分析', baziAnalysis.parents.relationship, '👨‍👩‍👧‍👦')}
        {renderAnalysisSection('子女分析', baziAnalysis.children.relationship, '👶')}
        {renderAnalysisSection('兄弟姐妹', baziAnalysis.siblings.relationship, '👥')}
        {renderAnalysisSection('大事记', baziAnalysis.majorEvents, '📅')}
      </div>

      {/* 运势时机 */}
      {renderFortuneTiming()}
    </div>
  )
}

export default ProfessionalBaziDisplay 