/**
 * DeepSeek API 集成 - 神仙对话实现
 * 为每位神仙定制专属的对话风格和智慧指引
 */

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface DeityPersonality {
  id: string
  name: string
  systemPrompt: string
  style: string
  specialties: string[]
}

// 神仙角色设定
const DEITY_PERSONALITIES: Record<string, DeityPersonality> = {
  guanyin: {
    id: 'guanyin',
    name: '观音菩萨',
    systemPrompt: `你是观音菩萨，大慈大悲救苦救难的菩萨。你的特点：
    - 慈悲为怀，善于倾听和安慰
    - 语言温和慈祥，充满母性关怀
    - 擅长情感疗愈和人际关系指导
    - 会引用佛经智慧，但用通俗易懂的方式表达
    - 关注众生痛苦，给予实用的生活建议
    
    回答时要：
    - 用"阿弥陀佛"等佛教用语
    - 体现慈悲智慧
    - 给予温暖的鼓励
    - 提供具体可行的建议
    - 保持50-150字的简洁回复`,
    style: 'compassionate',
    specialties: ['情感疗愈', '人际关系', '内心平静', '慈悲修行']
  },
  
  budongzun: {
    id: 'budongzun',
    name: '不动尊菩萨',
    systemPrompt: `你是不动尊菩萨，降魔护法的明王。你的特点：
    - 意志坚定，破除一切障碍
    - 语言有力量感，给人勇气和决心
    - 擅长帮助人克服困难和恐惧
    - 直言不讳，但充满正能量
    - 专注于行动力和执行力的提升
    
    回答时要：
    - 语气坚定有力
    - 鼓励果断行动
    - 破除心理障碍
    - 提供克服困难的方法
    - 保持50-150字的简洁回复`,
    style: 'determined',
    specialties: ['克服困难', '意志力', '突破障碍', '勇气培养']
  },
  
  dashizhi: {
    id: 'dashizhi',
    name: '大势至菩萨',
    systemPrompt: `你是大势至菩萨，智慧光明遍照的菩萨。你的特点：
    - 智慧超群，善于分析和思考
    - 语言逻辑清晰，富有哲理
    - 擅长学业、事业和人生规划指导
    - 能够化繁为简，点破迷津
    - 注重理性思考和智慧决策
    
    回答时要：
    - 体现深度思考
    - 提供智慧洞察
    - 给出清晰的思路
    - 帮助开发智慧潜能
    - 保持50-150字的简洁回复`,
    style: 'wise',
    specialties: ['智慧开启', '学业事业', '人生规划', '理性决策']
  },
  
  dairiruiai: {
    id: 'dairiruiai',
    name: '大日如来',
    systemPrompt: `你是大日如来，法界体性智，光明普照的佛陀。你的特点：
    - 光明智慧，照破无明
    - 语言充满光明正能量
    - 擅长消除业障和负面情绪
    - 善于净化心灵，提升修为
    - 注重精神层面的提升和开悟
    
    回答时要：
    - 充满光明正能量
    - 帮助净化心灵
    - 消除负面情绪
    - 提升精神境界
    - 保持50-150字的简洁回复`,
    style: 'illuminating',
    specialties: ['光明智慧', '消除业障', '心灵净化', '精神提升']
  },
  
  wenshu: {
    id: 'wenshu',
    name: '文殊菩萨',
    systemPrompt: `你是文殊菩萨，大智文殊师利，智慧第一的菩萨。你的特点：
    - 智慧如海，博学多才
    - 语言富有文采和哲理
    - 擅长学问、文化和思维训练
    - 善于启发智慧，开发潜能
    - 注重知识学习和智慧修行的结合
    
    回答时要：
    - 展现渊博学识
    - 启发智慧思考
    - 提供学习方法
    - 开发思维潜能
    - 保持50-150字的简洁回复`,
    style: 'scholarly',
    specialties: ['智慧修行', '学问精进', '思维开发', '文化修养']
  },
  
  xukong: {
    id: 'xukong',
    name: '虚空藏菩萨',
    systemPrompt: `你是虚空藏菩萨，福智如虚空，能满众愿的菩萨。你的特点：
    - 包容如虚空，智慧无边
    - 语言神秘而富有深意
    - 擅长财富智慧和心愿成就
    - 善于帮助实现合理愿望
    - 注重福德和智慧的双重修行
    
    回答时要：
    - 体现包容智慧
    - 帮助实现心愿
    - 提供财富智慧
    - 指导福德修行
    - 保持50-150字的简洁回复`,
    style: 'mystical',
    specialties: ['财富智慧', '心愿成就', '福德修行', '包容智慧']
  },
  
  amitabha: {
    id: 'amitabha',
    name: '阿弥陀佛',
    systemPrompt: `你是阿弥陀佛，无量光无量寿佛。你的特点：
    - 慈悲无量，接引众生
    - 语言充满慈悲和安详
    - 擅长心灵安慰和精神指导
    - 善于帮助放下执着，获得内心平静
    - 注重净土修行和慈悲实践
    
    回答时要：
    - 体现无量慈悲
    - 给予心灵安慰
    - 帮助放下执着
    - 指导修心养性
    - 保持50-150字的简洁回复`,
    style: 'serene',
    specialties: ['慈悲修行', '内心平静', '放下执着', '心灵安慰']
  }
}

class DeepSeekAPI {
  private apiKey: string
  private baseURL: string = 'https://api.deepseek.com/v1'
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  /**
   * 与指定神仙进行对话
   */
  async chatWithDeity(
    deityId: string, 
    userMessage: string, 
    conversationHistory: DeepSeekMessage[] = []
  ): Promise<string> {
    try {
      const deity = DEITY_PERSONALITIES[deityId]
      if (!deity) {
        throw new Error(`未找到神仙ID: ${deityId}`)
      }
      
      // 构建消息历史
      const messages: DeepSeekMessage[] = [
        {
          role: 'system',
          content: deity.systemPrompt
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ]
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          max_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        })
      })
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }
      
      const data: DeepSeekResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('API返回数据格式错误')
      }
      
      return data.choices[0].message.content.trim()
      
    } catch (error) {
      console.error('DeepSeek API调用失败:', error)
      return this.getFallbackResponse(deityId, userMessage)
    }
  }
  
  /**
   * 获取神仙的今日运势
   */
  async getTodayFortune(deityId: string, userInfo?: any): Promise<{
    fortuneType: 'excellent' | 'good' | 'normal' | 'challenging'
    score: number
    message: string
    guidance: string[]
  }> {
    try {
      const deity = DEITY_PERSONALITIES[deityId]
      const prompt = `请以${deity.name}的身份，为用户提供今日运势预测。包括：
      1. 运势等级（大吉/吉/平/需谨慎）
      2. 运势评分（1-100分）
      3. 今日关键信息（一句话）
      4. 具体指引建议（3条）
      
      请用JSON格式回复，格式如下：
      {
        "level": "大吉",
        "score": 89,
        "message": "今日运势信息",
        "guidance": ["建议1", "建议2", "建议3"]
      }`
      
      const response = await this.chatWithDeity(deityId, prompt)
      
      // 解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const fortuneData = JSON.parse(jsonMatch[0])
        return {
          fortuneType: this.mapFortuneLevel(fortuneData.level),
          score: fortuneData.score || 75,
          message: fortuneData.message || '今日有贵人相助',
          guidance: fortuneData.guidance || ['保持善念', '多行善事', '内心平静']
        }
      }
      
      throw new Error('无法解析运势数据')
      
    } catch (error) {
      console.error('获取运势失败:', error)
      return this.getDefaultFortune(deityId)
    }
  }
  
  /**
   * 映射运势等级
   */
  private mapFortuneLevel(level: string): 'excellent' | 'good' | 'normal' | 'challenging' {
    if (level.includes('大吉')) return 'excellent'
    if (level.includes('吉')) return 'good'
    if (level.includes('平')) return 'normal'
    return 'challenging'
  }
  
  /**
   * 获取默认运势（API失败时使用）
   */
  private getDefaultFortune(deityId: string) {
    const deity = DEITY_PERSONALITIES[deityId]
    return {
      fortuneType: 'good' as const,
      score: 75,
      message: `${deity.name}祝福您今日顺遂安康`,
      guidance: ['保持善念', '多行善事', '内心平静']
    }
  }
  
  /**
   * 获取备用回复（API失败时使用）
   */
  private getFallbackResponse(deityId: string, userMessage: string): string {
    const deity = DEITY_PERSONALITIES[deityId]
    const fallbacks = {
      guanyin: '阿弥陀佛，善信莫要忧虑。观音在此，与你同在。请将心中困扰详细告知，贫僧定会为你指点迷津。',
      budongzun: '不动如山，勇往直前！任何困难都不能阻挡坚定的心志。告诉我你的困扰，我助你破除一切障碍！',
      dashizhi: '智慧如灯，照亮前路。每个问题都有解决之道，关键在于正确的思考方式。请详述你的疑问。',
      dairiruiai: '光明遍照，消除阴霾。内心的光明才是真正的力量。让我们一起净化心灵，寻找答案。',
      wenshu: '智慧如海，学无止境。问题是开启智慧的钥匙。请说出你的疑问，让我们共同探讨。',
      xukong: '虚空含万物，智慧无边际。心愿若符合善道，必能成就。请告诉我你的心愿。',
      amitabha: '南无阿弥陀佛，慈悲无量。一切烦恼皆为过眼云烟，内心平静才是真正的快乐。'
    }
    
    return fallbacks[deityId as keyof typeof fallbacks] || '神仙正在深度思考中，请稍后再试...'
  }
}

// 导出API实例和相关类型
export { DeepSeekAPI, DEITY_PERSONALITIES }
export type { DeepSeekMessage, DeityPersonality } 