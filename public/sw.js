const CACHE_NAME = 'sitemap-v1';
const STATIC_CACHE = 'sitemap-static-v1';
const DATA_CACHE = 'sitemap-data-v1';

// 需要缓存的静态资源
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] 预缓存静态文件');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] 安装完成');
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            console.log('[SW] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] 激活完成');
      return self.clients.claim();
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非HTTP请求
  if (!request.url.startsWith('http')) {
    return;
  }

  // 静态资源：Cache First策略
  if (STATIC_FILES.includes(url.pathname) ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // 离线时返回缓存的首页
          if (request.destination === 'document') {
            return caches.match('/');
          }
        })
    );
    return;
  }

  // API请求：Network First策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 其他请求：Network First策略
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] 后台同步:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 这里可以添加离线时的数据同步逻辑
      syncOfflineData()
    );
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] 收到推送消息');

  const options = {
    body: event.data ? event.data.text() : '您有新的网站更新',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('个人导航中心', options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 通知被点击:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 同步离线数据的函数
async function syncOfflineData() {
  try {
    // 获取离线存储的数据
    const offlineData = await getOfflineData();

    if (offlineData && offlineData.length > 0) {
      // 尝试同步到服务器
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offlineData)
      });

      if (response.ok) {
        // 同步成功，清除离线数据
        await clearOfflineData();
        console.log('[SW] 离线数据同步成功');
      }
    }
  } catch (error) {
    console.error('[SW] 离线数据同步失败:', error);
  }
}

// 获取离线数据（示例实现）
async function getOfflineData() {
  // 这里应该从IndexedDB或其他存储中获取离线数据
  return [];
}

// 清除离线数据（示例实现）
async function clearOfflineData() {
  // 这里应该清除IndexedDB或其他存储中的离线数据
}