'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ExercisesCollection } from '../../lib/collections/exercises';
import { Exercise } from '../../lib/schemas';
import Layout from '../../components/layout/Layout';
import FAB from '../../components/ui/FAB';
import { useModal } from '../../contexts/ModalContext';
import { Plus, Search, Filter, Dumbbell, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

export default function ExercisesPage() {
  const { user } = useAuth();
  const { openModal } = useModal();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (user) {
      loadExercises();
    }
  }, [user]);

  const loadExercises = async () => {
    try {
      const exercisesData = await ExercisesCollection.getExercises(user!.uid);
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = () => {
    setEditingExercise(null);
    openModal(<ExerciseForm onSuccess={loadExercises} onCancel={() => {}} />);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    openModal(<ExerciseForm exercise={exercise} onSuccess={loadExercises} onCancel={() => {}} />);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      try {
        await ExercisesCollection.deleteExercise(exerciseId);
        loadExercises();
      } catch (error) {
        console.error('Error deleting exercise:', error);
        alert('Error al eliminar el ejercicio');
      }
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ejercicios</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tu biblioteca personal de ejercicios
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar ejercicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'all', label: 'Todas las categorías' },
              { value: 'strength', label: 'Fuerza' },
              { value: 'cardio', label: 'Cardio' },
              { value: 'flexibility', label: 'Flexibilidad' },
            ]}
            className="w-full sm:w-48"
          />
        </div>

        {/* Exercises Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando ejercicios...</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ejercicios</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all'
                ? 'No se encontraron ejercicios con los filtros aplicados.'
                : 'Comienza creando tu primer ejercicio.'}
            </p>
            <div className="mt-6">
              <Button onClick={handleCreateExercise}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Ejercicio
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {exercise.category === 'strength' ? 'Fuerza' :
                         exercise.category === 'cardio' ? 'Cardio' : 'Flexibilidad'}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditExercise(exercise)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(exercise.id!)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {exercise.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {exercise.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscleGroups.slice(0, 3).map((group) => (
                        <span
                          key={group}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {group}
                        </span>
                      ))}
                      {exercise.muscleGroups.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{exercise.muscleGroups.length - 3} más
                        </span>
                      )}
                    </div>
                    {exercise.equipment.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Equipo: {exercise.equipment.join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* FAB */}
        <FAB onClick={handleCreateExercise} />
      </div>
    </Layout>
  );
}

import ExerciseForm from './components/ExerciseForm';