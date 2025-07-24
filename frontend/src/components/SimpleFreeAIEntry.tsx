/**
 * 简化版AI对话入口 - 用于测试
 */

import React, { useState } from 'react'

interface SimpleFreeAIEntryProps {
  className?: string
}

const SimpleFreeAIEntry: React.FC<SimpleFreeAIEntryProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)

  console.log('SimpleFreeAIEntry render, isOpen:', isOpen)

  const handleButtonClick = () => {
    console.log('Button clicked! Current isOpen:', isOpen)
    setIsOpen(true)
    console.log('setIsOpen(true) called')
  }

  const handleClose = () => {
    console.log('Close clicked')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <div className={`simple-ai-entry ${className}`} style={{ padding: '20px' }}>
        <button
          onClick={handleButtonClick}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 24px',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          💬 开始深度神仙对话 (测试版)
        </button>
        
        <div style={{
          marginTop: '8px',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center'
        }}>
          状态: isOpen = {isOpen.toString()}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#ffd700',
          margin: '0 0 20px 0',
          fontSize: '1.5rem'
        }}>
          🎉 测试成功！
        </h2>
        
        <p style={{
          color: '#fff',
          margin: '0 0 20px 0',
          fontSize: '1rem'
        }}>
          按钮点击功能正常工作！
        </p>
        
        <button
          onClick={handleClose}
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            color: '#000',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          关闭测试
        </button>
      </div>
    </div>
  )
}

export default SimpleFreeAIEntry 