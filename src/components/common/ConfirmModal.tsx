import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-blue-500 rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <h4 className="text-xl font-bold text-gray-800 mb-2">{title}</h4>
        <div className="text-gray-600 mb-6 leading-relaxed">{message}</div>
        <div className="flex space-x-3">
          <button 
            className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className="flex-1 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
