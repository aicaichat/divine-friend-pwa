// 🔔 推送通知服务
// 负责管理PWA的推送通知功能

export interface NotificationSettings {
  enabled: boolean;
  dailyFortune: boolean;
  practiceReminder: boolean;
  braceletEnergy: boolean;
  chatMessages: boolean;
  weeklyReport: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM格式
    endTime: string;   // HH:MM格式
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  sound: boolean;
  vibration: boolean;
}

export interface NotificationPreference {
  type: keyof Omit<NotificationSettings, 'enabled' | 'quietHours' | 'frequency' | 'sound' | 'vibration'>;
  title: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
}

// 默认通知设置
export const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  dailyFortune: true,
  practiceReminder: true,
  braceletEnergy: true,
  chatMessages: false,
  weeklyReport: true,
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '08:00'
  },
  frequency: 'daily',
  sound: true,
  vibration: true
};

// 通知类型配置
export const notificationPreferences: NotificationPreference[] = [
  {
    type: 'dailyFortune',
    title: '每日运势',
    description: '每天早上8点推送您的专属运势指引',
    icon: '🌅',
    defaultEnabled: true
  },
  {
    type: 'practiceReminder',
    title: '修行提醒',
    description: '提醒您进行经文诵读和冥想练习',
    icon: '🧘',
    defaultEnabled: true
  },
  {
    type: 'braceletEnergy',
    title: '手串能量',
    description: '当手串能量不足时提醒您充能',
    icon: '📿',
    defaultEnabled: true
  },
  {
    type: 'chatMessages',
    title: '神仙消息',
    description: '收到新的神仙回复时通知您',
    icon: '💬',
    defaultEnabled: false
  },
  {
    type: 'weeklyReport',
    title: '修行报告',
    description: '每周日推送您的修行进度总结',
    icon: '📊',
    defaultEnabled: true
  }
];

class NotificationService {
  private settings: NotificationSettings;
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.settings = this.loadSettings();
    this.init();
  }

  // 初始化通知服务
  private async init(): Promise<void> {
    try {
      // 检查浏览器支持
      if (!('Notification' in window)) {
        console.warn('此浏览器不支持桌面通知');
        return;
      }

      if (!('serviceWorker' in navigator)) {
        console.warn('此浏览器不支持Service Worker');
        return;
      }

      // 获取当前权限状态
      this.permission = Notification.permission;

      // 注册Service Worker
      await this.registerServiceWorker();

      console.log('✅ 通知服务初始化成功');
    } catch (error) {
      console.error('❌ 通知服务初始化失败:', error);
    }
  }

  // 注册Service Worker
  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker 注册成功:', this.registration);
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
    }
  }

  // 请求通知权限
  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!('Notification' in window)) {
        throw new Error('浏览器不支持通知功能');
      }

      if (this.permission === 'granted') {
        return 'granted';
      }

      if (this.permission === 'denied') {
        throw new Error('通知权限已被拒绝，请在浏览器设置中手动开启');
      }

      // 请求权限
      this.permission = await Notification.requestPermission();
      
      if (this.permission === 'granted') {
        // 权限获取成功，启用通知
        this.updateSettings({ enabled: true });
        
        // 发送欢迎通知
        await this.sendWelcomeNotification();
      }

      return this.permission;
    } catch (error) {
      console.error('请求通知权限失败:', error);
      throw error;
    }
  }

  // 发送欢迎通知
  private async sendWelcomeNotification(): Promise<void> {
    try {
      await this.showNotification({
        title: '🙏 神仙朋友',
        body: '通知已开启！我们会在合适的时间为您推送修行提醒和运势指引。',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'welcome',
        renotify: false,
        silent: false
      });
    } catch (error) {
      console.error('发送欢迎通知失败:', error);
    }
  }

  // 显示通知
  async showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    renotify?: boolean;
    silent?: boolean;
    data?: any;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }): Promise<void> {
    try {
      if (this.permission !== 'granted' || !this.settings.enabled) {
        console.log('通知权限未授予或已禁用');
        return;
      }

      // 检查勿扰时间
      if (this.isInQuietHours()) {
        console.log('当前为勿扰时间，跳过通知');
        return;
      }

      // 构建通知选项
      const notificationOptions: any = {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        silent: options.silent || !this.settings.sound,
        data: options.data,
        actions: options.actions,
        vibrate: this.settings.vibration ? [200, 100, 200] : undefined,
        requireInteraction: false,
        timestamp: Date.now()
      };

      if (this.registration) {
        // 使用Service Worker显示通知
        await this.registration.showNotification(options.title, notificationOptions);
      } else {
        // 降级到浏览器原生通知
        new Notification(options.title, notificationOptions);
      }

      console.log('✅ 通知发送成功:', options.title);
    } catch (error) {
      console.error('❌ 发送通知失败:', error);
    }
  }

  // 检查是否在勿扰时间内
  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.settings.quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // 处理跨日情况（如22:00-08:00）
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  // 发送每日运势通知
  async sendDailyFortuneNotification(fortune: {
    overallScore: number;
    deity: string;
    guidance: string;
  }): Promise<void> {
    if (!this.settings.dailyFortune) return;

    const scoreEmoji = fortune.overallScore >= 90 ? '🌟' : 
                     fortune.overallScore >= 70 ? '✨' : '💫';

    await this.showNotification({
      title: `${scoreEmoji} 今日运势 ${fortune.overallScore}分`,
      body: `${fortune.deity}为您送来指引：${fortune.guidance.slice(0, 50)}...`,
      icon: '/favicon.ico',
      tag: 'daily-fortune',
      actions: [
        {
          action: 'view-fortune',
          title: '查看详情'
        },
        {
          action: 'dismiss',
          title: '稍后查看'
        }
      ],
      data: {
        type: 'daily-fortune',
        fortune
      }
    });
  }

  // 发送修行提醒通知
  async sendPracticeReminderNotification(): Promise<void> {
    if (!this.settings.practiceReminder) return;

    const reminders = [
      '🧘 今天还没有诵读经文呢，来一起修行吧',
      '📿 手串静静等待着您的修行',
      '🌸 片刻宁静，能带来内心的平和',
      '✨ 每一次修行，都是心灵的净化',
      '🙏 愿您在修行中找到内心的安宁'
    ];

    const randomReminder = reminders[Math.floor(Math.random() * reminders.length)];

    await this.showNotification({
      title: '修行时间到了',
      body: randomReminder,
      icon: '/favicon.ico',
      tag: 'practice-reminder',
      actions: [
        {
          action: 'start-practice',
          title: '开始修行'
        },
        {
          action: 'remind-later',
          title: '稍后提醒'
        }
      ],
      data: {
        type: 'practice-reminder'
      }
    });
  }

  // 发送手串能量提醒
  async sendBraceletEnergyNotification(energyLevel: number): Promise<void> {
    if (!this.settings.braceletEnergy || energyLevel > 30) return;

    const emoji = energyLevel < 10 ? '🔴' : energyLevel < 20 ? '🟡' : '🟠';

    await this.showNotification({
      title: `${emoji} 手串能量不足`,
      body: `您的法宝手串能量剩余${energyLevel}%，建议进行充能修行`,
      icon: '/favicon.ico',
      tag: 'bracelet-energy',
      actions: [
        {
          action: 'charge-bracelet',
          title: '立即充能'
        },
        {
          action: 'view-bracelet',
          title: '查看手串'
        }
      ],
      data: {
        type: 'bracelet-energy',
        energyLevel
      }
    });
  }

  // 发送聊天消息通知
  async sendChatMessageNotification(message: {
    sender: string;
    content: string;
  }): Promise<void> {
    if (!this.settings.chatMessages) return;

    await this.showNotification({
      title: `💬 ${message.sender}`,
      body: message.content.length > 50 ? 
            `${message.content.slice(0, 50)}...` : 
            message.content,
      icon: '/favicon.ico',
      tag: 'chat-message',
      actions: [
        {
          action: 'reply',
          title: '回复'
        },
        {
          action: 'view-chat',
          title: '查看对话'
        }
      ],
      data: {
        type: 'chat-message',
        message
      }
    });
  }

  // 发送周报通知
  async sendWeeklyReportNotification(report: {
    practiceCount: number;
    totalTime: number;
    merit: number;
  }): Promise<void> {
    if (!this.settings.weeklyReport) return;

    await this.showNotification({
      title: '📊 本周修行报告',
      body: `修行${report.practiceCount}次，累计${Math.round(report.totalTime/60)}分钟，获得${report.merit}功德`,
      icon: '/favicon.ico',
      tag: 'weekly-report',
      actions: [
        {
          action: 'view-report',
          title: '查看详情'
        },
        {
          action: 'share-achievement',
          title: '分享成就'
        }
      ],
      data: {
        type: 'weekly-report',
        report
      }
    });
  }

  // 更新通知设置
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // 如果禁用了通知，清除所有待发送的通知
    if (newSettings.enabled === false) {
      this.clearAllNotifications();
    }
    
    console.log('✅ 通知设置已更新:', this.settings);
  }

  // 获取当前设置
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // 获取权限状态
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // 清除所有通知
  async clearAllNotifications(): Promise<void> {
    try {
      if (this.registration) {
        const notifications = await this.registration.getNotifications();
        notifications.forEach(notification => notification.close());
      }
      console.log('✅ 已清除所有通知');
    } catch (error) {
      console.error('❌ 清除通知失败:', error);
    }
  }

  // 保存设置到本地存储
  private saveSettings(): void {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('保存通知设置失败:', error);
    }
  }

  // 从本地存储加载设置
  private loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultNotificationSettings, ...parsed };
      }
    } catch (error) {
      console.error('加载通知设置失败:', error);
    }
    return { ...defaultNotificationSettings };
  }

  // 测试通知功能
  async testNotification(): Promise<void> {
    await this.showNotification({
      title: '🔔 通知测试',
      body: '恭喜！您的通知功能正常工作。',
      icon: '/favicon.ico',
      tag: 'test-notification',
      data: {
        type: 'test'
      }
    });
  }

  // 调度定时通知
  scheduleNotifications(): void {
    // 清除之前的定时器
    this.clearScheduledNotifications();

    if (!this.settings.enabled) return;

    // 每日运势通知（早上8点）
    if (this.settings.dailyFortune) {
      this.scheduleDaily(8, 0, () => {
        // 这里应该调用获取今日运势的API
        this.sendDailyFortuneNotification({
          overallScore: 85,
          deity: '观音菩萨',
          guidance: '今日宜修身养性，多行善事，将有意想不到的收获。'
        });
      });
    }

    // 修行提醒（根据用户习惯，可以是多个时间点）
    if (this.settings.practiceReminder) {
      // 早晨提醒（9点）
      this.scheduleDaily(9, 0, () => {
        this.sendPracticeReminderNotification();
      });

      // 晚间提醒（19点）
      this.scheduleDaily(19, 0, () => {
        this.sendPracticeReminderNotification();
      });
    }

    // 周报通知（周日晚上8点）
    if (this.settings.weeklyReport) {
      this.scheduleWeekly(0, 20, 0, () => {
        // 这里应该调用获取周报数据的API
        this.sendWeeklyReportNotification({
          practiceCount: 12,
          totalTime: 360, // 分钟
          merit: 24
        });
      });
    }
  }

  // 定时器管理
  private timers: Set<number> = new Set();

  private scheduleDaily(hour: number, minute: number, callback: () => void): void {
    const scheduleNext = () => {
      const now = new Date();
      const scheduled = new Date();
      scheduled.setHours(hour, minute, 0, 0);

      // 如果今天的时间已过，安排到明天
      if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
      }

      const timeout = scheduled.getTime() - now.getTime();
      const timer = window.setTimeout(() => {
        callback();
        scheduleNext(); // 安排下次执行
      }, timeout);

      this.timers.add(timer);
    };

    scheduleNext();
  }

  private scheduleWeekly(dayOfWeek: number, hour: number, minute: number, callback: () => void): void {
    const scheduleNext = () => {
      const now = new Date();
      const scheduled = new Date();
      
      // 设置到指定星期几
      const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
      scheduled.setDate(now.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
      scheduled.setHours(hour, minute, 0, 0);

      // 如果是今天但时间已过，推到下周
      if (daysUntilTarget === 0 && scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 7);
      }

      const timeout = scheduled.getTime() - now.getTime();
      const timer = window.setTimeout(() => {
        callback();
        scheduleNext(); // 安排下次执行
      }, timeout);

      this.timers.add(timer);
    };

    scheduleNext();
  }

  private clearScheduledNotifications(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  // 销毁服务
  destroy(): void {
    this.clearScheduledNotifications();
    this.clearAllNotifications();
  }
}

// 创建单例实例
export const notificationService = new NotificationService();

// 默认导出
export default notificationService; 