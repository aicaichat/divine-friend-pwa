import React, { useState } from 'react';
import { DeepSeekAPI } from '../utils/deepseek-api';

const APITestPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('sk-dc146c694369404abbc1eb7bac2eb41d');
  const [testMessage, setTestMessage] = useState('你好，请给我一些人生建议');
  const [selectedDeity, setSelectedDeity] = useState('guanyin');
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deities = [
    { id: 'guanyin', name: '观音菩萨', description: '慈悲与智慧' },
    { id: 'wenshu', name: '文殊菩萨', description: '智慧与学习' },
    { id: 'amitabha', name: '阿弥陀佛', description: '慈悲与包容' },
    { id: 'budongzun', name: '不动尊菩萨', description: '坚毅与护佑' },
    { id: 'dashizhi', name: '大势至菩萨', description: '智慧与光明' },
    { id: 'dairiruiai', name: '大日如来', description: '光明与智慧' },
    { id: 'xukong', name: '虚空藏菩萨', description: '包容与智慧' }
  ];

  const testDeepSeekAPI = async () => {
    if (!apiKey.trim()) {
      alert('请输入API密钥');
      return;
    }

    setIsLoading(true);
    try {
      const api = new DeepSeekAPI(apiKey);
      const response = await api.chatWithDeity(selectedDeity, testMessage);
      
      setTestResults({
        success: true,
        deity: deities.find(d => d.id === selectedDeity)?.name,
        message: testMessage,
        response: response,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testMultipleDeities = async () => {
    if (!apiKey.trim()) {
      alert('请输入API密钥');
      return;
    }

    setIsLoading(true);
    const results = [];

    try {
      const api = new DeepSeekAPI(apiKey);
      
      for (const deity of deities.slice(0, 3)) { // 只测试前3个神仙
        try {
          const response = await api.chatWithDeity(deity.id, '你好，请简单介绍一下自己');
          results.push({
            deity: deity.name,
            success: true,
            response: response
          });
        } catch (error) {
          results.push({
            deity: deity.name,
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setTestResults({
        success: true,
        type: 'multiple',
        results: results,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="zen-page">
      <div className="zen-header">
        <h1 className="zen-title">DeepSeek API 测试页面</h1>
        <p className="zen-subtitle">
          测试DeepSeek API连接和神仙对话功能
        </p>
      </div>

      <div className="zen-container">
        <div className="zen-card texture-paper">
          <h3 className="zen-subtitle">API配置</h3>
          
          <div style={{ marginBottom: 'var(--space-stanza)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              DeepSeek API密钥
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入您的DeepSeek API密钥"
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-stanza)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              选择神仙
            </label>
            <select
              value={selectedDeity}
              onChange={(e) => setSelectedDeity(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
            >
              {deities.map(deity => (
                <option key={deity.id} value={deity.id}>
                  {deity.name} - {deity.description}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 'var(--space-stanza)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              测试消息
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="输入要发送给神仙的消息"
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-breath)', flexWrap: 'wrap' }}>
            <button
              onClick={testDeepSeekAPI}
              disabled={isLoading}
              style={{
                padding: 'var(--space-verse) var(--space-stanza)',
                background: 'var(--gradient-sunrise)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? '测试中...' : '测试单个神仙'}
            </button>

            <button
              onClick={testMultipleDeities}
              disabled={isLoading}
              style={{
                padding: 'var(--space-verse) var(--space-stanza)',
                background: 'var(--gradient-water)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? '测试中...' : '测试多个神仙'}
            </button>
          </div>
        </div>

        {testResults && (
          <div className="zen-card texture-silk" style={{ marginTop: 'var(--space-stanza)' }}>
            <h3 className="zen-subtitle">测试结果</h3>
            
            {testResults.success ? (
              <div>
                {testResults.type === 'multiple' ? (
                  <div>
                    <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                      ✅ 多神仙测试结果
                    </h4>
                    {testResults.results.map((result: any, index: number) => (
                      <div key={index} style={{
                        marginBottom: 'var(--space-verse)',
                        padding: 'var(--space-verse)',
                        background: result.success ? 'var(--water-essence)10' : 'var(--fire-phoenix)10',
                        borderRadius: 'var(--radius-pebble)',
                        border: `1px solid ${result.success ? 'var(--water-essence)40' : 'var(--fire-phoenix)40'}`
                      }}>
                        <h5 style={{ color: result.success ? 'var(--water-essence)' : 'var(--fire-phoenix)', marginBottom: 'var(--space-breath)' }}>
                          {result.success ? '✅' : '❌'} {result.deity}
                        </h5>
                        {result.success ? (
                          <p style={{ color: 'var(--ink-medium)', fontSize: 'var(--text-small)' }}>
                            {result.response}
                          </p>
                        ) : (
                          <p style={{ color: 'var(--fire-phoenix)', fontSize: 'var(--text-small)' }}>
                            错误: {result.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                      ✅ 测试成功 - {testResults.deity}
                    </h4>
                    
                    <div style={{
                      padding: 'var(--space-verse)',
                      background: 'var(--paper-modern)',
                      borderRadius: 'var(--radius-pebble)',
                      marginBottom: 'var(--space-breath)'
                    }}>
                      <strong>用户消息：</strong>
                      <p style={{ margin: 'var(--space-breath) 0 0 0', color: 'var(--ink-medium)' }}>
                        {testResults.message}
                      </p>
                    </div>

                    <div style={{
                      padding: 'var(--space-verse)',
                      background: 'var(--gradient-water)',
                      borderRadius: 'var(--radius-pebble)',
                      border: '1px solid var(--earth-golden)40'
                    }}>
                      <strong>神仙回复：</strong>
                      <p style={{ margin: 'var(--space-breath) 0 0 0', color: 'var(--ink-thick)', lineHeight: 'var(--leading-relaxed)' }}>
                        {testResults.response}
                      </p>
                    </div>
                  </div>
                )}
                
                <div style={{
                  marginTop: 'var(--space-verse)',
                  padding: 'var(--space-breath)',
                  background: 'var(--gradient-zen-mist)',
                  borderRadius: 'var(--radius-pebble)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--ink-medium)'
                }}>
                  <strong>测试时间：</strong> {testResults.timestamp}
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
                <h4 style={{ marginBottom: 'var(--space-breath)' }}>❌ 测试失败</h4>
                <p style={{ marginBottom: 'var(--space-breath)' }}>错误信息：{testResults.error}</p>
                <p style={{ fontSize: 'var(--text-small)' }}>测试时间：{testResults.timestamp}</p>
                
                <div style={{
                  marginTop: 'var(--space-verse)',
                  padding: 'var(--space-breath)',
                  background: 'var(--gradient-water)',
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--earth-golden)40'
                }}>
                  <h5 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                    🔧 故障排除建议
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-verse)', fontSize: 'var(--text-small)' }}>
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

        <div className="zen-card texture-silk">
          <h3 className="zen-subtitle">使用说明</h3>
          <div style={{ fontSize: 'var(--text-small)', lineHeight: 'var(--leading-relaxed)' }}>
            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
              🎯 测试步骤
            </h4>
            <ol style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>输入您的DeepSeek API密钥</li>
              <li>选择要测试的神仙角色</li>
              <li>输入测试消息</li>
              <li>点击"测试单个神仙"或"测试多个神仙"</li>
              <li>查看测试结果</li>
            </ol>

            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)', marginTop: 'var(--space-stanza)' }}>
              🚀 下一步
            </h4>
            <p>如果API测试成功，您可以：</p>
            <ul style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>访问个性化对话页面：<a href="#?page=free-chat" style={{ color: 'var(--earth-golden)' }}>个性化对话</a></li>
              <li>体验完整的个性化AI对话功能</li>
              <li>享受基于八字和运势的智能指导</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITestPage; 
import { DeepSeekAPI } from '../utils/deepseek-api';

const APITestPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('sk-dc146c694369404abbc1eb7bac2eb41d');
  const [testMessage, setTestMessage] = useState('你好，请给我一些人生建议');
  const [selectedDeity, setSelectedDeity] = useState('guanyin');
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deities = [
    { id: 'guanyin', name: '观音菩萨', description: '慈悲与智慧' },
    { id: 'wenshu', name: '文殊菩萨', description: '智慧与学习' },
    { id: 'amitabha', name: '阿弥陀佛', description: '慈悲与包容' },
    { id: 'budongzun', name: '不动尊菩萨', description: '坚毅与护佑' },
    { id: 'dashizhi', name: '大势至菩萨', description: '智慧与光明' },
    { id: 'dairiruiai', name: '大日如来', description: '光明与智慧' },
    { id: 'xukong', name: '虚空藏菩萨', description: '包容与智慧' }
  ];

  const testDeepSeekAPI = async () => {
    if (!apiKey.trim()) {
      alert('请输入API密钥');
      return;
    }

    setIsLoading(true);
    try {
      const api = new DeepSeekAPI(apiKey);
      const response = await api.chatWithDeity(selectedDeity, testMessage);
      
      setTestResults({
        success: true,
        deity: deities.find(d => d.id === selectedDeity)?.name,
        message: testMessage,
        response: response,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testMultipleDeities = async () => {
    if (!apiKey.trim()) {
      alert('请输入API密钥');
      return;
    }

    setIsLoading(true);
    const results = [];

    try {
      const api = new DeepSeekAPI(apiKey);
      
      for (const deity of deities.slice(0, 3)) { // 只测试前3个神仙
        try {
          const response = await api.chatWithDeity(deity.id, '你好，请简单介绍一下自己');
          results.push({
            deity: deity.name,
            success: true,
            response: response
          });
        } catch (error) {
          results.push({
            deity: deity.name,
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setTestResults({
        success: true,
        type: 'multiple',
        results: results,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="zen-page">
      <div className="zen-header">
        <h1 className="zen-title">DeepSeek API 测试页面</h1>
        <p className="zen-subtitle">
          测试DeepSeek API连接和神仙对话功能
        </p>
      </div>

      <div className="zen-container">
        <div className="zen-card texture-paper">
          <h3 className="zen-subtitle">API配置</h3>
          
          <div style={{ marginBottom: 'var(--space-stanza)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              DeepSeek API密钥
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入您的DeepSeek API密钥"
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-stanza)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              选择神仙
            </label>
            <select
              value={selectedDeity}
              onChange={(e) => setSelectedDeity(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
            >
              {deities.map(deity => (
                <option key={deity.id} value={deity.id}>
                  {deity.name} - {deity.description}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 'var(--space-stanza)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              测试消息
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="输入要发送给神仙的消息"
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-breath)', flexWrap: 'wrap' }}>
            <button
              onClick={testDeepSeekAPI}
              disabled={isLoading}
              style={{
                padding: 'var(--space-verse) var(--space-stanza)',
                background: 'var(--gradient-sunrise)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? '测试中...' : '测试单个神仙'}
            </button>

            <button
              onClick={testMultipleDeities}
              disabled={isLoading}
              style={{
                padding: 'var(--space-verse) var(--space-stanza)',
                background: 'var(--gradient-water)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? '测试中...' : '测试多个神仙'}
            </button>
          </div>
        </div>

        {testResults && (
          <div className="zen-card texture-silk" style={{ marginTop: 'var(--space-stanza)' }}>
            <h3 className="zen-subtitle">测试结果</h3>
            
            {testResults.success ? (
              <div>
                {testResults.type === 'multiple' ? (
                  <div>
                    <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                      ✅ 多神仙测试结果
                    </h4>
                    {testResults.results.map((result: any, index: number) => (
                      <div key={index} style={{
                        marginBottom: 'var(--space-verse)',
                        padding: 'var(--space-verse)',
                        background: result.success ? 'var(--water-essence)10' : 'var(--fire-phoenix)10',
                        borderRadius: 'var(--radius-pebble)',
                        border: `1px solid ${result.success ? 'var(--water-essence)40' : 'var(--fire-phoenix)40'}`
                      }}>
                        <h5 style={{ color: result.success ? 'var(--water-essence)' : 'var(--fire-phoenix)', marginBottom: 'var(--space-breath)' }}>
                          {result.success ? '✅' : '❌'} {result.deity}
                        </h5>
                        {result.success ? (
                          <p style={{ color: 'var(--ink-medium)', fontSize: 'var(--text-small)' }}>
                            {result.response}
                          </p>
                        ) : (
                          <p style={{ color: 'var(--fire-phoenix)', fontSize: 'var(--text-small)' }}>
                            错误: {result.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                      ✅ 测试成功 - {testResults.deity}
                    </h4>
                    
                    <div style={{
                      padding: 'var(--space-verse)',
                      background: 'var(--paper-modern)',
                      borderRadius: 'var(--radius-pebble)',
                      marginBottom: 'var(--space-breath)'
                    }}>
                      <strong>用户消息：</strong>
                      <p style={{ margin: 'var(--space-breath) 0 0 0', color: 'var(--ink-medium)' }}>
                        {testResults.message}
                      </p>
                    </div>

                    <div style={{
                      padding: 'var(--space-verse)',
                      background: 'var(--gradient-water)',
                      borderRadius: 'var(--radius-pebble)',
                      border: '1px solid var(--earth-golden)40'
                    }}>
                      <strong>神仙回复：</strong>
                      <p style={{ margin: 'var(--space-breath) 0 0 0', color: 'var(--ink-thick)', lineHeight: 'var(--leading-relaxed)' }}>
                        {testResults.response}
                      </p>
                    </div>
                  </div>
                )}
                
                <div style={{
                  marginTop: 'var(--space-verse)',
                  padding: 'var(--space-breath)',
                  background: 'var(--gradient-zen-mist)',
                  borderRadius: 'var(--radius-pebble)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--ink-medium)'
                }}>
                  <strong>测试时间：</strong> {testResults.timestamp}
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
                <h4 style={{ marginBottom: 'var(--space-breath)' }}>❌ 测试失败</h4>
                <p style={{ marginBottom: 'var(--space-breath)' }}>错误信息：{testResults.error}</p>
                <p style={{ fontSize: 'var(--text-small)' }}>测试时间：{testResults.timestamp}</p>
                
                <div style={{
                  marginTop: 'var(--space-verse)',
                  padding: 'var(--space-breath)',
                  background: 'var(--gradient-water)',
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--earth-golden)40'
                }}>
                  <h5 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                    🔧 故障排除建议
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-verse)', fontSize: 'var(--text-small)' }}>
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

        <div className="zen-card texture-silk">
          <h3 className="zen-subtitle">使用说明</h3>
          <div style={{ fontSize: 'var(--text-small)', lineHeight: 'var(--leading-relaxed)' }}>
            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
              🎯 测试步骤
            </h4>
            <ol style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>输入您的DeepSeek API密钥</li>
              <li>选择要测试的神仙角色</li>
              <li>输入测试消息</li>
              <li>点击"测试单个神仙"或"测试多个神仙"</li>
              <li>查看测试结果</li>
            </ol>

            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)', marginTop: 'var(--space-stanza)' }}>
              🚀 下一步
            </h4>
            <p>如果API测试成功，您可以：</p>
            <ul style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>访问个性化对话页面：<a href="#?page=free-chat" style={{ color: 'var(--earth-golden)' }}>个性化对话</a></li>
              <li>体验完整的个性化AI对话功能</li>
              <li>享受基于八字和运势的智能指导</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITestPage; 