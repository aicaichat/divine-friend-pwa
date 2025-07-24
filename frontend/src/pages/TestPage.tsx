import React from 'react'
import APITest from '../components/APITest'

const TestPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f4e8',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#d4af37',
          marginBottom: '30px',
          fontFamily: 'Ma Shan Zheng, serif'
        }}>
          🧪 API连接测试
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#666'
        }}>
          测试前端与后端八字计算API的连接状态
        </p>
        
        <APITest />
        
        <div style={{ 
          marginTop: '40px', 
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3>📋 测试说明</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>健康检查:</strong> 验证后端服务是否正常运行</li>
            <li><strong>八字计算:</strong> 测试真实的八字计算API功能</li>
            <li><strong>数据格式:</strong> 验证API响应的数据格式是否正确</li>
            <li><strong>错误处理:</strong> 测试网络错误和API错误的处理</li>
          </ul>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '20px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <h3>🔧 技术栈</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li><strong>前端:</strong> React + TypeScript + Vite</li>
            <li><strong>后端:</strong> Python + Flask + sxtwl</li>
            <li><strong>API:</strong> RESTful API with CORS</li>
            <li><strong>八字计算:</strong> 基于sxtwl库的真实八字算法</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TestPage 