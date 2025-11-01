'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { WorkoutsCollection } from '../../../lib/collections/workouts';
import { WorkoutSessionsCollection } from '../../../lib/collections/workoutSessions';
import { ExercisesCollection } from '../../../lib/collections/exercises';
import { PersonalRecordsCollection } from '../../../lib/collections/personalRecords';
import { Workout, Exercise, WorkoutSession, SessionExercise, SessionSet } from '../../../lib/schemas';
import Layout from '../../../components/layout/Layout';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  ArrowLeft,
  Timer
} from 'lucide-react';
import { formatDuration } from '../../../lib/utils';

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    if (user && workoutId) {
      loadWorkout();
      loadExercises();
    }
  }, [user, workoutId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setRestTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer, restTimeLeft]);

  const loadWorkout = async () => {
    try {
      const workoutData = await WorkoutsCollection.getWorkout(workoutId);
      if (workoutData) {
        setWorkout(workoutData);
        initializeSessionExercises(workoutData);
      }
    } catch (error) {
      console.error('Error loading workout:', error);
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

  const initializeSessionExercises = (workout: Workout) => {
    const exercises = workout.exercises.map(workoutExercise => ({
      exerciseId: workoutExercise.exerciseId,
      sets: Array.from({ length: workoutExercise.sets }, (_, index) => ({
        reps: workoutExercise.reps || 0,
        weight: workoutExercise.weight || undefined,
        restTime: workoutExercise.restTime,
        completed: false,
      })),
      notes: '',
    }));
    setSessionExercises(exercises);
  };

  const startSession = () => {
    setSessionActive(true);
    setSessionStartTime(new Date());
  };

  const pauseSession = () => {
    setSessionActive(false);
  };

  const resumeSession = () => {
    setSessionActive(true);
  };

  const completeSet = async (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...sessionExercises];
    updatedExercises[exerciseIndex].sets[setIndex].completed = true;

    // Check for personal record
    const exerciseData = exercises.find(e => e.id === updatedExercises[exerciseIndex].exerciseId);
    const currentSet = updatedExercises[exerciseIndex].sets[setIndex];

    if (exerciseData && currentSet.weight && currentSet.reps) {
      try {
        const isNewRecord = await PersonalRecordsCollection.checkAndUpdatePersonalRecord(
          user!.uid,
          exerciseData.id!,
          'maxWeight',
          currentSet.weight,
          'kg'
        );
        if (isNewRecord) {
          alert(`¡Nuevo récord personal en ${exerciseData.name}: ${currentSet.weight}kg!`);
        }
      } catch (error) {
        console.error('Error checking personal record:', error);
      }
    }

    setSessionExercises(updatedExercises);

    // Start rest timer if not the last set
    const currentWorkoutExercise = workout!.exercises[exerciseIndex];
    if (setIndex < currentWorkoutExercise.sets - 1) {
      setRestTimer(currentWorkoutExercise.restTime);
      setRestTimeLeft(currentWorkoutExercise.restTime);
    }

    // Move to next set or exercise
    if (setIndex < currentWorkoutExercise.sets - 1) {
      setCurrentSetIndex(setIndex + 1);
    } else if (exerciseIndex < workout!.exercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
      setCurrentSetIndex(0);
    }
  };

  const finishSession = async () => {
    if (!workout || !sessionStartTime) return;

    try {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60);

      await WorkoutSessionsCollection.createWorkoutSession({
        userId: user!.uid,
        workoutId,
        name: workout.name,
        exercises: sessionExercises,
        startTime: sessionStartTime,
        endTime,
        duration,
        completed: true,
      });

      setSessionCompleted(true);
      setSessionActive(false);
    } catch (error) {
      console.error('Error finishing session:', error);
      alert('Error al finalizar la sesión');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando entrenamiento...</p>
        </div>
      </Layout>
    );
  }

  if (!workout) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Entrenamiento no encontrado</p>
          <Button onClick={() => router.push('/workouts')} className="mt-4">
            Volver a Entrenamientos
          </Button>
        </div>
      </Layout>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentExerciseData = exercises.find(e => e.id === currentExercise?.exerciseId);
  const currentSet = sessionExercises[currentExerciseIndex]?.sets[currentSetIndex];

  if (sessionCompleted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              ¡Entrenamiento Completado!
            </h2>
            <p className="mt-2 text-gray-600">
              Has terminado tu sesión de {workout.name}
            </p>
            <div className="mt-6 space-x-4">
              <Button onClick={() => router.push('/workouts')}>
                Ver Entrenamientos
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Ir al Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/workouts')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workout.name}</h1>
              <p className="text-gray-600">Sesión de entrenamiento</p>
            </div>
          </div>

          {!sessionActive && !sessionCompleted && (
            <Button onClick={startSession}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          )}

          {sessionActive && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={pauseSession}>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button>
              <Button onClick={finishSession}>
                <Square className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            </div>
          )}
        </div>

        {/* Session Timer */}
        {sessionActive && sessionStartTime && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Timer className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-2xl font-mono">
                  {formatDuration(Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60))}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rest Timer */}
        {restTimer && restTimeLeft > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-orange-800">Tiempo de Descanso</h3>
                <div className="text-4xl font-mono text-orange-600 mt-2">
                  {Math.floor(restTimeLeft / 60)}:{(restTimeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Exercise */}
        {sessionActive && currentExercise && currentExerciseData && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Ejercicio Actual: {currentExerciseData.name}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentSetIndex + 1}</div>
                  <div className="text-sm text-gray-600">Serie Actual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentExercise.reps || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Repeticiones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentExercise.weight || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Peso (kg)</div>
                </div>
              </div>

              {!currentSet?.completed && (
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={() => completeSet(currentExerciseIndex, currentSetIndex)}
                    className="px-8"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Completar Serie
                  </Button>
                </div>
              )}

              {currentSet?.completed && (
                <div className="text-center text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Serie completada</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Workout Overview */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Resumen del Entrenamiento</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workout.exercises.map((exercise, exerciseIndex) => {
                const exerciseData = exercises.find(e => e.id === exercise.exerciseId);
                const sessionExercise = sessionExercises[exerciseIndex];

                return (
                  <div key={exerciseIndex} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{exerciseData?.name || 'Ejercicio desconocido'}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Target className="h-4 w-4" />
                        <span>{exercise.sets} series</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {sessionExercise?.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className={`text-center py-2 px-3 rounded text-sm font-medium ${
                            set.completed
                              ? 'bg-green-100 text-green-800'
                              : exerciseIndex === currentExerciseIndex && setIndex === currentSetIndex && sessionActive
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {setIndex + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}