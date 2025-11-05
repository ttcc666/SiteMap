import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomRadioProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  disabled?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

interface SingleRadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function SingleRadio({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = ""
}: SingleRadioProps) {
  const handleChange = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <label
      className={`
        relative flex items-start cursor-pointer group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="flex items-center h-5">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center
            ${checked
              ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
            }
            ${!disabled && 'group-hover:border-indigo-500 dark:group-hover:border-indigo-400'}
            ${!disabled && 'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2'}
          `}
        >
          {checked && (
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-scale-in" />
          )}
        </div>
      </div>
      <div className="ml-3 text-sm">
        <div
          className={`
            font-medium transition-colors duration-200
            ${checked
              ? 'text-indigo-900 dark:text-indigo-100'
              : 'text-gray-900 dark:text-white'
            }
            ${!disabled && 'group-hover:text-indigo-700 dark:group-hover:text-indigo-300'}
          `}
        >
          {label}
        </div>
        {description && (
          <div className="text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </div>
        )}
      </div>
    </label>
  );
}

export default function CustomRadio({
  name,
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  layout = 'vertical'
}: CustomRadioProps) {
  return (
    <div
      className={`
        ${layout === 'horizontal' ? 'flex flex-wrap gap-6' : 'space-y-4'}
        ${className}
      `}
    >
      {options.map((option) => (
        <SingleRadio
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={onChange}
          label={option.label}
          description={option.description}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

// 添加动画样式到全局CSS中
const styles = `
@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
`;

// 如果需要，可以将样式注入到文档中
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}