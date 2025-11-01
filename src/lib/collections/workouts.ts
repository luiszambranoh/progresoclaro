import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Workout, WorkoutSchema } from '../schemas';

export class WorkoutsCollection {
  private static collectionName = 'workouts';

  static async getWorkouts(userId: string): Promise<Workout[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const workoutsRef = collection(userDocRef, this.collectionName);
      const q = query(workoutsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return WorkoutSchema.parse({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting workouts:', error);
      throw error;
    }
  }

  static async getWorkout(userId: string, workoutId: string): Promise<Workout | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const workoutDocRef = doc(userDocRef, this.collectionName, workoutId);
      const docSnap = await getDoc(workoutDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return WorkoutSchema.parse({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting workout:', error);
      throw error;
    }
  }

  static async createWorkout(userId: string, workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const userDocRef = doc(db, 'users', userId);
      const workoutsRef = collection(userDocRef, this.collectionName);
      const docRef = doc(workoutsRef);

      const workoutDoc = {
        ...workoutData,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, workoutDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  }

  static async updateWorkout(userId: string, workoutId: string, updates: Partial<Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const workoutDocRef = doc(userDocRef, this.collectionName, workoutId);
      await updateDoc(workoutDocRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  }

  static async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const workoutDocRef = doc(userDocRef, this.collectionName, workoutId);
      await deleteDoc(workoutDocRef);
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }

  static async getWorkoutsByDifficulty(userId: string, difficulty: string): Promise<Workout[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const workoutsRef = collection(userDocRef, this.collectionName);
      const q = query(workoutsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return WorkoutSchema.parse({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        })
        .filter(workout => workout.difficulty === difficulty);
    } catch (error) {
      console.error('Error getting workouts by difficulty:', error);
      throw error;
    }
  }
}