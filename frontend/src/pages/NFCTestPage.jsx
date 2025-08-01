import React, { useState } from 'react';

const NFCTestPage = ({ onNavigate }) => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 测试URL
  const testURLs = [
    'http://192.168.1.100:3002/verify?chip=CHIP-2024-001&bracelet=1&hash=Q0hJUC0yMDI0LTAw&timestamp=1753610776324&source=nfc&quick=true',
    'http://localhost:3002/verify?chip=CHIP-2024-002&bracelet=2&hash=Q0hJUC0yMDI0LTAx&timestamp=1753610776324&source=nfc&quick=true',
    '/verify?chip=CHIP-2024-003&bracelet=3&hash=Q0hJUC0yMDI0LTAy&timestamp=1753610776324&source=nfc&quick=true'
  ];

  const testURL = async (url) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // 解析URL参数
      const urlObj = new URL(url, window.location.origin);
      const params = {
        chip: urlObj.searchParams.get('chip'),
        bracelet: urlObj.searchParams.get('bracelet'),
        hash: urlObj.searchParams.get('hash'),
        timestamp: urlObj.searchParams.get('timestamp'),
        source: urlObj.searchParams.get('source'),
        quick: urlObj.searchParams.get('quick')
      };

      // 测试API调用
      let apiResult = null;
      try {
        const response = await fetch('/api/bracelets/verify-nfc-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        
        if (response.ok) {
          apiResult = await response.json();
        } else {
          apiResult = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
      } catch (error) {
        apiResult = { error: error.message };
      }

      // 测试路由访问
      let routeResult = null;
      try {
        const routeResponse = await fetch(urlObj.pathname + urlObj.search);
        routeResult = {
          status: routeResponse.status,
          ok: routeResponse.ok,
          statusText: routeResponse.statusText
        };
      } catch (error) {
        routeResult = { error: error.message };
      }

      const result = {
        url,
        params,
        apiResult,
        routeResult,
        duration: Date.now() - startTime,
        timestamp: new Date().toLocaleTimeString()
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // 保留最近10条
      return result;
      
    } catch (error) {
      const result = {
        url,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const testAllURLs = async () => {
    for (const url of testURLs) {
      await testURL(url);
      await new Promise(resolve => setTimeout(resolve, 500)); // 间隔500ms
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'monospace',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* 头部 */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>🔍 NFC URL 测试工具</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          测试NFC验证URL的功能和API响应
        </p>
      </div>

      {/* 控制按钮 */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={testAllURLs}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '测试中...' : '🧪 测试所有URL'}
          </button>
          
          <button
            onClick={clearResults}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🗑️ 清空结果
          </button>
          
          <button
            onClick={() => onNavigate('today')}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🏠 返回主页
          </button>
        </div>
      </div>

      {/* 测试URL列表 */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 预设测试URL</h3>
        {testURLs.map((url, index) => (
          <div key={index} style={{ 
            marginBottom: '10px', 
            padding: '10px', 
            background: '#f8f9fa', 
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ 
              flex: 1, 
              fontSize: '12px', 
              wordBreak: 'break-all',
              marginRight: '10px'
            }}>
              {url}
            </div>
            <button
              onClick={() => testURL(url)}
              disabled={isLoading}
              style={{
                padding: '5px 15px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                fontSize: '12px'
              }}
            >
              测试
            </button>
          </div>
        ))}
      </div>

      {/* 测试结果 */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
          📊 测试结果 ({testResults.length})
        </h3>
        
        {testResults.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>暂无测试结果</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              background: result.error ? '#fff5f5' : '#f0fff4', 
              border: `1px solid ${result.error ? '#fed7d7' : '#c6f6d5'}`,
              borderRadius: '6px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10px',
                alignItems: 'center'
              }}>
                <span style={{ 
                  background: result.error ? '#e53e3e' : '#38a169',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {result.error ? '❌ 失败' : '✅ 成功'}
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {result.timestamp} | {result.duration}ms
                </span>
              </div>
              
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                <strong>URL:</strong> {result.url}
              </div>
              
              {result.params && (
                <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                  <strong>参数:</strong>
                  <pre style={{ 
                    background: '#f1f3f4', 
                    padding: '8px', 
                    borderRadius: '4px',
                    margin: '4px 0',
                    fontSize: '11px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(result.params, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.apiResult && (
                <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                  <strong>API响应:</strong>
                  <pre style={{ 
                    background: '#f1f3f4', 
                    padding: '8px', 
                    borderRadius: '4px',
                    margin: '4px 0',
                    fontSize: '11px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(result.apiResult, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.routeResult && (
                <div style={{ fontSize: '12px' }}>
                  <strong>路由测试:</strong>
                  <pre style={{ 
                    background: '#f1f3f4', 
                    padding: '8px', 
                    borderRadius: '4px',
                    margin: '4px 0',
                    fontSize: '11px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(result.routeResult, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.error && (
                <div style={{ fontSize: '12px', color: '#e53e3e' }}>
                  <strong>错误:</strong> {result.error}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NFCTestPage; 