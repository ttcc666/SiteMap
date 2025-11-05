import React, { useState, useRef, useEffect } from 'react';
import { SwatchIcon } from '@heroicons/react/24/outline';

interface CustomColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
  presetColors?: string[];
}

const defaultPresetColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b'
];

export default function CustomColorPicker({
  value,
  onChange,
  disabled = false,
  className = "",
  presetColors = defaultPresetColors
}: CustomColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handlePresetColorClick = (color: string) => {
    onChange(color);
    setHexInput(color);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setHexInput(inputValue);

    // 验证十六进制颜色格式
    if (/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const handleHexInputBlur = () => {
    // 如果输入无效，恢复到当前值
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      setHexInput(value);
    }
  };

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {/* 颜色预览按钮 */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-12 h-10 rounded-lg border-2 border-white/20 shadow-sm transition-all duration-200
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          }
          dark:border-gray-600/50
          flex items-center justify-center overflow-hidden
        `}
        style={{ backgroundColor: value }}
      >
        {!value && (
          <SwatchIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* 颜色选择面板 */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl dark:bg-gray-800/95 dark:border-gray-600/50 min-w-[280px]">
          {/* 十六进制输入框 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              十六进制颜色值
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexInputBlur}
              placeholder="#000000"
              className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-white"
            />
          </div>

          {/* 预设颜色面板 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              预设颜色
            </label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePresetColorClick(color)}
                  className={`
                    w-8 h-8 rounded-lg border-2 transition-all duration-200
                    hover:scale-110 focus:ring-2 focus:ring-indigo-500
                    ${value === color
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-white/50 dark:border-gray-600/50'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* 当前颜色预览 */}
          <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-8 rounded-lg border border-gray-300/50 dark:border-gray-600/50"
                style={{ backgroundColor: value }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  当前颜色
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {value}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}