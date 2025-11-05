import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { CustomTheme, ThemeColors } from '../types';
import BaseModal from './BaseModal';
import CustomColorPicker from './CustomColorPicker';
import CustomRadio from './CustomRadio';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { saveCustomTheme, deleteCustomTheme, customThemes } = useTheme();
  const [themeName, setThemeName] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6'
  });

  const colorLabels = {
    primary: '主色调',
    secondary: '次要色',
    background: '背景色',
    surface: '表面色',
    text: '主文字',
    textSecondary: '次要文字',
    border: '边框色',
    accent: '强调色'
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!themeName.trim()) return;

    saveCustomTheme({
      name: themeName.trim(),
      colors,
      isDark
    });

    setThemeName('');
    onClose();
  };

  const handleDelete = (themeId: string) => {
    deleteCustomTheme(themeId);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="主题定制器">
      <div className="space-y-6">
        {/* 主题名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            主题名称
          </label>
          <input
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="输入主题名称"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 主题类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            主题类型
          </label>
          <CustomRadio
            name="themeType"
            value={isDark ? 'dark' : 'light'}
            onChange={(value) => setIsDark(value === 'dark')}
            options={[
              { value: 'light', label: '浅色主题', description: '适合白天使用' },
              { value: 'dark', label: '深色主题', description: '适合夜间使用' }
            ]}
            layout="horizontal"
          />
        </div>

        {/* 颜色配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            颜色配置
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(colorLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-3">
                <CustomColorPicker
                  value={colors[key as keyof ThemeColors]}
                  onChange={(color) => handleColorChange(key as keyof ThemeColors, color)}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {colors[key as keyof ThemeColors]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 预览区域 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            预览
          </label>
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <div
              className="text-lg font-semibold mb-2"
              style={{ color: colors.primary }}
            >
              {themeName || '主题预览'}
            </div>
            <div style={{ color: colors.textSecondary }}>
              这是一个主题预览示例
            </div>
            <button
              className="mt-2 px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: colors.accent,
                color: colors.background
              }}
            >
              示例按钮
            </button>
          </div>
        </div>

        {/* 已保存的自定义主题 */}
        {customThemes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              已保存的主题
            </label>
            <div className="space-y-2">
              {customThemes.map((theme) => (
                <div key={theme.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{theme.name}</span>
                  <button
                    onClick={() => handleDelete(theme.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!themeName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            保存主题
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ThemeCustomizer;