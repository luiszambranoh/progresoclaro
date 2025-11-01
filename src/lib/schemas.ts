import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().optional(),
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  fitnessGoals: z.object({
    weightTarget: z.number().optional(),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
    weeklyWorkouts: z.number().min(1).max(7),
  }).optional(),
  preferences: z.object({
    units: z.enum(['metric', 'imperial']),
    notifications: z.boolean(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Exercise schemas
export const ExerciseSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.enum(['strength', 'cardio', 'flexibility']),
  muscleGroups: z.array(z.string()).min(1, 'Debe seleccionar al menos un grupo muscular'),
  equipment: z.array(z.string()),
  instructions: z.array(z.string()),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Workout schemas
export const WorkoutExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().min(1),
  reps: z.number().min(1).optional(),
  weight: z.number().min(0).optional(),
  restTime: z.number().min(0),
  notes: z.string().optional(),
});

export const WorkoutSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  exercises: z.array(WorkoutExerciseSchema).min(1, 'Debe agregar al menos un ejercicio'),
  estimatedDuration: z.number().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  color: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Workout Session schemas
export const SessionSetSchema = z.object({
  reps: z.number().min(1),
  weight: z.number().min(0).optional(),
  restTime: z.number().min(0).optional(),
  completed: z.boolean(),
});

export const SessionExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(SessionSetSchema),
  notes: z.string().optional(),
});

export const WorkoutSessionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  workoutId: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  exercises: z.array(SessionExerciseSchema),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Measurement schemas
export const MeasurementSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: z.enum(['weight', 'bodyFat', 'circumference', 'other']),
  value: z.number().min(0),
  unit: z.string(),
  location: z.string().optional(),
  date: z.date(),
  notes: z.string().optional(),
  createdAt: z.date(),
});

// Personal Record schemas
export const PersonalRecordSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  exerciseId: z.string(),
  type: z.enum(['maxWeight', 'maxReps', 'bestTime', 'totalVolume']),
  value: z.number().min(0),
  unit: z.string(),
  date: z.date(),
  workoutSessionId: z.string().optional(),
  createdAt: z.date(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;
export type SessionExercise = z.infer<typeof SessionExerciseSchema>;
export type SessionSet = z.infer<typeof SessionSetSchema>;
export type Measurement = z.infer<typeof MeasurementSchema>;
export type PersonalRecord = z.infer<typeof PersonalRecordSchema>;