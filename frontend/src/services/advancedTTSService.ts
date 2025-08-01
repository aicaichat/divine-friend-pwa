/**
 * 高级TTS语音服务
 * 支持多种语音引擎，大幅提升经文阅读的自然度
 */

interface TTSVoiceConfig {
  engine: 'web-speech' | 'azure' | 'google' | 'baidu' | 'mock-premium';
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
  emphasis?: 'strong' | 'moderate' | 'reduced';
  pauseLength?: 'short' | 'medium' | 'long';
}

interface ScriptureVoiceProfile {
  type: 'classical' | 'modern' | 'meditative' | 'ceremonial';
  gender: 'male' | 'female';
  age: 'young' | 'middle' | 'elderly';
  tone: 'peaceful' | 'solemn' | 'warm' | 'authoritative';
}

class AdvancedTTSService {
  private config: TTSVoiceConfig;
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private pauseQueue: Array<{ text: string; duration: number }> = [];
  
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.config = {
      engine: 'web-speech',
      voice: '',
      rate: 0.7, // 经文阅读稍慢一些
      pitch: 1.0,
      volume: 0.9,
      language: 'zh-CN',
      emphasis: 'moderate',
      pauseLength: 'medium'
    };
  }

  /**
   * 获取最佳中文语音
   */
  private getBestChineseVoice(): SpeechSynthesisVoice | null {
    const voices = this.synthesis.getVoices();
    
    // 优先级排序的中文语音
    const preferredVoices = [
      // 高质量中文语音
      'Microsoft YaoYao - Chinese (Simplified, PRC)',
      'Microsoft HuiHui - Chinese (Simplified, PRC)', 
      'Microsoft Kangkang - Chinese (Simplified, PRC)',
      'Google 普通话（中国大陆）',
      'Ting-Ting (Enhanced)', // macOS
      'Sin-ji (Enhanced)', // macOS
      'Mei-Jia (Enhanced)', // macOS
      // 标准中文语音
      'Microsoft Yaoyao Desktop - Chinese (Simplified, PRC)',
      'Microsoft Huihui Desktop - Chinese (Simplified, PRC)',
      'Ting-Ting',
      'Sin-ji',
      'Mei-Jia',
      // 通用中文语音
      'Chinese (China)',
      'Chinese Female',
      'Chinese Male'
    ];

    // 查找最佳匹配
    for (const preferredName of preferredVoices) {
      const voice = voices.find(v => 
        v.name.includes(preferredName) || 
        v.name === preferredName
      );
      if (voice) return voice;
    }

    // 后备：任何中文语音
    const chineseVoice = voices.find(v => 
      v.lang.includes('zh') || 
      v.name.includes('Chinese') ||
      v.name.includes('中文')
    );

    return chineseVoice || null;
  }

  /**
   * 根据经文类型选择合适的语音配置
   */
  private getScriptureVoiceConfig(scriptureType: string): Partial<TTSVoiceConfig> {
    const configs = {
      'heart-sutra': {
        rate: 0.6, // 心经读得慢一些，更庄重
        pitch: 0.9,
        emphasis: 'moderate' as const,
        pauseLength: 'long' as const
      },
      'diamond-sutra': {
        rate: 0.65,
        pitch: 0.95,
        emphasis: 'moderate' as const,
        pauseLength: 'medium' as const
      },
      'great-compassion-mantra': {
        rate: 0.5, // 咒语读得很慢
        pitch: 0.85,
        emphasis: 'strong' as const,
        pauseLength: 'long' as const
      },
      'tao-te-ching': {
        rate: 0.7,
        pitch: 1.0,
        emphasis: 'reduced' as const,
        pauseLength: 'medium' as const
      },
      'default': {
        rate: 0.7,
        pitch: 1.0,
        emphasis: 'moderate' as const,
        pauseLength: 'medium' as const
      }
    };

    return configs[scriptureType as keyof typeof configs] || configs.default;
  }

  /**
   * 智能文本预处理 - 为经文添加合适的停顿和语调
   */
  private preprocessScriptureText(text: string, scriptureType: string): string {
    let processed = text;

    // 标点符号后添加停顿
    processed = processed.replace(/，/g, '，<break time="300ms"/>');
    processed = processed.replace(/。/g, '。<break time="600ms"/>');
    processed = processed.replace(/；/g, '；<break time="400ms"/>');
    processed = processed.replace(/！/g, '！<break time="500ms"/>');
    processed = processed.replace(/？/g, '？<break time="500ms"/>');

    // 特殊经文处理
    if (scriptureType === 'heart-sutra') {
      // 心经的关键词语加重音
      processed = processed.replace(/般若波罗蜜多/g, '<emphasis level="moderate">般若波罗蜜多</emphasis>');
      processed = processed.replace(/色即是空/g, '<emphasis level="strong">色即是空</emphasis>');
      processed = processed.replace(/空即是色/g, '<emphasis level="strong">空即是色</emphasis>');
    }

    if (scriptureType === 'great-compassion-mantra') {
      // 大悲咒每句后长停顿
      processed = processed.replace(/\n/g, '<break time="800ms"/>');
    }

    // 移除多余空格和换行
    processed = processed.replace(/\s+/g, ' ').trim();

    return processed;
  }

  /**
   * 创建高质量语音朗读
   */
  private createEnhancedUtterance(text: string, scriptureType: string = 'default'): SpeechSynthesisUtterance {
    const processedText = this.preprocessScriptureText(text, scriptureType);
    const scriptureConfig = this.getScriptureVoiceConfig(scriptureType);
    
    const utterance = new SpeechSynthesisUtterance(processedText);
    
    // 应用配置
    const finalConfig = { ...this.config, ...scriptureConfig };
    
    utterance.rate = finalConfig.rate;
    utterance.pitch = finalConfig.pitch;
    utterance.volume = finalConfig.volume;
    utterance.lang = finalConfig.language;
    
    // 设置最佳语音
    const bestVoice = this.getBestChineseVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log(`🎵 使用语音: ${bestVoice.name}`);
    }

    return utterance;
  }

  /**
   * 播放经文段落 - 增强版
   */
  async speakScriptureParagraph(
    text: string, 
    scriptureType: string = 'default',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 停止当前播放
        this.stop();

        const utterance = this.createEnhancedUtterance(text, scriptureType);
        
        utterance.onstart = () => {
          this.isPlaying = true;
          this.currentUtterance = utterance;
          onStart?.();
          console.log(`🎵 开始朗读: ${text.substring(0, 20)}...`);
        };

        utterance.onend = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
          onEnd?.();
          console.log(`✅ 朗读完成`);
          resolve();
        };

        utterance.onerror = (event) => {
          this.isPlaying = false;
          this.currentUtterance = null;
          const error = `语音播放错误: ${event.error}`;
          console.error('❌', error);
          onError?.(error);
          reject(new Error(error));
        };

        // 播放前短暂延迟，确保语音引擎准备就绪
        setTimeout(() => {
          this.synthesis.speak(utterance);
        }, 100);

      } catch (error) {
        const errorMsg = `TTS服务错误: ${error}`;
        console.error('❌', errorMsg);
        onError?.(errorMsg);
        reject(new Error(errorMsg));
      }
    });
  }

  /**
   * 连续播放多个段落 - 经文专用
   */
  async speakScriptureSequence(
    paragraphs: string[],
    scriptureType: string = 'default',
    onProgress?: (current: number, total: number) => void,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (paragraphs.length === 0) {
      onComplete?.();
      return;
    }

    try {
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        
        // 跳过空段落
        if (!paragraph.trim()) continue;

        onProgress?.(i, paragraphs.length);

        await this.speakScriptureParagraph(paragraph, scriptureType);

        // 段落间停顿
        const pauseDuration = this.getPauseDuration();
        await this.pauseFor(pauseDuration);

        // 检查是否被停止
        if (!this.isPlaying) break;
      }

      onComplete?.();
    } catch (error) {
      const errorMsg = `序列播放错误: ${error}`;
      onError?.(errorMsg);
      throw error;
    }
  }

  /**
   * 获取停顿时长
   */
  private getPauseDuration(): number {
    const durations = {
      'short': 300,
      'medium': 600,
      'long': 1000
    };
    return durations[this.config.pauseLength || 'medium'];
  }

  /**
   * 停顿指定时长
   */
  private pauseFor(duration: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  /**
   * 暂停播放
   */
  pausePlayback(): void {
    if (this.synthesis && this.isPlaying) {
      this.synthesis.pause();
    }
  }

  /**
   * 恢复播放
   */
  resume(): void {
    if (this.synthesis && this.currentUtterance) {
      this.synthesis.resume();
    }
  }

  /**
   * 设置语音配置
   */
  setConfig(config: Partial<TTSVoiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): TTSVoiceConfig {
    return { ...this.config };
  }

  /**
   * 获取可用语音列表
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices().filter(voice => 
      voice.lang.includes('zh') || 
      voice.name.includes('Chinese') ||
      voice.name.includes('中文')
    );
  }

  /**
   * 检查播放状态
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying && this.synthesis.speaking;
  }

  /**
   * 语音质量检测
   */
  async testVoiceQuality(): Promise<{voice: string; quality: 'excellent' | 'good' | 'basic' | 'poor'}> {
    const bestVoice = this.getBestChineseVoice();
    
    if (!bestVoice) {
      return { voice: '无中文语音', quality: 'poor' };
    }

    const voiceName = bestVoice.name;
    let quality: 'excellent' | 'good' | 'basic' | 'poor' = 'basic';

    // 根据语音名称判断质量
    if (voiceName.includes('Enhanced') || voiceName.includes('Premium')) {
      quality = 'excellent';
    } else if (voiceName.includes('Microsoft') && voiceName.includes('Desktop')) {
      quality = 'good';
    } else if (voiceName.includes('Google') || voiceName.includes('Microsoft')) {
      quality = 'good';
    } else if (voiceName.includes('Ting-Ting') || voiceName.includes('Sin-ji')) {
      quality = 'good';
    }

    return { voice: voiceName, quality };
  }
}

// 导出单例实例
export const advancedTTSService = new AdvancedTTSService();
export default AdvancedTTSService; 