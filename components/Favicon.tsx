import React, { useState } from 'react';

interface FaviconProps {
  url: string;
  name: string;
  size: 'small' | 'large';
  fallbackColor?: string;
}

const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
    } catch (e) {
      return '';
    }
};

// Helper function to get contrasting text color (black or white)
const getContrastingTextColor = (hexColor: string): string => {
    if (!hexColor) return '#000000';
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
};


const Favicon: React.FC<FaviconProps> = ({ url, name, size, fallbackColor = '#e0e7ff' }) => {
    const [error, setError] = useState(false);

    const sizeClasses = size === 'large' ? 'w-10 h-10' : 'w-6 h-6';
    const fallbackFontClasses = size === 'large' ? 'text-xl' : 'text-sm';
    const roundedClass = size === 'large' ? 'rounded-lg' : 'rounded-md';

    const fallbackStyle = {
      backgroundColor: fallbackColor,
      color: getContrastingTextColor(fallbackColor),
    };

    const fallbackIcon = (
      <div 
        className={`${sizeClasses} ${roundedClass} flex-shrink-0 flex items-center justify-center font-bold`}
        style={fallbackStyle}
      >
        <span className={fallbackFontClasses}>
            {name.charAt(0).toUpperCase()}
        </span>
      </div>
    );

    if (error || !url) {
      return fallbackIcon;
    }

    return (
        <img
            src={getFaviconUrl(url)}
            alt={`${name} favicon`}
            className={`${sizeClasses} object-contain flex-shrink-0 ${roundedClass}`}
            onError={() => setError(true)}
        />
    );
};

export default Favicon;