import React, { useState } from 'react';
import type { Site } from '../types';

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
}

const SiteCard: React.FC<SiteCardProps> = ({ site, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      // 使用 DuckDuckGo 的服务，通常比 Google 的更可靠
      return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
    } catch (e) {
      return '';
    }
  };
  
  const fallbackIcon = (
    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
      {site.name.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-500/20 hover:bg-blue-50/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        {!faviconError ? (
            <img
            src={getFaviconUrl(site.url)}
            alt={`${site.name} favicon`}
            className="w-10 h-10 object-contain flex-shrink-0 rounded-lg"
            onError={() => setFaviconError(true)}
            />
        ) : (
            fallbackIcon
        )}
        <span className="text-gray-800 font-medium truncate" title={site.name}>
          {site.name}
        </span>
      </a>
      
      <div 
        className={`absolute top-2 right-2 flex space-x-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <button
          onClick={() => onEdit(site)}
          className="p-1.5 bg-white/50 hover:bg-gray-200/80 rounded-full text-gray-600 hover:text-indigo-700 backdrop-blur-sm"
          aria-label={`编辑 ${site.name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(site.id)}
          className="p-1.5 bg-white/50 hover:bg-red-100/80 rounded-full text-gray-600 hover:text-red-700 backdrop-blur-sm"
          aria-label={`删除 ${site.name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SiteCard;