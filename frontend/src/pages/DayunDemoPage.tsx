import React from 'react'
import DayunDisplay from '../components/DayunDisplay'

const DayunDemoPage: React.FC = () => {
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
            🌟 大运信息展示
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            textAlign: 'center',
            margin: '10px 0 0 0'
          }}>
            专业的大运信息展示，包含详细的大运分析和运势预测
          </p>
        </div>
        
        <DayunDisplay dayunData={[]} />
      </div>
    </div>
  )
}

export default DayunDemoPage 