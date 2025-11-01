'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import { WorkoutsCollection } from '../../../lib/collections/workouts';
import { Workout, Exercise, WorkoutExercise } from '../../../lib/schemas';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { formatDuration } from '../../../lib/utils';

const workoutSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  color: z.string(),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

interface WorkoutFormProps {
  workout?: Workout;
  exercises: Exercise[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WorkoutForm({ workout, exercises, onSuccess, onCancel }: WorkoutFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>(workout?.exercises || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: workout?.name || '',
      description: workout?.description || '',
      difficulty: workout?.difficulty || 'intermediate',
      color: workout?.color || '#3b82f6',
    },
  });

  const availableExercises = exercises.filter(exercise =>
    !selectedExercises.some(selected => selected.exerciseId === exercise.id)
  );

  const handleAddExercise = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise) {
      setSelectedExercises(prev => [...prev, {
        exerciseId,
        sets: 3,
        reps: 10,
        restTime: 60,
      }]);
    }
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    setSelectedExercises(prev => prev.map((exercise, i) =>
      i === index ? { ...exercise, [field]: value } : exercise
    ));
  };

  const calculateEstimatedDuration = () => {
    const totalRestTime = selectedExercises.reduce((total, exercise) =>
      total + (exercise.sets * exercise.restTime), 0
    );
    // Estimate 30 seconds per set for execution
    const totalExecutionTime = selectedExercises.reduce((total, exercise) =>
      total + (exercise.sets * 30), 0
    );
    return Math.round((totalRestTime + totalExecutionTime) / 60);
  };

  const onSubmit = async (data: WorkoutFormData) => {
    if (!user || selectedExercises.length === 0) return;

    setLoading(true);
    try {
      const workoutData = {
        userId: user.uid,
        name: data.name,
        description: data.description || undefined,
        exercises: selectedExercises,
        estimatedDuration: calculateEstimatedDuration(),
        difficulty: data.difficulty,
        color: data.color,
      };

      if (workout) {
        await WorkoutsCollection.updateWorkout(workout.id!, workoutData);
      } else {
        await WorkoutsCollection.createWorkout(workoutData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error al guardar el entrenamiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre del entrenamiento"
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
          placeholder="Describe el entrenamiento..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Dificultad"
          {...register('difficulty')}
          options={[
            { value: 'beginner', label: 'Principiante' },
            { value: 'intermediate', label: 'Intermedio' },
            { value: 'advanced', label: 'Avanzado' },
          ]}
          error={errors.difficulty?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color del tema
          </label>
          <input
            type="color"
            {...register('color')}
            className="w-full h-10 rounded-md border border-gray-300"
          />
        </div>
      </div>

      {/* Exercise Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agregar Ejercicios
        </label>
        <Select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              handleAddExercise(e.target.value);
            }
          }}
          options={[
            { value: '', label: 'Seleccionar ejercicio...' },
            ...availableExercises.map(exercise => ({
              value: exercise.id!,
              label: exercise.name
            }))
          ]}
        />
      </div>

      {/* Selected Exercises */}
      {selectedExercises.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Ejercicios en el entrenamiento ({selectedExercises.length})
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {selectedExercises.map((exercise, index) => {
              const exerciseData = exercises.find(e => e.id === exercise.exerciseId);
              return (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">
                      {exerciseData?.name || 'Ejercicio desconocido'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="Series"
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value))}
                      className="text-sm"
                    />
                    <Input
                      label="Reps"
                      type="number"
                      min="1"
                      value={exercise.reps || ''}
                      onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value) || undefined)}
                      className="text-sm"
                    />
                    <Input
                      label="Descanso (seg)"
                      type="number"
                      min="0"
                      value={exercise.restTime}
                      onChange={(e) => handleUpdateExercise(index, 'restTime', parseInt(e.target.value))}
                      className="text-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Duración estimada: {formatDuration(calculateEstimatedDuration())}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} disabled={selectedExercises.length === 0}>
          {workout ? 'Actualizar' : 'Crear'} Entrenamiento
        </Button>
      </div>
    </form>
  );
}