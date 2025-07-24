/**
 * DeepSeek API 演示组件
 * 展示神仙对话功能的基本实现
 */

import React, { useState } from 'react'
import { useDeityChat } from '../hooks/useDeityChat'
import { DEITY_PERSONALITIES } from '../utils/deepseek-api'
import { validateAPIKey, ENV_INSTRUCTIONS } from '../config/api'

const DeepSeekDemo: React.FC = () => {
  const [selectedDeity, setSelectedDeity] = useState<string>('guanyin')
  const [inputMessage, setInputMessage] = useState('')
  
  const {
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    clearHistory,
    isAPIConfigured
  } = useDeityChat()

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    
    await sendMessage(inputMessage.trim(), selectedDeity)
    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isAPIConfigured) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fffbeb', 
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>🔑 需要配置 DeepSeek API</h3>
        <p>请按照以下步骤配置API密钥：</p>
        <pre style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '15px', 
          borderRadius: '5px',
          fontSize: '12px',
          overflowX: 'auto'
        }}>
          {ENV_INSTRUCTIONS}
        </pre>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '20px auto', 
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: '#fff'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>🙏 与神仙对话</h2>
        <p>选择一位神仙开始对话：</p>
        
        <select 
          value={selectedDeity}
          onChange={(e) => setSelectedDeity(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            marginRight: '10px'
          }}
        >
          {Object.entries(DEITY_PERSONALITIES).map(([id, deity]) => (
            <option key={id} value={id}>
              {deity.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={clearHistory}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          清空对话
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          color: '#dc2626',
          marginBottom: '20px'
        }}>
          错误：{error}
        </div>
      )}

      <div style={{
        height: '400px',
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#f9fafb'
      }}>
        {messages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#6b7280',
            marginTop: '150px'
          }}>
            开始与{DEITY_PERSONALITIES[selectedDeity].name}对话吧！
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.role === 'user' ? '#3b82f6' : '#f3f4f6',
                color: message.role === 'user' ? 'white' : '#374151'
              }}
            >
              {message.role === 'deity' && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginBottom: '5px'
                }}>
                  {DEITY_PERSONALITIES[message.deityId]?.name || '神仙'}
                </div>
              )}
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
                {message.isTyping && (
                  <span style={{ animation: 'blink 1s infinite' }}>|</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ 
            textAlign: 'center', 
            color: '#6b7280' 
          }}>
            {DEITY_PERSONALITIES[selectedDeity].name}正在思考中...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`向${DEITY_PERSONALITIES[selectedDeity].name}请教...`}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit'
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: !inputMessage.trim() || isLoading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  )
}

export default DeepSeekDemo 