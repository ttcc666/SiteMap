import React from 'react';
import BaseModal from './BaseModal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认删除',
  cancelText = '取消'
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm text-gray-500">
            {message}
          </p>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 flex justify-center space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-md hover:shadow-lg transform hover:-translate-y-px"
        >
          {confirmText}
        </button>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;