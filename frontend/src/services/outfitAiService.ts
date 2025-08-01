/**
 * AI智能穿衣推荐服务
 * 连接后端AI接口，提供智能穿衣建议
 */

export interface UserProfile {
  birthdate: string;  // ISO格式: "1990-05-15T08:30:00"
  name: string;
  gender: 'male' | 'female';
  birth_place?: string;
}

export interface UserPreferences {
  occasion?: string[];  // ["business", "casual", "formal"]
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  weather?: {
    temperature: number;
    condition: string;
  };
  style_preference?: string[];  // ["modern", "traditional", "minimalist"]
  color_preferences?: string[];  // ["avoid_red", "prefer_blue"]
}

export interface UserConstraints {
  budget_range?: [number, number];  // [100, 1000]
  avoid_colors?: string[];
  avoid_materials?: string[];
}

export interface OutfitRecommendationRequest {
  user_profile: UserProfile;
  target_date?: string;  // "2024-01-15"
  preferences?: UserPreferences;
  constraints?: UserConstraints;
}

export interface FortuneBoost {
  wealth: number;
  career: number;
  love: number;
  health: number;
}

export interface OutfitDetails {
  primary_colors: string[];
  secondary_colors?: string[];
  materials?: string[];
  accessories?: string[];
  style?: string;
}

export interface FiveElementsAnalysis {
  element_match: string;
  enhancement_theory: string;
  warning?: string;
}

export interface TimingAdvice {
  best_wear_time: string;
  optimal_activities: string[];
  avoid_activities?: string[];
}

export interface OutfitRecommendation {
  id: string;
  rank: number;
  confidence: number;  // 0.0-1.0
  theme: string;
  base_fortune_boost: FortuneBoost;
  outfit_details: OutfitDetails;
  five_elements_analysis: FiveElementsAnalysis;
  timing_advice: TimingAdvice;
}

export interface AIAnalysis {
  bazi_summary: {
    day_master: string;
    main_element: string;
    weak_element: string;
    strong_element: string;
  };
  daily_fortune: {
    overall_score: number;
    wealth_fortune: number;
    career_fortune: number;
    love_fortune: number;
    health_fortune: number;
  };
  recommendation_reason: string;
}

export interface OutfitRecommendationResponse {
  ai_analysis: AIAnalysis;
  recommendations: OutfitRecommendation[];
  meta: {
    calculation_time: string;
    ai_model_version: string;
    cache_expires: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface OutfitElements {
  colors: Record<string, string[]>;
  materials: Record<string, string[]>;
  styles: string[];
  occasions: string[];
}

export interface FortuneAnalysis {
  user_id: string;
  analysis_date: string;
  bazi_summary: {
    day_master: string;
    main_element: string;
    favorable_elements: string[];
    avoid_elements: string[];
  };
  daily_fortune: {
    overall_score: number;
    wealth_fortune: number;
    career_fortune: number;
    love_fortune: number;
    health_fortune: number;
  };
  element_strength: Record<string, number>;
}

class OutfitAIService {
  private baseURL: string;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  constructor() {
    // 默认使用本地开发环境，生产环境需要配置
    this.baseURL = 'http://localhost:5001';
  }

  /**
   * 获取AI智能穿衣推荐
   */
  async getOutfitRecommendations(
    request: OutfitRecommendationRequest
  ): Promise<OutfitRecommendationResponse> {
    try {
      // 检查缓存
      const cacheKey = this.generateCacheKey('outfit', request);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('🔄 使用缓存的穿衣推荐数据');
        return cached;
      }

      console.log('🤖 请求AI智能穿衣推荐...');
      
      const response = await fetch(`${this.baseURL}/api/ai/outfit-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<OutfitRecommendationResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '获取穿衣推荐失败');
      }

      // 缓存结果（1小时）
      this.setCache(cacheKey, result.data, 60 * 60 * 1000);

      console.log('✅ AI穿衣推荐获取成功');
      return result.data;

    } catch (error) {
      console.error('❌ AI穿衣推荐失败:', error);
      
      // 返回降级数据
      return this.getFallbackRecommendations(request);
    }
  }

  /**
   * 获取穿衣元素库
   */
  async getOutfitElements(): Promise<OutfitElements> {
    try {
      // 检查缓存
      const cacheKey = 'outfit_elements';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(`${this.baseURL}/api/ai/outfit-elements`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<OutfitElements> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '获取穿衣元素失败');
      }

      // 缓存结果（24小时）
      this.setCache(cacheKey, result.data, 24 * 60 * 60 * 1000);

      return result.data;

    } catch (error) {
      console.error('❌ 获取穿衣元素失败:', error);
      
      // 返回默认数据
      return this.getDefaultOutfitElements();
    }
  }

  /**
   * 获取用户运势分析
   */
  async getFortuneAnalysis(userId: string, date?: string): Promise<FortuneAnalysis> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const url = `${this.baseURL}/api/ai/fortune-analysis/${userId}?date=${targetDate}`;

      // 检查缓存
      const cacheKey = `fortune_${userId}_${targetDate}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<FortuneAnalysis> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '获取运势分析失败');
      }

      // 缓存结果（4小时）
      this.setCache(cacheKey, result.data, 4 * 60 * 60 * 1000);

      return result.data;

    } catch (error) {
      console.error('❌ 获取运势分析失败:', error);
      throw error;
    }
  }

  /**
   * 更新前端现有穿衣方案的真实加持效果
   */
  async updateOutfitBoosts(
    outfitRecommendations: any[],
    userProfile: UserProfile,
    targetDate?: string
  ): Promise<any[]> {
    try {
      const request: OutfitRecommendationRequest = {
        user_profile: userProfile,
        target_date: targetDate
      };

      const aiRecommendations = await this.getOutfitRecommendations(request);
      
      // 更新现有推荐的加持效果
      return outfitRecommendations.map(outfit => {
        // 查找对应的AI推荐
        const aiMatch = aiRecommendations.recommendations.find(
          ai => ai.theme === outfit.theme || this.isOutfitSimilar(outfit, ai)
        );

        if (aiMatch) {
          return {
            ...outfit,
            fortuneBoost: {
              wealth: Math.max(outfit.fortuneBoost.wealth, aiMatch.base_fortune_boost.wealth),
              career: Math.max(outfit.fortuneBoost.career, aiMatch.base_fortune_boost.career),
              love: Math.max(outfit.fortuneBoost.love, aiMatch.base_fortune_boost.love),
              health: Math.max(outfit.fortuneBoost.health, aiMatch.base_fortune_boost.health)
            },
            aiEnhanced: true,
            confidence: aiMatch.confidence,
            aiAnalysis: aiMatch.five_elements_analysis
          };
        }

        return outfit;
      });

    } catch (error) {
      console.error('❌ 更新穿衣加持效果失败:', error);
      return outfitRecommendations; // 返回原始数据
    }
  }

  /**
   * 检查后端API健康状态
   */
  async checkAPIHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        timeout: 5000 // 5秒超时
      } as any);

      if (response.ok) {
        const result = await response.json();
        return result.status === 'healthy';
      }

      return false;
    } catch (error) {
      console.warn('⚠️ API健康检查失败:', error);
      return false;
    }
  }

  // 私有方法

  private generateCacheKey(prefix: string, data: any): string {
    const keyData = JSON.stringify(data);
    return `${prefix}_${this.simpleHash(keyData)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  private isOutfitSimilar(outfit1: any, outfit2: any): boolean {
    // 简单的相似性检查逻辑
    const colors1 = outfit1.colors || [];
    const colors2 = outfit2.outfit_details?.primary_colors || [];
    
    return colors1.some((color: string) => 
      colors2.some((c: string) => c.includes(color) || color.includes(c))
    );
  }

  private getFallbackRecommendations(request: OutfitRecommendationRequest): OutfitRecommendationResponse {
    // 降级方案：基于用户性别和季节提供基础推荐
    const { gender } = request.user_profile;
    const season = request.preferences?.season || 'spring';

    const fallbackRec: OutfitRecommendation = {
      id: 'fallback_1',
      rank: 1,
      confidence: 0.6,
      theme: gender === 'male' ? '商务经典套装' : '优雅知性套装',
      base_fortune_boost: {
        wealth: 5,
        career: 8,
        love: 3,
        health: 5
      },
      outfit_details: {
        primary_colors: season === 'winter' ? ['深蓝色', '黑色'] : ['白色', '浅蓝色'],
        secondary_colors: ['银色'],
        materials: ['棉质', '羊毛'],
        accessories: ['简约配饰'],
        style: '商务休闲'
      },
      five_elements_analysis: {
        element_match: '基于传统五行理论',
        enhancement_theory: '选择和谐色彩组合',
        warning: '建议咨询专业命理师'
      },
      timing_advice: {
        best_wear_time: '09:00-17:00',
        optimal_activities: ['工作', '会议', '社交'],
        avoid_activities: ['重要决策']
      }
    };

    return {
      ai_analysis: {
        bazi_summary: {
          day_master: '未知',
          main_element: 'unknown',
          weak_element: 'unknown',
          strong_element: 'unknown'
        },
        daily_fortune: {
          overall_score: 75,
          wealth_fortune: 75,
          career_fortune: 80,
          love_fortune: 70,
          health_fortune: 75
        },
        recommendation_reason: '基于基础信息的通用推荐'
      },
      recommendations: [fallbackRec],
      meta: {
        calculation_time: new Date().toISOString(),
        ai_model_version: 'fallback-v1.0',
        cache_expires: new Date(Date.now() + 3600000).toISOString()
      }
    };
  }

  private getDefaultOutfitElements(): OutfitElements {
    return {
      colors: {
        wood: ['绿色', '青色', '蓝色'],
        fire: ['红色', '橙色', '紫色'],
        earth: ['黄色', '棕色', '土色'],
        metal: ['白色', '银色', '金色'],
        water: ['黑色', '深蓝色', '蓝色']
      },
      materials: {
        wood: ['棉质', '麻质', '天然纤维'],
        fire: ['丝绸', '亮面材质'],
        earth: ['羊毛', '厚实材质'],
        metal: ['金属装饰', '光泽材质'],
        water: ['流动面料', '柔软材质']
      },
      styles: ['商务精英', '休闲舒适', '时尚潮流', '古典雅致'],
      occasions: ['business', 'casual', 'formal', 'social']
    };
  }
}

// 创建单例实例
export const outfitAiService = new OutfitAIService();

// 导出默认实例
export default outfitAiService; 