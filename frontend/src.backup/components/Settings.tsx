import React from 'react'

const Settings = () => {
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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #d4af37, #8b7355)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          个人设置
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(44, 62, 80, 0.7)', marginBottom: '2rem' }}>
          个性化您的神仙朋友体验
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          {[
            { name: '通知设置', icon: '🔔', desc: '管理推送和提醒' },
            { name: '隐私设置', icon: '🔒', desc: '保护个人信息' },
            { name: '外观设置', icon: '🎨', desc: '自定义界面主题' },
            { name: '修行设置', icon: '🧘‍♂️', desc: '个性化修行体验' }
          ].map((setting, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{setting.icon}</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1rem' }}>{setting.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(44, 62, 80, 0.7)' }}>{setting.desc}</p>
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
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>当前配置</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(44, 62, 80, 0.7)' }}>护法神</div>
              <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: 'bold' }}>观音菩萨</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(44, 62, 80, 0.7)' }}>修行等级</div>
              <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: 'bold' }}>初学者</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(44, 62, 80, 0.7)' }}>主题模式</div>
              <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: 'bold' }}>浅色</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(44, 62, 80, 0.7)' }}>通知状态</div>
              <div style={{ fontSize: '1rem', color: '#4caf50', fontWeight: 'bold' }}>已开启</div>
            </div>
          </div>
        </div>
        <p style={{ 
          fontSize: '1rem', 
          color: 'rgba(44, 62, 80, 0.6)', 
          fontStyle: 'italic',
          marginTop: '1rem',
          marginBottom: '2rem'
        }}>
          个人设置功能正在开发中，敬请期待...
        </p>
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          background: 'rgba(212, 175, 55, 0.1)',
          borderRadius: '1rem',
          fontSize: '0.9rem',
          color: 'rgba(44, 62, 80, 0.7)'
        }}>
          <p>交个神仙朋友 v1.0.0</p>
          <p>愿科技与禅意完美融合 🙏</p>
        </div>
      </div>
    </div>
  )
}

export default Settings 