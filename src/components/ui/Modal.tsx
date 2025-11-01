'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { cn } from '../../lib/utils';

interface ModalProps {
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ children, className }: ModalProps) {
  const { isOpen, closeModal } = useModal();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6 shadow-xl',
          className
        )}
      >
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>
        {children}
      </div>
    </div>
  );
}