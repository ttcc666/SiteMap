import React, { useState, useEffect } from 'react';
import { imageCache, extractDomain, generateFaviconUrl } from '../utils/imageCache';

interface FaviconProps {
  url: string;
  name: string;
  size: 'small' | 'large';
  fallbackColor?: string;
}

const getFaviconUrls = (url: string) => {
    try {
      const domain = extractDomain(url);
      const protocol = url.startsWith('https://') ? 'https://' : 'https://';

      // 只使用网站原生图标，不使用第三方服务
      return [
        `${protocol}${domain}/favicon.ico`
      ];
    } catch (e) {
      return [];
    }
};

// Helper function to get contrasting text color (black or white)
const getContrastingTextColor = (hexColor: string): string => {
    if (!hexColor) return '#000000';
    try {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#FFFFFF';
    } catch {
        return '#000000';
    }
};


const Favicon: React.FC<FaviconProps> = ({ url, name, size, fallbackColor: fallbackColorFromProps }) => {
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [faviconUrls, setFaviconUrls] = useState(() => getFaviconUrls(url));

    useEffect(() => {
        setCurrentUrlIndex(0);
        setFaviconUrls(getFaviconUrls(url));
    }, [url]);

    const fallbackColor = fallbackColorFromProps || '#6366f1';
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

    const handleError = () => {
        // 快速失败：第一次错误后直接显示后备方案
        setCurrentUrlIndex(faviconUrls.length);
    };

    const handleLoad = () => {
        // 成功加载时，将图标URL缓存起来
        const domain = extractDomain(url);
        const currentUrl = faviconUrls[currentUrlIndex];
        if (currentUrl && !imageCache.has(domain)) {
            imageCache.set(domain, currentUrl);
        }
    };

    if (currentUrlIndex >= faviconUrls.length || faviconUrls.length === 0) {
        return fallbackIcon;
    }

    return (
        <img
            key={`${url}-${currentUrlIndex}`}
            src={faviconUrls[currentUrlIndex]}
            alt={`${name} favicon`}
            className={`${sizeClasses} object-contain flex-shrink-0 ${roundedClass}`}
            onError={handleError}
            onLoad={handleLoad}
            loading="lazy"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
    );
};

export default Favicon;