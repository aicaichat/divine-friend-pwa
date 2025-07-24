import React from 'react'

const Divination = () => {
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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #d4af37, #8b7355)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          易经占卜
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(44, 62, 80, 0.7)', marginBottom: '2rem' }}>
          诚心求问，易经解答
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          {[
            { name: '静心', icon: '🧘‍♂️', desc: '保持内心平静' },
            { name: '诚心', icon: '🙏', desc: '真诚面对问题' },
            { name: '领悟', icon: '💡', desc: '用心理解卦象' }
          ].map((step, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{step.icon}</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1rem' }}>{step.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(44, 62, 80, 0.7)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
        <button style={{
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, #d4af37, #8b7355)',
          color: 'white',
          border: 'none',
          borderRadius: '1rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '2rem',
          boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)'
        }}>
          🎯 开始占卜
        </button>
        <p style={{ 
          fontSize: '1rem', 
          color: 'rgba(44, 62, 80, 0.6)', 
          fontStyle: 'italic',
          marginTop: '2rem'
        }}>
          易经占卜功能正在开发中，敬请期待...
        </p>
      </div>
    </div>
  )
}

export default Divination 