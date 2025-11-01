'use client';

import React from 'react';
import { Menu, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, userProfile } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Fitness Tracker
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        {user && (
          <div className="flex items-center space-x-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuario'}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                <User className="h-4 w-4" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {user.displayName || user.email}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}