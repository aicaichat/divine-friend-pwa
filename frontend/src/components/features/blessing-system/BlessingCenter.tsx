import React from 'react'

const BlessingCenter = () => {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f8f9fa 0%, rgba(212, 175, 55, 0.05) 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: '0 8px 32px rgba(212, 175, 55, 0.15)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🙏</div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #d4af37, #8b7355)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          祝福中心
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(44, 62, 80, 0.7)', marginBottom: '2rem' }}>
          传递善念，分享祝福，让爱心传遍四方
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          {[
            { name: '收到的祝福', icon: '💝', desc: '查看来自朋友的祝福' },
            { name: '发送祝福', icon: '🌟', desc: '为他人送上美好祝愿' },
            { name: '公共祝福', icon: '🌍', desc: '全球用户的祝福分享' }
          ].map((tab, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{tab.icon}</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1rem' }}>{tab.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(44, 62, 80, 0.7)' }}>{tab.desc}</p>
            </div>
          ))}
        </div>
        <div style={{
          margin: '2rem 0',
          padding: '1.5rem',
          background: 'rgba(212, 175, 55, 0.1)',
          borderRadius: '1rem',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>今日祝福统计</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', color: '#d4af37', fontWeight: 'bold' }}>8</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(44, 62, 80, 0.7)' }}>收到祝福</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', color: '#d4af37', fontWeight: 'bold' }}>3</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(44, 62, 80, 0.7)' }}>发送祝福</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', color: '#d4af37', fontWeight: 'bold' }}>2,888</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(44, 62, 80, 0.7)' }}>祝福能量</div>
            </div>
          </div>
        </div>
        <p style={{ 
          fontSize: '1rem', 
          color: 'rgba(44, 62, 80, 0.6)', 
          fontStyle: 'italic',
          marginTop: '1rem'
        }}>
          祝福中心功能正在开发中，敬请期待...
        </p>
      </div>
    </div>
  )
}

export default BlessingCenter 
 
 
 
 