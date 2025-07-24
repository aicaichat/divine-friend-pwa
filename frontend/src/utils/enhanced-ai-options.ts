/**
 * 增强的免费生成式AI选项
 * 提供多种免费AI服务集成方案
 */

export interface AIProvider {
  id: string
  name: string
  description: string
  type: 'local' | 'api' | 'hybrid'
  setup: 'easy' | 'medium' | 'advanced'
  quality: 'basic' | 'good' | 'excellent'
  speed: 'fast' | 'medium' | 'slow'
  privacy: 'high' | 'medium' | 'low'
  cost: 'free' | 'freemium' | 'paid'
  pros: string[]
  cons: string[]
  setupGuide: string
  apiEndpoint?: string
  models?: string[]
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'current-template',
    name: '当前模板系统',
    description: '基于规则和模板的本地AI系统',
    type: 'local',
    setup: 'easy',
    quality: 'basic',
    speed: 'fast',
    privacy: 'high',
    cost: 'free',
    pros: [
      '完全免费',
      '响应极快',
      '隐私安全',
      '无需网络',
      '已配置完成'
    ],
    cons: [
      '回复相对固定',
      '缺乏创造性',
      '上下文理解有限',
      '无法学习进化'
    ],
    setupGuide: '已经配置完成，无需额外设置'
  },
  
  {
    id: 'huggingface-inference',
    name: 'Hugging Face 免费推理API',
    description: '使用Hugging Face的免费模型推理服务',
    type: 'api',
    setup: 'easy',
    quality: 'excellent',
    speed: 'medium',
    privacy: 'medium',
    cost: 'free',
    pros: [
      '真正的生成式AI',
      '多种开源模型可选',
      '免费额度充足',
      '效果接近GPT',
      '持续更新'
    ],
    cons: [
      '需要注册账号',
      '有API调用限制',
      '网络延迟',
      '可能排队等待'
    ],
    setupGuide: '1. 访问 https://huggingface.co/\n2. 注册免费账号\n3. 获取API Token\n4. 配置到应用中',
    apiEndpoint: 'https://api-inference.huggingface.co/models/',
    models: [
      'microsoft/DialoGPT-large',
      'facebook/blenderbot-400M-distill',
      'microsoft/GODEL-v1_1-large-seq2seq',
      'Qwen/Qwen2.5-Coder-32B-Instruct'
    ]
  },

  {
    id: 'ollama-local',
    name: 'Ollama 本地大模型',
    description: '在本地运行开源大语言模型',
    type: 'local',
    setup: 'medium',
    quality: 'excellent',
    speed: 'medium',
    privacy: 'high',
    cost: 'free',
    pros: [
      '完全本地运行',
      '隐私绝对安全',
      '无使用限制',
      '支持多种开源模型',
      '可自定义训练'
    ],
    cons: [
      '需要较高配置电脑',
      '首次下载模型较大',
      '设置相对复杂',
      '占用系统资源'
    ],
    setupGuide: '1. 安装 Ollama: https://ollama.ai/\n2. 下载模型: ollama pull llama2\n3. 启动服务: ollama serve\n4. 集成到应用',
    apiEndpoint: 'http://localhost:11434/api/generate',
    models: [
      'llama2:7b',
      'mistral:7b',
      'gemma:7b',
      'qwen2.5:7b',
      'deepseek-coder:6.7b'
    ]
  },

  {
    id: 'groq-api',
    name: 'Groq 免费API',
    description: 'Groq提供的超快速免费AI推理服务',
    type: 'api',
    setup: 'easy',
    quality: 'excellent',
    speed: 'fast',
    privacy: 'medium',
    cost: 'freemium',
    pros: [
      '速度极快',
      '免费额度大',
      '支持多种模型',
      'API稳定',
      '响应质量高'
    ],
    cons: [
      '需要注册',
      '有月度限制',
      '依赖网络',
      '可能需要付费升级'
    ],
    setupGuide: '1. 访问 https://console.groq.com/\n2. 注册免费账号\n3. 获取API Key\n4. 配置到应用',
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      'llama3-8b-8192',
      'llama3-70b-8192',
      'mixtral-8x7b-32768',
      'gemma-7b-it'
    ]
  },

  {
    id: 'cohere-api',
    name: 'Cohere 免费API',
    description: 'Cohere提供的企业级AI服务免费层',
    type: 'api',
    setup: 'easy',
    quality: 'excellent',
    speed: 'fast',
    privacy: 'medium',
    cost: 'freemium',
    pros: [
      '企业级质量',
      '专为对话优化',
      '免费试用额度',
      'API文档完善',
      '支持中文'
    ],
    cons: [
      '免费额度有限',
      '需要注册',
      '可能需要付费',
      '依赖网络'
    ],
    setupGuide: '1. 访问 https://cohere.com/\n2. 注册试用账号\n3. 获取API Key\n4. 配置到应用',
    apiEndpoint: 'https://api.cohere.ai/v1/chat',
    models: [
      'command-r',
      'command-r-plus',
      'command-light'
    ]
  },

  {
    id: 'together-api',
    name: 'Together AI 免费API',
    description: 'Together AI提供的开源模型托管服务',
    type: 'api',
    setup: 'easy',
    quality: 'excellent',
    speed: 'fast',
    privacy: 'medium',
    cost: 'freemium',
    pros: [
      '多种开源模型',
      '免费试用额度',
      'API兼容OpenAI',
      '响应速度快',
      '模型选择丰富'
    ],
    cons: [
      '免费额度有限',
      '需要信用卡验证',
      '依赖网络',
      '可能需要付费'
    ],
    setupGuide: '1. 访问 https://together.ai/\n2. 注册账号\n3. 获取API Key\n4. 配置到应用',
    apiEndpoint: 'https://api.together.xyz/v1/chat/completions',
    models: [
      'meta-llama/Llama-2-7b-chat-hf',
      'mistralai/Mistral-7B-Instruct-v0.1',
      'togethercomputer/RedPajama-INCITE-Chat-3B-v1'
    ]
  }
]

// 推荐的AI提供商（按优先级排序）
export const RECOMMENDED_PROVIDERS = [
  'huggingface-inference', // 最推荐：免费且效果好
  'groq-api',             // 速度最快
  'ollama-local',         // 隐私最好
  'current-template'      // 当前方案
]

// 根据用户需求推荐AI方案
export function recommendAIProvider(requirements: {
  priority: 'quality' | 'speed' | 'privacy' | 'simplicity'
  technicalLevel: 'beginner' | 'intermediate' | 'advanced'
  networkAvailable: boolean
}): AIProvider[] {
  const { priority, technicalLevel, networkAvailable } = requirements
  
  let filtered = AI_PROVIDERS.filter(provider => {
    // 网络可用性过滤
    if (!networkAvailable && provider.type === 'api') return false
    
    // 技术水平过滤
    if (technicalLevel === 'beginner' && provider.setup === 'advanced') return false
    
    return true
  })
  
  // 根据优先级排序
  switch (priority) {
    case 'quality':
      filtered = filtered.sort((a, b) => {
        const qualityOrder = { excellent: 3, good: 2, basic: 1 }
        return qualityOrder[b.quality] - qualityOrder[a.quality]
      })
      break
      
    case 'speed':
      filtered = filtered.sort((a, b) => {
        const speedOrder = { fast: 3, medium: 2, slow: 1 }
        return speedOrder[b.speed] - speedOrder[a.speed]
      })
      break
      
    case 'privacy':
      filtered = filtered.sort((a, b) => {
        const privacyOrder = { high: 3, medium: 2, low: 1 }
        return privacyOrder[b.privacy] - privacyOrder[a.privacy]
      })
      break
      
    case 'simplicity':
      filtered = filtered.sort((a, b) => {
        const setupOrder = { easy: 3, medium: 2, advanced: 1 }
        return setupOrder[b.setup] - setupOrder[a.setup]
      })
      break
  }
  
  return filtered
}

export default AI_PROVIDERS 