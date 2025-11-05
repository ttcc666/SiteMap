import React, { useState } from 'react';

interface BatchOperationBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchEdit: () => void;
  onBatchMove: (category: string) => void;
  onExitBatchMode: () => void;
  categories: string[];
}

const BatchOperationBar: React.FC<BatchOperationBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBatchDelete,
  onBatchEdit,
  onBatchMove,
  onExitBatchMode,
  categories
}) => {
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);

  const handleMoveToCategory = (category: string) => {
    onBatchMove(category);
    setShowMoveDropdown(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* 选择状态显示 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              已选择 {selectedCount} / {totalCount} 个网站
            </span>
          </div>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* 选择操作 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
              className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              aria-label={selectedCount === totalCount ? "取消全选" : "全选"}
            >
              {selectedCount === totalCount ? "取消全选" : "全选"}
            </button>
            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              aria-label="清除选择"
            >
              清除
            </button>
          </div>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* 批量操作 */}
          <div className="flex items-center space-x-2">
            {/* 移动到分类 */}
            <div className="relative">
              <button
                onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                disabled={selectedCount === 0}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center space-x-1 ${
                  selectedCount === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
                aria-label="移动到分类"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span>移动</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* 分类下拉菜单 */}
              {showMoveDropdown && selectedCount > 0 && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-32 z-10">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleMoveToCategory(category)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 批量编辑 */}
            <button
              onClick={onBatchEdit}
              disabled={selectedCount === 0}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center space-x-1 ${
                selectedCount === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
              }`}
              aria-label="批量编辑"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>编辑</span>
            </button>

            {/* 批量删除 */}
            <button
              onClick={onBatchDelete}
              disabled={selectedCount === 0}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center space-x-1 ${
                selectedCount === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
              aria-label="批量删除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>删除</span>
            </button>
          </div>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* 退出批量模式 */}
          <button
            onClick={onExitBatchMode}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-1"
            aria-label="退出批量模式"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>退出</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchOperationBar;