'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Home,
  Dumbbell,
  Calendar,
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../lib/auth';
import { cn } from '../../lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Ejercicios', href: '/exercises', icon: Dumbbell },
  { name: 'Entrenamientos', href: '/workouts', icon: Calendar },
  { name: 'Progreso', href: '/progress', icon: TrendingUp },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Fitness Tracker
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          {user && (
            <div className="border-t p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}