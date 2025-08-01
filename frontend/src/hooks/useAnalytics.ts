import { useEffect, useCallback } from 'react';

interface AnalyticsEvent {
  event: string;
  page?: string;
  action?: string;
  data?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

interface PageView {
  page: string;
  title: string;
  timestamp: number;
  sessionId: string;
  referrer?: string;
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private isInitialized = false;
  private isDevelopment = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isDevelopment = this.detectDevelopmentEnvironment();
    this.init();
  }

  private detectDevelopmentEnvironment(): boolean {
    // 检测开发环境
    return (
      // Vite 开发环境
      (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV) ||
      // 本地主机
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168.') ||
      // 端口号通常表示开发环境  
      window.location.port !== ''
    );
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private init() {
    if (this.isInitialized) return;
    
    // 初始化时记录会话开始
    this.trackEvent('session_start', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      environment: this.isDevelopment ? 'development' : 'production'
    });

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hide');
      } else {
        this.trackEvent('page_show');
      }
    });

    // 监听页面卸载
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end');
      this.sendData();
    });

    this.isInitialized = true;
  }

  trackEvent(event: string, data?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data
    };

    this.events.push(analyticsEvent);
    console.log('📊 Analytics Event:', analyticsEvent);

    // 实时发送重要事件
    if (['page_view', 'user_action', 'error'].includes(event)) {
      this.sendEvent(analyticsEvent);
    }
  }

  trackPageView(page: string, title: string) {
    const pageView: PageView = {
      page,
      title,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      referrer: document.referrer
    };

    this.pageViews.push(pageView);
    this.trackEvent('page_view', { page, title });
    
    console.log('📄 Page View:', pageView);
  }

  trackUserAction(action: string, data?: Record<string, any>) {
    this.trackEvent('user_action', { action, ...data });
  }

  trackError(error: Error, context?: string) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  private sendEvent(event: AnalyticsEvent) {
    console.log('🚀 Sending Analytics Event:', event);
    
    // 开发环境只打印日志，不发送到服务器
    if (this.isDevelopment) {
      console.log('🔧 Development Mode: Analytics event logged locally only');
      return;
    }
    
    // 生产环境发送到服务器
    this.sendToServer(event);
  }

  private sendToServer(event: AnalyticsEvent) {
    // 发送到你的分析API
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch(error => {
      // 静默处理错误，避免控制台噪音
      if (!this.isDevelopment) {
        console.warn('Analytics service unavailable:', error.message);
      }
    });
  }

  private sendData() {
    // 批量发送数据
    const data = {
      sessionId: this.sessionId,
      events: this.events,
      pageViews: this.pageViews,
      timestamp: Date.now()
    };

    console.log('📊 Session Analytics Data:', data);
    
    // 开发环境只打印日志，不发送到服务器
    if (this.isDevelopment) {
      console.log('🔧 Development Mode: Session data logged locally only');
      return;
    }
    
    // 生产环境发送到服务器
    fetch('/api/analytics/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch(error => {
      // 静默处理错误，避免控制台噪音
      console.warn('Analytics batch service unavailable:', error.message);
    });
  }

  getSessionData() {
    return {
      sessionId: this.sessionId,
      events: this.events,
      pageViews: this.pageViews,
      environment: this.isDevelopment ? 'development' : 'production'
    };
  }
}

// 全局分析服务实例
const analyticsService = new AnalyticsService();

export const useAnalytics = () => {
  const trackEvent = useCallback((event: string, data?: Record<string, any>) => {
    analyticsService.trackEvent(event, data);
  }, []);

  const trackPageView = useCallback((page: string, title: string) => {
    analyticsService.trackPageView(page, title);
  }, []);

  const trackUserAction = useCallback((action: string, data?: Record<string, any>) => {
    analyticsService.trackUserAction(action, data);
  }, []);

  const trackError = useCallback((error: Error, context?: string) => {
    analyticsService.trackError(error, context);
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackError,
    getSessionData: () => analyticsService.getSessionData()
  };
};

export default analyticsService; 