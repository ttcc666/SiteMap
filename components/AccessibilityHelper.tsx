import React, { useEffect, useState } from 'react';

interface AccessibilityHelperProps {
  shortcuts: Record<string, string>;
  isHelpVisible: boolean;
  onCloseHelp: () => void;
}

const AccessibilityHelper: React.FC<AccessibilityHelperProps> = ({
  shortcuts,
  isHelpVisible,
  onCloseHelp
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // 添加屏幕阅读器公告
  const announce = (message: string) => {
    setAnnouncements(prev => [...prev.slice(-4), message]);
  };

  // 清除旧公告
  useEffect(() => {
    if (announcements.length > 0) {
      const timer = setTimeout(() => {
        setAnnouncements(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [announcements]);

  // 键盘快捷键帮助面板
  const KeyboardHelpPanel = () => (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      onClick={onCloseHelp}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="help-title" className="text-2xl font-bold text-gray-900 dark:text-white">
              键盘快捷键帮助
            </h2>
            <button
              onClick={onCloseHelp}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="关闭帮助面板"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                全局快捷键
              </h3>
              <div className="grid gap-2">
                {Object.entries(shortcuts).map(([action, key]) => (
                  <div key={action} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {getActionLabel(action)}
                    </span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-mono">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                网站卡片操作
              </h3>
              <div className="grid gap-2">
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">访问网站</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-mono">
                    Enter / Space
                  </kbd>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">编辑网站</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-mono">
                    Ctrl+E
                  </kbd>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">删除网站</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-mono">
                    Shift+Delete
                  </kbd>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                可访问性提示
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• 使用 Tab 键在界面元素间导航</p>
                <p>• 使用方向键在网站卡片间移动</p>
                <p>• 按 Esc 键可以取消当前操作或关闭对话框</p>
                <p>• 屏幕阅读器会自动朗读网站信息和操作提示</p>
                <p>• 所有功能都支持键盘操作，无需鼠标</p>
              </div>
            </section>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              按 Esc 或点击外部区域关闭此帮助面板
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 跳转链接组件
  const SkipLinks = () => (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        跳转到主要内容
      </a>
      <a
        href="#search-input"
        className="fixed top-4 left-32 z-50 bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        跳转到搜索
      </a>
    </div>
  );

  // 焦点指示器增强
  const FocusIndicator = () => (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* 增强焦点指示器 */
        *:focus {
          outline: 2px solid #4f46e5 !important;
          outline-offset: 2px !important;
        }

        /* 高对比度模式支持 */
        @media (prefers-contrast: high) {
          *:focus {
            outline: 3px solid #000 !important;
            outline-offset: 3px !important;
          }
        }

        /* 减少动画模式支持 */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `
    }} />
  );

  // 获取操作标签
  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      search: '搜索',
      addSite: '添加网站',
      toggleTheme: '切换主题',
      showStats: '显示统计',
      manageCategories: '管理分类',
      dataManager: '数据管理',
      help: '显示帮助',
      navigation: '导航',
      activate: '激活',
      escape: '取消'
    };
    return labels[action] || action;
  };

  return (
    <>
      {/* 跳转链接 */}
      <SkipLinks />

      {/* 焦点指示器增强 */}
      <FocusIndicator />

      {/* 屏幕阅读器公告区域 */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      {/* 键盘快捷键帮助面板 */}
      {isHelpVisible && <KeyboardHelpPanel />}
    </>
  );
};

export default AccessibilityHelper;