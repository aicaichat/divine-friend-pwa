// 通知功能测试服务
export class NotificationTestService {
  static async testBasicNotification(): Promise<boolean> {
    try {
      // 检查浏览器支持
      if (!('Notification' in window)) {
        console.warn('浏览器不支持通知');
        return false;
      }

      // 请求权限
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('用户拒绝了通知权限');
        return false;
      }

      // 发送测试通知
      const notification = new Notification('神仙朋友测试', {
        body: '推送通知功能测试成功！',
        icon: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      } as NotificationOptions);

      // 3秒后自动关闭
      setTimeout(() => notification.close(), 3000);

      console.log('✅ 基础通知测试成功');
      return true;
    } catch (error) {
      console.error('❌ 基础通知测试失败:', error);
      return false;
    }
  }

  static async testServiceWorkerNotification(): Promise<boolean> {
    try {
      // 检查 Service Worker 支持
      if (!('serviceWorker' in navigator)) {
        console.warn('浏览器不支持 Service Worker');
        return false;
      }

      // 获取 Service Worker 注册
      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        console.warn('Service Worker 未注册');
        return false;
      }

      // 检查推送通知支持
      if (!('PushManager' in window)) {
        console.warn('浏览器不支持推送通知');
        return false;
      }

      // 请求通知权限
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('用户拒绝了通知权限');
        return false;
      }

      // 通过 Service Worker 发送通知
      await registration.showNotification('神仙朋友 SW 测试', {
        body: 'Service Worker 推送通知测试成功！',
        icon: '/favicon.ico',
        tag: 'sw-test-notification',
        data: {
          url: '/today',
          timestamp: Date.now()
        },
        requireInteraction: false
      } as any);

      console.log('✅ Service Worker 通知测试成功');
      return true;
    } catch (error) {
      console.error('❌ Service Worker 通知测试失败:', error);
      return false;
    }
  }

  static async testNotificationPermission(): Promise<string> {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  }

  static async runAllTests(): Promise<{ basic: boolean; serviceWorker: boolean; permission: string }> {
    const permission = await this.testNotificationPermission();
    
    if (permission === 'not-supported') {
      return { basic: false, serviceWorker: false, permission };
    }

    const basic = await this.testBasicNotification();
    const serviceWorker = await this.testServiceWorkerNotification();

    return { basic, serviceWorker, permission };
  }
} 