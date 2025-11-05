import React from 'react';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallPromptProps {
  className?: string;
}

export function PWAInstallPrompt({ className = '' }: PWAInstallPromptProps) {
  const { isInstallable, isOnline, hasUpdate, installApp, dismissInstall, reloadApp } = usePWA();

  // 更新提示
  if (hasUpdate) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">应用更新可用</p>
              <p className="text-sm opacity-90">点击重新加载以获取最新功能</p>
            </div>
          </div>
          <button
            onClick={reloadApp}
            className="bg-white text-blue-500 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            更新
          </button>
        </div>
      </div>
    );
  }

  // 离线提示
  if (!isOnline) {
    return (
      <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
        <div className="bg-orange-500 text-white p-3 rounded-lg shadow-lg flex items-center space-x-3">
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="font-medium">当前处于离线模式</p>
        </div>
      </div>
    );
  }

  // 安装提示
  if (isInstallable) {
    return (
      <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium">安装个人导航中心</span>
                <span className="text-sm opacity-90 ml-2">享受更快访问速度</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={installApp}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                安装
              </button>
              <button
                onClick={() => dismissInstall(false)}
                className="text-white hover:text-gray-200 text-sm transition-colors"
              >
                稍后
              </button>
              <button
                onClick={() => dismissInstall(true)}
                className="text-white hover:text-gray-200 text-sm transition-colors"
              >
                不再提醒
              </button>
              <button
                onClick={() => dismissInstall(false)}
                className="text-white hover:text-gray-200 transition-colors ml-1"
                aria-label="关闭"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// 简化版安装按钮组件
export function PWAInstallButton({ className = '' }: { className?: string }) {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <button
      onClick={installApp}
      className={`inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors ${className}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
      <span>安装应用</span>
    </button>
  );
}