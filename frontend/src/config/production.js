// 生产环境配置
export const config = {
  // API配置
  API_BASE_URL: 'https://api.bless.top',
  API_TIMEOUT: 30000,
  
  // 应用配置
  APP_NAME: 'Divine Friend PWA',
  APP_VERSION: '1.0.0',
  APP_DOMAIN: 'today.bless.top',
  
  // 功能开关
  FEATURES: {
    PWA: true,
    OFFLINE: true,
    PUSH_NOTIFICATIONS: true,
    ANALYTICS: true,
  },
  
  // 缓存配置
  CACHE: {
    API_CACHE_TIME: 5 * 60 * 1000, // 5分钟
    STATIC_CACHE_TIME: 24 * 60 * 60 * 1000, // 24小时
  },
  
  // 监控配置
  MONITORING: {
    ENABLED: true,
    SAMPLE_RATE: 0.1, // 10%采样率
  },
  
  // 安全配置
  SECURITY: {
    CSRF_PROTECTION: true,
    XSS_PROTECTION: true,
    CONTENT_SECURITY_POLICY: true,
  }
};

export default config; 