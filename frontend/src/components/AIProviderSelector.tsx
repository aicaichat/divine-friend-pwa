/**
 * AI提供商选择器
 * 让用户选择和配置不同的AI服务
 */

import React, { useState } from 'react'
import { AI_PROVIDERS, recommendAIProvider, type AIProvider } from '../utils/enhanced-ai-options'

interface AIProviderSelectorProps {
  currentProvider: string
  onProviderChange: (providerId: string, config?: any) => void
  onClose: () => void
}

const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  currentProvider,
  onProviderChange,
  onClose
}) => {
  const [selectedProvider, setSelectedProvider] = useState(currentProvider)
  const [showSetupGuide, setShowSetupGuide] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')

  // 获取推荐的AI提供商
  const recommended = recommendAIProvider({
    priority: 'quality',
    technicalLevel: 'beginner',
    networkAvailable: true
  })

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
    const provider = AI_PROVIDERS.find(p => p.id === providerId)
    if (provider?.models) {
      setSelectedModel(provider.models[0])
    }
  }

  const handleSave = () => {
    const provider = AI_PROVIDERS.find(p => p.id === selectedProvider)
    if (!provider) return

    const config = {
      apiKey: provider.type === 'api' ? apiKey : undefined,
      model: selectedModel,
      apiEndpoint: provider.apiEndpoint
    }

    onProviderChange(selectedProvider, config)
    onClose()
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return '#10b981'
      case 'good': return '#f59e0b'
      case 'basic': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getSetupColor = (setup: string) => {
    switch (setup) {
      case 'easy': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'advanced': return '#ef4444'
      default: return '#6b7280'
    }
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
      overflowY: 'auto'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h2 style={{
            color: '#ffd700',
            margin: 0,
            fontSize: '1.3rem'
          }}>
            🤖 选择AI引擎
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ✕
          </button>
        </div>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0,
          fontSize: '0.9rem'
        }}>
          选择适合您的AI对话引擎，体验不同的智能水平
        </p>
      </div>

      {/* AI提供商列表 */}
      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {recommended.map((provider) => (
            <div
              key={provider.id}
              onClick={() => handleProviderSelect(provider.id)}
              style={{
                background: selectedProvider === provider.id 
                  ? 'rgba(255, 215, 0, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: selectedProvider === provider.id 
                  ? '2px solid #ffd700' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {/* 头部信息 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{
                    color: '#ffd700',
                    margin: '0 0 4px 0',
                    fontSize: '1.1rem'
                  }}>
                    {provider.name}
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: 0,
                    fontSize: '0.8rem'
                  }}>
                    {provider.description}
                  </p>
                </div>
                
                {/* 当前使用标识 */}
                {currentProvider === provider.id && (
                  <div style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    当前使用
                  </div>
                )}
              </div>

              {/* 特性标签 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  background: getQualityColor(provider.quality),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  质量: {provider.quality === 'excellent' ? '优秀' : provider.quality === 'good' ? '良好' : '基础'}
                </span>
                
                <span style={{
                  background: getSetupColor(provider.setup),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  设置: {provider.setup === 'easy' ? '简单' : provider.setup === 'medium' ? '中等' : '复杂'}
                </span>
                
                <span style={{
                  background: provider.cost === 'free' ? '#10b981' : '#f59e0b',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  {provider.cost === 'free' ? '完全免费' : '免费试用'}
                </span>
                
                <span style={{
                  background: provider.type === 'local' ? '#8b5cf6' : '#3b82f6',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  {provider.type === 'local' ? '本地' : 'API'}
                </span>
              </div>

              {/* 优缺点 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div>
                  <h5 style={{
                    color: '#10b981',
                    margin: '0 0 6px 0',
                    fontSize: '0.8rem'
                  }}>
                    ✅ 优势
                  </h5>
                  <ul style={{
                    margin: 0,
                    padding: '0 0 0 16px',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    {provider.pros.slice(0, 3).map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 style={{
                    color: '#ef4444',
                    margin: '0 0 6px 0',
                    fontSize: '0.8rem'
                  }}>
                    ⚠️ 限制
                  </h5>
                  <ul style={{
                    margin: 0,
                    padding: '0 0 0 16px',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    {provider.cons.slice(0, 3).map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 设置指南按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSetupGuide(showSetupGuide === provider.id ? null : provider.id)
                }}
                style={{
                  background: 'rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(255, 215, 0, 0.5)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#ffd700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {showSetupGuide === provider.id ? '隐藏设置指南' : '查看设置指南'}
              </button>

              {/* 设置指南详情 */}
              {showSetupGuide === provider.id && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}>
                  <h5 style={{
                    color: '#ffd700',
                    margin: '0 0 8px 0',
                    fontSize: '0.9rem'
                  }}>
                    📖 设置步骤
                  </h5>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.8rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-line'
                  }}>
                    {provider.setupGuide}
                  </div>
                  
                  {/* API配置 */}
                  {provider.type === 'api' && selectedProvider === provider.id && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{
                        display: 'block',
                        color: '#ffd700',
                        fontSize: '0.8rem',
                        marginBottom: '4px'
                      }}>
                        API密钥:
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="输入您的API密钥"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.8rem'
                        }}
                      />
                      
                      {provider.models && (
                        <div style={{ marginTop: '8px' }}>
                          <label style={{
                            display: 'block',
                            color: '#ffd700',
                            fontSize: '0.8rem',
                            marginBottom: '4px'
                          }}>
                            选择模型:
                          </label>
                          <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '0.8rem'
                            }}
                          >
                            {provider.models.map(model => (
                              <option key={model} value={model} style={{ color: '#000' }}>
                                {model}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(255, 215, 0, 0.3)',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          取消
        </button>
        
        <button
          onClick={handleSave}
          disabled={selectedProvider === currentProvider}
          style={{
            flex: 2,
            padding: '12px 24px',
            background: selectedProvider !== currentProvider 
              ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
              : 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '12px',
            color: selectedProvider !== currentProvider ? '#000' : '#666',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: selectedProvider !== currentProvider ? 'pointer' : 'not-allowed'
          }}
        >
          {selectedProvider === currentProvider ? '已选择此引擎' : '切换到此引擎'}
        </button>
      </div>
    </div>
  )
}

export default AIProviderSelector 