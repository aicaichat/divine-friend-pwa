import React, { useState } from 'react';
import { DeepSeekAPI } from '../utils/deepseek-api';
import { validateAPIKey, getAPIConfig } from '../config/api';

const DeepSeekIntegrationTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const testDeepSeekAPI = async () => {
    setIsLoading(true);
    try {
      // 检查API配置
      const config = getAPIConfig();
      const isConfigured = validateAPIKey();
      
      if (!isConfigured || !config.deepseek.apiKey) {
        throw new Error('DeepSeek API密钥未配置');
      }

      // 创建API实例
      const api = new DeepSeekAPI(config.deepseek.apiKey);
      
      // 测试对话
      const response = await api.chatWithDeity('guanyin', '你好，请给我一些人生建议');
      
      setTestResults({
        success: true,
        apiConfigured: isConfigured,
        response: response,
        message: 'DeepSeek API测试成功！'
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: 'DeepSeek API测试失败'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testWithCustomKey = async () => {
    if (!apiKey.trim()) {
      alert('请输入API密钥');
      return;
    }

    setIsLoading(true);
    try {
      const api = new DeepSeekAPI(apiKey);
      const response = await api.chatWithDeity('guanyin', '你好，请给我一些人生建议');
      
      setTestResults({
        success: true,
        response: response,
        message: '自定义API密钥测试成功！'
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: '自定义API密钥测试失败'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="zen-page">
      <div className="zen-header">
        <h1 className="zen-title">DeepSeek API集成测试</h1>
        <p className="zen-subtitle">
          测试DeepSeek API连接和个性化对话功能
        </p>
      </div>

      <div className="zen-container">
        <div className="zen-card texture-paper">
          <h3 className="zen-subtitle">API配置测试</h3>
          
          <div style={{ marginBottom: 'var(--space-stanza)' }}>
            <button
              onClick={testDeepSeekAPI}
              disabled={isLoading}
              className="zen-button hover-lift"
              style={{
                padding: 'var(--space-verse) var(--space-stanza)',
                background: 'var(--gradient-sunrise)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                marginBottom: 'var(--space-verse)'
              }}
            >
              {isLoading ? '测试中...' : '测试环境变量API密钥'}
            </button>
          </div>

          <div style={{ marginBottom: 'var(--space-stanza)' }}>
            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
              或使用自定义API密钥测试
            </h4>
            <div style={{ display: 'flex', gap: 'var(--space-breath)', marginBottom: 'var(--space-verse)' }}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入DeepSeek API密钥"
                style={{
                  flex: 1,
                  padding: 'var(--space-verse)',
                  border: '2px solid var(--earth-golden)40',
                  borderRadius: 'var(--radius-moon)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--paper-modern)',
                  color: 'var(--ink-thick)',
                  outline: 'none'
                }}
              />
              <button
                onClick={testWithCustomKey}
                disabled={isLoading || !apiKey.trim()}
                className="zen-button hover-lift"
                style={{
                  padding: 'var(--space-verse) var(--space-stanza)',
                  background: 'var(--gradient-water)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-moon)',
                  fontSize: 'var(--text-base)',
                  fontWeight: '600',
                  cursor: isLoading || !apiKey.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !apiKey.trim() ? 0.6 : 1
                }}
              >
                {isLoading ? '测试中...' : '测试'}
              </button>
            </div>
          </div>

          {testResults && (
            <div style={{ marginTop: 'var(--space-stanza)' }}>
              {testResults.success ? (
                <div style={{ 
                  padding: 'var(--space-verse)', 
                  background: 'var(--water-essence)10', 
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--water-essence)40',
                  color: 'var(--water-essence)'
                }}>
                  <h4 style={{ marginBottom: 'var(--space-breath)' }}>✅ {testResults.message}</h4>
                  
                  <div style={{ 
                    padding: 'var(--space-verse)', 
                    background: 'var(--paper-modern)', 
                    borderRadius: 'var(--radius-pebble)',
                    fontSize: 'var(--text-small)',
                    lineHeight: 'var(--leading-relaxed)',
                    marginTop: 'var(--space-breath)',
                    color: 'var(--ink-thick)'
                  }}>
                    <strong>API回复：</strong>
                    <p style={{ margin: 'var(--space-breath) 0 0 0' }}>{testResults.response}</p>
                  </div>

                  <div style={{ 
                    padding: 'var(--space-verse)', 
                    background: 'var(--gradient-water)', 
                    borderRadius: 'var(--radius-pebble)',
                    border: '1px solid var(--earth-golden)40',
                    marginTop: 'var(--space-breath)'
                  }}>
                    <h5 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                      🎯 测试建议
                    </h5>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: 'var(--space-verse)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--ink-medium)'
                    }}>
                      <li>API连接正常，可以调用DeepSeek服务</li>
                      <li>可以进入个性化对话页面进行完整测试</li>
                      <li>建议配置环境变量以保护API密钥</li>
                      <li>可以测试不同神仙角色的回复风格</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: 'var(--space-verse)', 
                  background: 'var(--fire-phoenix)10', 
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--fire-phoenix)40',
                  color: 'var(--fire-phoenix)'
                }}>
                  <h4 style={{ marginBottom: 'var(--space-breath)' }}>❌ {testResults.message}</h4>
                  <div>错误信息：{testResults.error}</div>
                  
                  <div style={{ 
                    padding: 'var(--space-verse)', 
                    background: 'var(--gradient-water)', 
                    borderRadius: 'var(--radius-pebble)',
                    border: '1px solid var(--earth-golden)40',
                    marginTop: 'var(--space-breath)'
                  }}>
                    <h5 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                      🔧 故障排除
                    </h5>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: 'var(--space-verse)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--ink-medium)'
                    }}>
                      <li>检查API密钥是否正确</li>
                      <li>确认账户有足够的API调用额度</li>
                      <li>检查网络连接是否正常</li>
                      <li>验证API密钥是否有效</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="zen-card texture-silk">
          <h3 className="zen-subtitle">DeepSeek API说明</h3>
          <div style={{ fontSize: 'var(--text-small)', lineHeight: 'var(--leading-relaxed)' }}>
            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
              🤖 DeepSeek API功能
            </h4>
            <ul style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>提供真实的AI对话体验</li>
              <li>支持多种神仙角色设定</li>
              <li>结合用户八字和运势信息</li>
              <li>生成个性化的智慧回复</li>
              <li>保持对话历史和上下文</li>
            </ul>

            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)', marginTop: 'var(--space-stanza)' }}>
              🔑 配置方法
            </h4>
            <ol style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>访问 <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--earth-golden)' }}>DeepSeek平台</a></li>
              <li>注册账号并登录</li>
              <li>在API Keys页面创建新的API Key</li>
              <li>将API Key添加到环境变量或直接测试</li>
            </ol>

            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)', marginTop: 'var(--space-stanza)' }}>
              🎯 使用建议
            </h4>
            <ul style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>建议使用环境变量存储API密钥</li>
              <li>定期检查API调用额度</li>
              <li>可以测试不同神仙的回复风格</li>
              <li>结合八字信息获得更精准的回复</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepSeekIntegrationTestPage; 