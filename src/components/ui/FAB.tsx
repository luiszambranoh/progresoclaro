'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FABProps {
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export default function FAB({ onClick, className, icon }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      aria-label="Agregar nuevo elemento"
    >
      {icon || <Plus className="h-6 w-6" />}
    </button>
  );
}