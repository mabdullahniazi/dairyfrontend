import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-[slideUp_0.3s_ease-out] max-h-[85vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-stone-300" />
        </div>
        {title && (
          <h3 className="text-lg font-bold text-stone-800 mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
