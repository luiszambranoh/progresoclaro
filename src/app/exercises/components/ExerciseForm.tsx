'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import { ExercisesCollection } from '../../../lib/collections/exercises';
import { Exercise } from '../../../lib/schemas';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.enum(['strength', 'cardio', 'flexibility']),
  muscleGroups: z.string().min(1, 'Debe especificar al menos un grupo muscular'),
  equipment: z.string().optional(),
  instructions: z.string().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface ExerciseFormProps {
  exercise?: Exercise;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExerciseForm({ exercise, onSuccess, onCancel }: ExerciseFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exercise?.name || '',
      description: exercise?.description || '',
      category: exercise?.category || 'strength',
      muscleGroups: exercise?.muscleGroups.join(', ') || '',
      equipment: exercise?.equipment.join(', ') || '',
      instructions: exercise?.instructions.join('\n') || '',
    },
  });

  const onSubmit = async (data: ExerciseFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const exerciseData = {
        userId: user.uid,
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        muscleGroups: data.muscleGroups.split(',').map(g => g.trim()).filter(g => g),
        equipment: data.equipment ? data.equipment.split(',').map(e => e.trim()).filter(e => e) : [],
        instructions: data.instructions ? data.instructions.split('\n').filter(i => i.trim()) : [],
      };

      if (exercise) {
        await ExercisesCollection.updateExercise(user.uid, exercise.id!, exerciseData);
      } else {
        await ExercisesCollection.createExercise(user.uid, exerciseData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Error al guardar el ejercicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre del ejercicio"
        {...register('name')}
        error={errors.name?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Describe el ejercicio..."
        />
      </div>

      <Select
        label="Categoría"
        {...register('category')}
        options={[
          { value: 'strength', label: 'Fuerza' },
          { value: 'cardio', label: 'Cardio' },
          { value: 'flexibility', label: 'Flexibilidad' },
        ]}
        error={errors.category?.message}
      />

      <Input
        label="Grupos musculares"
        {...register('muscleGroups')}
        placeholder="pecho, tríceps, hombros (separados por coma)"
        error={errors.muscleGroups?.message}
      />

      <Input
        label="Equipo necesario"
        {...register('equipment')}
        placeholder="mancuerna, barra, máquina (separados por coma)"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instrucciones
        </label>
        <textarea
          {...register('instructions')}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Instrucciones paso a paso (una por línea)..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {exercise ? 'Actualizar' : 'Crear'} Ejercicio
        </Button>
      </div>
    </form>
  );
}