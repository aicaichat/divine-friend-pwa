/**
 * API配置文件
 * 管理DeepSeek API和其他服务的配置
 */

interface APIConfig {
  deepseek: {
    apiKey: string
    baseURL: string
    model: string
    maxTokens: number
    temperature: number
    topP: number
  }
  features: {
    enableRealTimeChat: boolean
    enableFortuneGeneration: boolean
    enableOfflineMode: boolean
  }
}

// 获取环境变量
const getEnvVar = (key: string): string => {
  try {
    return (import.meta as any).env?.[key] || ''
  } catch {
    return ''
  }
}

// 默认配置
const config: APIConfig = {
  deepseek: {
    apiKey: getEnvVar('VITE_DEEPSEEK_API_KEY'),
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    maxTokens: 200,
    temperature: 0.7,
    topP: 0.9
  },
  features: {
    enableRealTimeChat: true,
    enableFortuneGeneration: true,
    enableOfflineMode: false
  }
}

// API密钥验证
export const validateAPIKey = (): boolean => {
  const apiKey = config.deepseek.apiKey
  return !!(apiKey && apiKey.length > 0 && apiKey !== 'your-deepseek-api-key')
}

// 获取API配置
export const getAPIConfig = (): APIConfig => config

// 检查功能是否启用
export const isFeatureEnabled = (feature: keyof APIConfig['features']): boolean => {
  return config.features[feature]
}

// 设置API密钥（用于动态配置）
export const setAPIKey = (apiKey: string): void => {
  config.deepseek.apiKey = apiKey
}

// 导出默认配置
export default config

// 环境变量说明
export const ENV_INSTRUCTIONS = `
请在项目根目录创建 .env.local 文件，并添加以下配置：

# DeepSeek API 配置
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key-here

如何获取 DeepSeek API Key：
1. 访问 https://platform.deepseek.com/
2. 注册账号并登录
3. 在 API Keys 页面创建新的 API Key
4. 将 API Key 复制到 .env.local 文件中

注意：
- .env.local 文件不会被提交到 git
- API Key 需要保密，不要分享给他人
- 确保账户有足够的额度用于 API 调用
` 