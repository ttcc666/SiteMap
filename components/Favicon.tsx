import React, { useState, useEffect, useRef } from 'react';
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

      // 优先使用DuckDuckGo图标服务，备选原生favicon
      return [
        generateFaviconUrl(domain),
        `https://${domain}/favicon.ico`,
        `http://${domain}/favicon.ico`
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
    const [isLoading, setIsLoading] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const domain = extractDomain(url);

        // 检查缓存
        const cachedUrl = imageCache.get(domain);
        if (cachedUrl) {
            setFaviconUrls([cachedUrl]);
            setCurrentUrlIndex(0);
            setIsLoading(false);
            return;
        }

        // 检查是否已失败缓存
        if (imageCache.isFailed(domain)) {
            setCurrentUrlIndex(getFaviconUrls(url).length);
            setIsLoading(false);
            return;
        }

        const urls = getFaviconUrls(url);
        setCurrentUrlIndex(0);
        setFaviconUrls(urls);
        setIsLoading(true);

        // 3秒超时机制
        timeoutRef.current = setTimeout(() => {
            setCurrentUrlIndex(urls.length);
            setIsLoading(false);
            imageCache.setFailed(domain);
        }, 3000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
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
        // 尝试下一个URL，如果没有更多URL则显示fallback并缓存失败
        if (currentUrlIndex < faviconUrls.length - 1) {
            setCurrentUrlIndex(currentUrlIndex + 1);
        } else {
            setCurrentUrlIndex(faviconUrls.length);
            setIsLoading(false);
            const domain = extractDomain(url);
            imageCache.setFailed(domain);
        }
    };

    const handleLoad = () => {
        // 成功加载时，清除超时器并缓存图标URL
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const domain = extractDomain(url);
        const currentUrl = faviconUrls[currentUrlIndex];
        if (currentUrl && !imageCache.has(domain)) {
            imageCache.set(domain, currentUrl);
        }
        setIsLoading(false);
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