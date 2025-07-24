import React, { useState } from 'react'

const DivinationPage: React.FC = () => {
  const [isShaking, setIsShaking] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleShake = () => {
    setIsShaking(true)
    setResult(null)
    
    // 模拟摇卦动画
    setTimeout(() => {
      setIsShaking(false)
      const results = [
        '乾卦：天行健，君子以自强不息',
        '坤卦：地势坤，君子以厚德载物',
        '震卦：洊雷，君子以恐惧修省',
        '巽卦：随风，君子以申命行事',
        '坎卦：水洊至，习坎，君子以修德',
        '离卦：明两作，离，大人以继明照于四方',
        '艮卦：兼山，艮，君子以思不出其位',
        '兑卦：丽泽，兑，君子以朋友讲习'
      ]
      setResult(results[Math.floor(Math.random() * results.length)])
    }, 3000)
  }

  return (
    <div className="zen-container">
      <div className="zen-card zen-card-jade">
        <h1 className="zen-title">易经占卜</h1>
        <p className="zen-text-poetry">
          "易有太极，是生两仪，两仪生四象，四象生八卦"
        </p>
        
        <div className="zen-card zen-card-silk" style={{ textAlign: 'center', padding: '2rem' }}>
          <div 
            className={`zen-icon ${isShaking ? 'zen-shake' : ''}`}
            style={{ 
              fontSize: '4rem', 
              marginBottom: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={handleShake}
          >
            🎯
          </div>
          
          <button 
            className="zen-button"
            onClick={handleShake}
            disabled={isShaking}
            style={{ marginBottom: '1rem' }}
          >
            {isShaking ? '摇卦中...' : '开始摇卦'}
          </button>
          
          {result && (
            <div className="zen-card zen-card-bronze" style={{ marginTop: '1rem' }}>
              <h3>卦象结果</h3>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DivinationPage 
 
 
 
 