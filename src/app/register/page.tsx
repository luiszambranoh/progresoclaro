'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { UsersCollection } from '../../lib/collections/users';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const registerSchema = z.object({
  weightTarget: z.number().min(30).max(300).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  weeklyWorkouts: z.number().min(1).max(7),
  units: z.enum(['metric', 'imperial']),
  notifications: z.boolean(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      activityLevel: 'moderate',
      weeklyWorkouts: 3,
      units: 'metric',
      notifications: true,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await UsersCollection.createUser({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || '',
        photoURL: user.photoURL || undefined,
        fitnessGoals: {
          weightTarget: data.weightTarget,
          activityLevel: data.activityLevel,
          weeklyWorkouts: data.weeklyWorkouts,
        },
        preferences: {
          units: data.units,
          notifications: data.notifications,
        },
      });

      router.push('/');
    } catch (error) {
      console.error('Error creating user profile:', error);
      setError('Error al crear el perfil. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configura tu Perfil
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Completa tu información para personalizar tu experiencia
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Peso objetivo (opcional)"
              type="number"
              placeholder="70"
              {...register('weightTarget', { valueAsNumber: true })}
              error={errors.weightTarget?.message}
            />

            <Select
              label="Nivel de actividad"
              {...register('activityLevel')}
              options={[
                { value: 'sedentary', label: 'Sedentario' },
                { value: 'light', label: 'Ligero' },
                { value: 'moderate', label: 'Moderado' },
                { value: 'active', label: 'Activo' },
                { value: 'very_active', label: 'Muy activo' },
              ]}
              error={errors.activityLevel?.message}
            />

            <Input
              label="Entrenamientos semanales"
              type="number"
              min="1"
              max="7"
              {...register('weeklyWorkouts', { valueAsNumber: true })}
              error={errors.weeklyWorkouts?.message}
            />

            <Select
              label="Unidades de medida"
              {...register('units')}
              options={[
                { value: 'metric', label: 'Métrico (kg, cm)' },
                { value: 'imperial', label: 'Imperial (lbs, in)' },
              ]}
              error={errors.units?.message}
            />

            <div className="flex items-center">
              <input
                id="notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('notifications')}
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                Recibir notificaciones
              </label>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Completar Registro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}