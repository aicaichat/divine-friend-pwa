import React, { useState } from 'react'
import { APIClient } from '../services/apiClient'

const APITest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)

  const testAPI = async () => {
    setIsTesting(true)
    setTestResult('正在测试API连接...\n')

    try {
      // 测试健康检查
      console.log('开始健康检查...')
      const healthResult = await APIClient.healthCheck()
      console.log('健康检查结果:', healthResult)
      
      if (healthResult.success) {
        setTestResult(prev => prev + '✅ 健康检查通过\n')
        setTestResult(prev => prev + `📊 服务状态: ${JSON.stringify(healthResult.data, null, 2)}\n\n`)
      } else {
        setTestResult(prev => prev + '❌ 健康检查失败: ' + healthResult.error + '\n')
        return
      }

      // 测试八字计算
      console.log('开始八字计算测试...')
      const baziResult = await APIClient.calculateBazi({
        birthdate: '1990-01-01T12:00',
        name: '测试用户',
        gender: 'male'
      })
      console.log('八字计算结果:', baziResult)

      if (baziResult.success) {
        setTestResult(prev => prev + '✅ 八字计算成功\n')
        setTestResult(prev => prev + '📊 八字数据: ' + JSON.stringify(baziResult.data, null, 2))
      } else {
        setTestResult(prev => prev + '❌ 八字计算失败: ' + baziResult.error)
      }

    } catch (error) {
      console.error('API测试失败:', error)
      setTestResult(prev => prev + '❌ API测试失败: ' + (error as Error).message)
    } finally {
      setIsTesting(false)
    }
  }

  const testDirectFetch = async () => {
    setIsTesting(true)
    setTestResult('正在测试直接fetch...\n')

    try {
      // 直接测试健康检查
      const response = await fetch('http://localhost:5001/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(prev => prev + '✅ 直接fetch健康检查成功\n')
        setTestResult(prev => prev + `📊 响应数据: ${JSON.stringify(data, null, 2)}\n`)
      } else {
        setTestResult(prev => prev + `❌ 直接fetch失败: ${response.status} ${response.statusText}\n`)
      }

    } catch (error) {
      console.error('直接fetch测试失败:', error)
      setTestResult(prev => prev + '❌ 直接fetch测试失败: ' + (error as Error).message)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f4e8',
      borderRadius: '10px',
      margin: '20px'
    }}>
      <h2 style={{ color: '#d4af37', marginBottom: '20px' }}>🧪 API连接测试</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testAPI}
          disabled={isTesting}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#d4af37',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isTesting ? 'not-allowed' : 'pointer'
          }}
        >
          {isTesting ? '测试中...' : '测试API客户端'}
        </button>
        
        <button
          onClick={testDirectFetch}
          disabled={isTesting}
          style={{
            padding: '10px 20px',
            backgroundColor: '#8b7355',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isTesting ? 'not-allowed' : 'pointer'
          }}
        >
          {isTesting ? '测试中...' : '测试直接fetch'}
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontFamily: 'monospace',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {testResult || '点击按钮开始测试...'}
      </div>
    </div>
  )
}

export default APITest 