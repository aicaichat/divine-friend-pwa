// 开发环境配置
export const config = {
  // API配置
  API_BASE_URL: 'http://localhost:5001',
  API_TIMEOUT: 10000,
  
  // 应用配置
  APP_NAME: 'Divine Friend PWA (Dev)',
  APP_VERSION: '1.0.0-dev',
  APP_DOMAIN: 'localhost:3003',
  
  // 功能开关
  FEATURES: {
    PWA: false,
    OFFLINE: false,
    PUSH_NOTIFICATIONS: false,
    ANALYTICS: false,
  },
  
  // 缓存配置
  CACHE: {
    API_CACHE_TIME: 0, // 开发环境不缓存
    STATIC_CACHE_TIME: 0,
  },
  
  // 监控配置
  MONITORING: {
    ENABLED: false,
    SAMPLE_RATE: 1.0, // 100%采样率用于调试
  },
  
  // 安全配置
  SECURITY: {
    CSRF_PROTECTION: false,
    XSS_PROTECTION: true,
    CONTENT_SECURITY_POLICY: false,
  }
};

export default config; 