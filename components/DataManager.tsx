import React, { useState, useRef } from 'react';
import { exportToJSON, exportToCSV, importFromJSON, parseBookmarksHTML, findDuplicates, downloadFile } from '../utils/dataManager';
import type { Site, AllSiteClickData } from '../types';
import BaseModal from './BaseModal';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  categoryIcons: Record<string, string>;
  clickData: AllSiteClickData;
  onImport: (sites: Site[]) => void;
}

const DataManager: React.FC<DataManagerProps> = ({
  isOpen,
  onClose,
  sites,
  categoryIcons,
  clickData,
  onImport
}) => {
  const [importPreview, setImportPreview] = useState<Site[]>([]);
  const [duplicates, setDuplicates] = useState<Site[]>([]);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const jsonData = exportToJSON(sites, categoryIcons, clickData);
    const filename = `sitemap-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonData, filename, 'application/json');
  };

  const handleExportCSV = () => {
    const csvData = exportToCSV(sites);
    const filename = `sitemap-sites-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvData, filename, 'text/csv');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportPreview([]);
    setDuplicates([]);

    try {
      const text = await file.text();
      let importedSites: Site[] = [];

      if (file.name.endsWith('.json')) {
        const data = importFromJSON(text);
        importedSites = data.sites || [];
      } else if (file.name.endsWith('.html')) {
        importedSites = parseBookmarksHTML(text);
      } else {
        throw new Error('不支持的文件格式。请选择 JSON 或 HTML 文件。');
      }

      const duplicateSites = findDuplicates(importedSites, sites);
      setImportPreview(importedSites);
      setDuplicates(duplicateSites);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败');
    }
  };

  const handleConfirmImport = () => {
    if (importPreview.length > 0) {
      onImport(importPreview);
      setImportPreview([]);
      setDuplicates([]);
      onClose();
    }
  };

  const clearImport = () => {
    setImportPreview([]);
    setDuplicates([]);
    setImportError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="数据管理">
      <div className="space-y-6">
        {/* 导出功能 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">导出数据</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              完整备份 (JSON)
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              网站列表 (CSV)
            </button>
          </div>
        </div>

        {/* 导入功能 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">导入数据</h3>
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.html"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                支持 JSON 备份文件和浏览器书签 HTML 文件
              </p>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{importError}</p>
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">导入预览</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    将导入 {importPreview.length} 个网站
                  </p>
                  {duplicates.length > 0 && (
                    <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                      检测到 {duplicates.length} 个重复网站，将被跳过
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleConfirmImport}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    确认导入
                  </button>
                  <button
                    onClick={clearImport}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">数据统计</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{sites.length}</div>
              <div className="text-gray-600 dark:text-gray-400">网站总数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {new Set(sites.map(s => s.category)).size}
              </div>
              <div className="text-gray-600 dark:text-gray-400">分类数量</div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default DataManager;