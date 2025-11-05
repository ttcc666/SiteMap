import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  categoryIcons: Record<string, string>;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
  onSetIcon: (categoryName: string, icon: string) => void;
}

const EMOJIS = [
  '😊', '🚀', '💡', '💼', '🏠', '🎵', '📚', '💻', '🎮', '🍔',
  '⚽️', '🎨', '✈️', '🛒', '❤️', '⭐️', '💰', '🛠️', '📰', '🎥'
];


const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  categoryIcons,
  onRename,
  onDelete,
  onSetIcon,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (editingCategory && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If click is outside the picker, close it
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setActivePicker(null);
        setPickerPosition(null);
      }
    };
    if (activePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePicker]);


  if (!isOpen) return null;

  const handleStartEditing = (category: string) => {
    setEditingCategory(category);
    setNewName(category);
    setError('');
    setActivePicker(null); // Close any open picker
  };

  const handleCancelEditing = () => {
    setEditingCategory(null);
    setNewName('');
    setError('');
  };

  const handleSave = () => {
    if (!newName.trim()) {
      setError('分类名称不能为空。');
      return;
    }
    if (editingCategory !== newName && categories.includes(newName.trim())) {
      setError('该分类名称已存在。');
      return;
    }
    if (editingCategory) {
      onRename(editingCategory, newName.trim());
    }
    handleCancelEditing();
  };

  const handleIconSelect = (category: string, icon: string) => {
    onSetIcon(category, icon);
    setActivePicker(null);
    setPickerPosition(null);
  };
  
  const togglePicker = (category: string, event: React.MouseEvent<HTMLButtonElement>) => {
    handleCancelEditing(); // Cancel any ongoing name editing
    if (activePicker === category) {
      setActivePicker(null);
      setPickerPosition(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const modalContent = event.currentTarget.closest('.bg-white\\/80');
      
      if (modalContent) {
          const modalRect = modalContent.getBoundingClientRect();
          setPickerPosition({
              top: buttonRect.bottom - modalRect.top + 4, // Position 4px below the button
              left: buttonRect.left - modalRect.left,
          });
          setActivePicker(category);
      }
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (a === '未分类') return 1;
    if (b === '未分类') return -1;
    return a.localeCompare(b);
  });

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="管理分类" maxWidth="lg">
      <div className="relative">
        
        <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
          {sortedCategories.map(category => (
            <div key={category} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center flex-grow min-w-0">
                  <div className="mr-3 flex-shrink-0">
                    <button
                      onClick={(e) => togglePicker(category, e)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-200/50 hover:bg-gray-300/50 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={category === '未分类'}
                      aria-label={`设置 ${category} 的图标`}
                    >
                      <span className="text-xl">{categoryIcons[category] || '＋'}</span>
                    </button>
                  </div>
                
                {editingCategory === category ? (
                  <div className="flex-grow min-w-0">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      onBlur={handleSave}
                      className="w-full bg-white/80 border border-indigo-300/70 rounded-md px-3 py-1 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                  </div>
                ) : (
                  <span className="text-gray-800 truncate" title={category}>{category}</span>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                {editingCategory === category ? (
                  <>
                    <button onClick={handleSave} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button onClick={handleCancelEditing} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.693a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEditing(category)}
                      disabled={category === '未分类'}
                      className="p-1.5 text-gray-600 hover:text-indigo-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-200/80 rounded-full transition-colors"
                      aria-label={`重命名 ${category}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      disabled={category === '未分类'}
                      className="p-1.5 text-gray-600 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-red-100/80 rounded-full transition-colors"
                      aria-label={`删除 ${category}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {activePicker && pickerPosition && (
          <div
            ref={pickerRef}
            className="absolute z-20 w-max p-2 bg-white rounded-lg shadow-xl border border-gray-200"
            style={{ top: `${pickerPosition.top}px`, left: `${pickerPosition.left}px` }}
          >
            <div className="grid grid-cols-5 gap-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleIconSelect(activePicker, emoji)}
                  className="text-2xl rounded-md p-1 hover:bg-indigo-100 transition-colors"
                  aria-label={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
          >
            完成
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ManageCategoriesModal;