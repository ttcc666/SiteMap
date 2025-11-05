import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "请选择...",
  multiple = false,
  disabled = false,
  className = ""
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedLabels = options
    .filter(option => selectedValues.includes(option.value))
    .map(option => option.label);

  const displayText = selectedLabels.length > 0
    ? selectedLabels.join(', ')
    : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* 选择框按钮 */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-4 py-2 text-left bg-white/10 backdrop-blur-sm border border-white/20
          rounded-lg shadow-sm transition-all duration-200
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-white/20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          }
          dark:bg-gray-800/50 dark:border-gray-600/50 dark:hover:bg-gray-700/50
          flex items-center justify-between
        `}
      >
        <span className={`block truncate ${selectedLabels.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
          {displayText}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉选项 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl dark:bg-gray-800/95 dark:border-gray-600/50">
          {/* 搜索框 */}
          <div className="p-2 border-b border-gray-200/50 dark:border-gray-600/50">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索选项..."
              className="w-full px-3 py-1 text-sm bg-transparent border border-gray-300/50 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600/50 dark:text-white"
            />
          </div>

          {/* 选项列表 */}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                没有找到匹配的选项
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option.value)}
                    className={`
                      w-full px-4 py-2 text-left text-sm transition-colors duration-150
                      hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                      flex items-center justify-between
                      ${isSelected
                        ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100'
                        : 'text-gray-900 dark:text-white'
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <CheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}