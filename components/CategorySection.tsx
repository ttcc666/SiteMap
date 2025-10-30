import React, { useState, useRef } from 'react';
import type { Site } from '../types';
import SiteCard from './SiteCard';

interface CategorySectionProps {
  categoryName: string;
  sites: Site[];
  onEditSite: (site: Site) => void;
  onDeleteSite: (id: string) => void;
  onSiteClick: (id: string) => void;
  onReorder: (categoryName: string, dragIndex: number, hoverIndex: number) => void;
  fallbackColor?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({ categoryName, sites, onEditSite, onDeleteSite, onSiteClick, onReorder, fallbackColor }) => {
  const dragItemIndex = useRef<number | null>(null);
  const [currentlyDraggingIndex, setCurrentlyDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItemIndex.current = index;
    setCurrentlyDraggingIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (dragItemIndex.current !== null && dragItemIndex.current !== index) {
      onReorder(categoryName, dragItemIndex.current, index);
      dragItemIndex.current = index;
    }
  };

  const handleDragEnd = () => {
    dragItemIndex.current = null;
    setCurrentlyDraggingIndex(null);
  };
  
  return (
    <div className="mb-12">
      <h2 className="relative text-2xl font-bold text-indigo-600 mb-6 pb-2">
        {categoryName}
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sites.map((site, index) => (
          <SiteCard 
            key={site.id} 
            site={site} 
            onEdit={onEditSite} 
            onDelete={onDeleteSite} 
            onSiteClick={onSiteClick}
            isDragging={currentlyDraggingIndex === index}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            fallbackColor={fallbackColor}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;