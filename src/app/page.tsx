'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { WorkoutSessionsCollection } from '../lib/collections/workoutSessions';
import { WorkoutsCollection } from '../lib/collections/workouts';
import { PersonalRecordsCollection } from '../lib/collections/personalRecords';
import { MeasurementsCollection } from '../lib/collections/measurements';
import { WorkoutSession, Workout, PersonalRecord, Measurement } from '../lib/schemas';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import {
  Play,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Award,
  BarChart3,
  Plus
} from 'lucide-react';
import { formatDate, formatDuration } from '../lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [latestMeasurements, setLatestMeasurements] = useState<Record<string, Measurement>>({});
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [
        sessionsData,
        recordsData,
        measurementsData,
        workoutsData
      ] = await Promise.all([
        WorkoutSessionsCollection.getRecentSessions(user!.uid, 5),
        PersonalRecordsCollection.getPersonalRecords(user!.uid),
        MeasurementsCollection.getLatestMeasurements(user!.uid),
        WorkoutsCollection.getWorkouts(user!.uid)
      ]);

      setRecentSessions(sessionsData);
      setPersonalRecords(recordsData);
      setLatestMeasurements(measurementsData);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysWorkout = () => {
    // Simple logic: return first workout (in a real app, this would be based on schedule)
    return workouts.length > 0 ? workouts[0] : null;
  };

  const getRecentPRs = () => {
    // Get most recent PRs (last 3)
    return personalRecords
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekSessions = recentSessions.filter(session =>
      session.endTime && session.endTime >= weekAgo
    );

    const totalWorkouts = thisWeekSessions.length;
    const totalDuration = thisWeekSessions.reduce((total, session) =>
      total + (session.duration || 0), 0
    );

    return { totalWorkouts, totalDuration };
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

  const todaysWorkout = getTodaysWorkout();
  const recentPRs = getRecentPRs();
  const weeklyStats = getWeeklyStats();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Hola, {user.displayName || user.email}!
            </h1>
            <p className="mt-2 text-gray-600">
              Aquí está tu resumen de fitness de hoy
            </p>
          </div>
        </div>

        {/* Today's Workout */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Entrenamiento de Hoy
            </h2>
          </CardHeader>
          <CardContent>
            {todaysWorkout ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{todaysWorkout.name}</h3>
                  <p className="text-sm text-gray-600">
                    {todaysWorkout.exercises.length} ejercicios • {formatDuration(todaysWorkout.estimatedDuration)}
                  </p>
                </div>
                <Link href={`/workouts/${todaysWorkout.id}`}>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Comenzar
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay entrenamiento programado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Crea un entrenamiento para comenzar
                </p>
                <div className="mt-4">
                  <Link href="/workouts">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ver Entrenamientos
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weekly Workouts */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entrenamientos esta semana</p>
                  <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalWorkouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Duration */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tiempo total esta semana</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(weeklyStats.totalDuration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Records */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Récords personales</p>
                  <p className="text-2xl font-bold text-gray-900">{personalRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions & PRs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Sesiones Recientes
              </h2>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay sesiones completadas aún</p>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{session.name}</p>
                        <p className="text-sm text-gray-600">
                          {session.endTime && formatDate(session.endTime)} • {formatDuration(session.duration || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">Completado</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Personal Records */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-yellow-600" />
                Récords Personales Recientes
              </h2>
            </CardHeader>
            <CardContent>
              {recentPRs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay récords personales aún</p>
              ) : (
                <div className="space-y-4">
                  {recentPRs.map((record) => (
                    <div key={record.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.type === 'maxWeight' ? 'Peso máximo' :
                           record.type === 'maxReps' ? 'Reps máximas' :
                           record.type === 'bestTime' ? 'Mejor tiempo' : 'Volumen total'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {record.value} {record.unit} • {formatDate(record.date)}
                        </p>
                      </div>
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Latest Measurements */}
        {Object.keys(latestMeasurements).length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Últimas Mediciones</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(latestMeasurements).map(([type, measurement]) => (
                  <div key={type} className="text-center">
                    <p className="text-sm font-medium text-gray-600 capitalize">
                      {type === 'weight' ? 'Peso' :
                       type === 'bodyFat' ? 'Grasa Corporal' :
                       type === 'circumference' ? 'Circunferencia' : type}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {measurement.value} {measurement.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(measurement.date)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Acciones Rápidas</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/workouts">
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Entrenamientos
                </Button>
              </Link>
              <Link href="/exercises">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ejercicios
                </Button>
              </Link>
              <Link href="/progress">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Progreso
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full">
                  <Award className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
