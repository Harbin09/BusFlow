class NotificationService {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Notification.permission;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  async subscribeToPushNotifications(
    userId: string,
    role: 'STUDENT' | 'DRIVER' | 'ADMIN'
  ): Promise<PushSubscription | null> {
    if (!this.hasPermission()) {
      throw new Error('Notification permission denied');
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    // Check if VAPID key is configured
    const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn('VAPID_PUBLIC_KEY not configured, skipping push notifications');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey),
      });

      await this.sendSubscriptionToServer(subscription, userId, role);
      console.log('Push subscription successful');
      return subscription;
    } catch (error) {
      console.error('Push subscription error:', error);
      return null;
    }
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    }
  }

  showBrowserNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!this.hasPermission()) {
      return null;
    }

    try {
      return new Notification(title, {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%233b82f6" width="192" height="192"/><text x="50%" y="50%" font-size="100" fill="white" text-anchor="middle" dy=".3em" font-weight="bold">BF</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%233b82f6" width="192" height="192"/><text x="50%" y="50%" font-size="100" fill="white" text-anchor="middle" dy=".3em" font-weight="bold">BF</text></svg>',
        vibrate: [200, 100, 200],
        tag: 'busflow-notification',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  private async sendSubscriptionToServer(
    subscription: PushSubscription,
    userId: string,
    role: 'STUDENT' | 'DRIVER' | 'ADMIN'
  ): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          deviceToken: JSON.stringify(subscription),
          userId,
          role,
        }),
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService();
