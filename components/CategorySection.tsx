import React from 'react';
import type { Site } from '../types';
import SiteCard from './SiteCard';

interface CategorySectionProps {
  categoryName: string;
  sites: Site[];
  onEditSite: (site: Site) => void;
  onDeleteSite: (id: string) => void;
  onSiteClick: (id: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ categoryName, sites, onEditSite, onDeleteSite, onSiteClick }) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6 border-b-2 border-gray-200 pb-2">{categoryName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sites.map(site => (
          <SiteCard key={site.id} site={site} onEdit={onEditSite} onDelete={onDeleteSite} onSiteClick={onSiteClick} />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
