export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.checkIfInstalled();
    this.setupInstallListener();
  }

  private checkIfInstalled(): void {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('App is installed as PWA');
    }
  }

  private setupInstallListener(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('Install prompt available');
      this.notifyInstallPromptAvailable();
    });

    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      this.isInstalled = true;
      this.deferredPrompt = null;
    });
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  async install(): Promise<'accepted' | 'dismissed'> {
    if (!this.deferredPrompt) {
      throw new Error('Installation is not available');
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return outcome;
    } catch (error) {
      console.error('Installation error:', error);
      throw error;
    }
  }

  isInstalledAsApp(): boolean {
    return this.isInstalled;
  }

  private notifyInstallPromptAvailable(): void {
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Workers not supported');
    }

    return navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });
  }

  async unregisterServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    return true;
  }

  getInstallationInstructions(): string {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('android')) {
      return `
🤖 **Android Installation:**
1. Tap the menu icon (⋮) in your browser
2. Select "Install app" or "Add to Home screen"
3. Confirm the installation
4. App will appear on your home screen!
      `.trim();
    }

    if (ua.includes('iphone') || ua.includes('ipad')) {
      return `
🍎 **iOS Installation:**
1. Tap the Share button (⬆️) at the bottom
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm
4. App will appear on your home screen!
      `.trim();
    }

    return `
💻 **Desktop Installation:**
1. Look for the install icon in your browser's address bar
2. Click the install button
3. Confirm the installation
4. App will be added to your applications!
      `.trim();
  }
}

export const pwaService = new PWAService();
