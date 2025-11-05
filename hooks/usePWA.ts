import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface PWAActions {
  installApp: () => Promise<void>;
  dismissInstall: (permanent?: boolean) => void;
  checkForUpdates: () => void;
  reloadApp: () => void;
}

export function usePWA(): PWAState & PWAActions {
  const [isInstallable, setIsInstallable] = useState(() => {
    // 初始化时检查是否永久关闭
    const permanentlyDismissed = localStorage.getItem('pwa-install-permanently-dismissed');
    return permanentlyDismissed !== 'true';
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // 检测是否已安装为PWA
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstalled);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstalled);
    };
  }, []);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 监听安装提示事件
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();

      // 检查是否永久关闭
      const permanentlyDismissed = localStorage.getItem('pwa-install-permanently-dismissed');
      if (permanentlyDismissed === 'true') {
        return;
      }

      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Service Worker 注册和更新检测
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW 注册成功:', registration);

          // 检查更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setHasUpdate(true);
                }
              });
            }
          });

          // 定期检查更新
          setInterval(() => {
            registration.update();
          }, 60000); // 每分钟检查一次
        })
        .catch((error) => {
          console.error('SW 注册失败:', error);
        });

      // 监听 SW 消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          setHasUpdate(true);
        }
      });
    }
  }, []);

  // 安装应用
  const installApp = useCallback(async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('用户接受了安装提示');
      } else {
        console.log('用户拒绝了安装提示');
      }

      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('安装失败:', error);
    }
  }, [installPrompt]);

  // 拒绝安装
  const dismissInstall = useCallback((permanent = false) => {
    setIsInstallable(false);
    setInstallPrompt(null);

    if (permanent) {
      // 永久关闭
      localStorage.setItem('pwa-install-permanently-dismissed', 'true');
    } else {
      // 记录用户拒绝，24小时内不再显示
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  }, []);

  // 检查更新
  const checkForUpdates = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
    }
  }, []);

  // 重新加载应用（应用更新）
  const reloadApp = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, []);

  // 检查是否应该显示安装提示
  useEffect(() => {
    // 检查是否永久关闭
    const permanentlyDismissed = localStorage.getItem('pwa-install-permanently-dismissed');
    if (permanentlyDismissed === 'true') {
      setIsInstallable(false);
      return;
    }

    // 检查24小时临时关闭
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        setIsInstallable(false);
      }
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    hasUpdate,
    installPrompt,
    installApp,
    dismissInstall,
    checkForUpdates,
    reloadApp
  };
}