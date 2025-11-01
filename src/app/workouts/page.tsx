'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { WorkoutsCollection } from '../../lib/collections/workouts';
import { ExercisesCollection } from '../../lib/collections/exercises';
import { Workout, Exercise } from '../../lib/schemas';
import Layout from '../../components/layout/Layout';
import FAB from '../../components/ui/FAB';
import { useModal } from '../../contexts/ModalContext';
import { Plus, Search, Filter, Dumbbell, Edit, Trash2, Clock, Target } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { getDifficultyName, formatDuration } from '../../lib/utils';

export default function WorkoutsPage() {
  const { user } = useAuth();
  const { openModal } = useModal();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    if (user) {
      loadWorkouts();
      loadExercises();
    }
  }, [user]);

  const loadWorkouts = async () => {
    try {
      const workoutsData = await WorkoutsCollection.getWorkouts(user!.uid);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const exercisesData = await ExercisesCollection.getExercises(user!.uid);
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const handleCreateWorkout = () => {
    setEditingWorkout(null);
    openModal(<WorkoutForm exercises={exercises} onSuccess={loadWorkouts} onCancel={() => {}} />);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    openModal(<WorkoutForm workout={workout} exercises={exercises} onSuccess={loadWorkouts} onCancel={() => {}} />);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')) {
      try {
        await WorkoutsCollection.deleteWorkout(workoutId);
        loadWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Error al eliminar el entrenamiento');
      }
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || workout.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
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
            <h1 className="text-2xl font-bold text-gray-900">Entrenamientos</h1>
            <p className="mt-2 text-gray-600">
              Crea y gestiona tus rutinas de entrenamiento
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar entrenamientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            options={[
              { value: 'all', label: 'Todas las dificultades' },
              { value: 'beginner', label: 'Principiante' },
              { value: 'intermediate', label: 'Intermedio' },
              { value: 'advanced', label: 'Avanzado' },
            ]}
            className="w-full sm:w-48"
          />
        </div>

        {/* Workouts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando entrenamientos...</p>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay entrenamientos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDifficulty !== 'all'
                ? 'No se encontraron entrenamientos con los filtros aplicados.'
                : 'Comienza creando tu primer entrenamiento.'}
            </p>
            <div className="mt-6">
              <Button onClick={handleCreateWorkout}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Entrenamiento
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {workout.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          workout.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          workout.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getDifficultyName(workout.difficulty)}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(workout.estimatedDuration)}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditWorkout(workout)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(workout.id!)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {workout.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {workout.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="h-4 w-4 mr-2" />
                      {workout.exercises.length} ejercicio{workout.exercises.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workout.exercises.slice(0, 2).map((exercise, index) => {
                        const exerciseData = exercises.find(e => e.id === exercise.exerciseId);
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {exerciseData?.name || 'Ejercicio desconocido'}
                          </span>
                        );
                      })}
                      {workout.exercises.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{workout.exercises.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* FAB */}
        <FAB onClick={handleCreateWorkout} />
      </div>
    </Layout>
  );
}

import WorkoutForm from './components/WorkoutForm';