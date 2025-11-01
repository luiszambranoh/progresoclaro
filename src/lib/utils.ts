import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Weight utilities
export function formatWeight(weight: number, unit: 'kg' | 'lbs'): string {
  return `${weight} ${unit}`;
}

export function convertWeight(weight: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
  if (from === to) return weight;
  return from === 'kg' ? weight * 2.20462 : weight / 2.20462;
}

// Measurement utilities
export function formatMeasurement(value: number, unit: string): string {
  return `${value} ${unit}`;
}

// Exercise utilities
export function getMuscleGroupName(group: string): string {
  const muscleGroups: Record<string, string> = {
    chest: 'Pecho',
    back: 'Espalda',
    shoulders: 'Hombros',
    arms: 'Brazos',
    legs: 'Piernas',
    core: 'Core',
    glutes: 'Glúteos',
    calves: 'Pantorrillas',
  };
  return muscleGroups[group] || group;
}

export function getCategoryName(category: string): string {
  const categories: Record<string, string> = {
    strength: 'Fuerza',
    cardio: 'Cardio',
    flexibility: 'Flexibilidad',
  };
  return categories[category] || category;
}

export function getDifficultyName(difficulty: string): string {
  const difficulties: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };
  return difficulties[difficulty] || difficulty;
}

// Color utilities for workout themes
export const workoutColors = [
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Amarillo', value: '#f59e0b' },
  { name: 'Morado', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Cian', value: '#06b6d4' },
];

export function getRandomWorkoutColor(): string {
  return workoutColors[Math.floor(Math.random() * workoutColors.length)].value;
}