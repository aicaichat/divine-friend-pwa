import React from 'react'

const SutraReading = () => {
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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #d4af37, #8b7355)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          经典诵读
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(44, 62, 80, 0.7)', marginBottom: '2rem' }}>
          心经、金刚经、道德经等经典诵读
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          {[
            { name: '般若波罗蜜多心经', icon: '🙏', desc: '净化心灵，增长智慧' },
            { name: '金刚般若波罗蜜经', icon: '💎', desc: '破除执着，心灵解脱' },
            { name: '道德经', icon: '☯️', desc: '修身养性，领悟自然' }
          ].map((sutra, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{sutra.icon}</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1rem' }}>{sutra.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(44, 62, 80, 0.7)' }}>{sutra.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ 
          fontSize: '1rem', 
          color: 'rgba(44, 62, 80, 0.6)', 
          fontStyle: 'italic',
          marginTop: '2rem'
        }}>
          经典诵读功能正在开发中，敬请期待...
        </p>
      </div>
    </div>
  )
}

export default SutraReading 
 

const SutraReading = () => {
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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #d4af37, #8b7355)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          经典诵读
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(44, 62, 80, 0.7)', marginBottom: '2rem' }}>
          心经、金刚经、道德经等经典诵读
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          {[
            { name: '般若波罗蜜多心经', icon: '🙏', desc: '净化心灵，增长智慧' },
            { name: '金刚般若波罗蜜经', icon: '💎', desc: '破除执着，心灵解脱' },
            { name: '道德经', icon: '☯️', desc: '修身养性，领悟自然' }
          ].map((sutra, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{sutra.icon}</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1rem' }}>{sutra.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(44, 62, 80, 0.7)' }}>{sutra.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ 
          fontSize: '1rem', 
          color: 'rgba(44, 62, 80, 0.6)', 
          fontStyle: 'italic',
          marginTop: '2rem'
        }}>
          经典诵读功能正在开发中，敬请期待...
        </p>
      </div>
    </div>
  )
}

export default SutraReading 
 
 
 
 