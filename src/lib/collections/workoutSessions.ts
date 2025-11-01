import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { WorkoutSession, WorkoutSessionSchema } from '../schemas';

export class WorkoutSessionsCollection {
  private static collectionName = 'workoutSessions';

  static async getWorkoutSessions(userId: string, limitCount: number = 50): Promise<WorkoutSession[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('startTime', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return WorkoutSessionSchema.parse({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting workout sessions:', error);
      throw error;
    }
  }

  static async getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
    try {
      const docRef = doc(db, this.collectionName, sessionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return WorkoutSessionSchema.parse({
          id: docSnap.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting workout session:', error);
      throw error;
    }
  }

  static async createWorkoutSession(sessionData: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = doc(collection(db, this.collectionName));

      const sessionDoc = {
        ...sessionData,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, sessionDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating workout session:', error);
      throw error;
    }
  }

  static async updateWorkoutSession(sessionId: string, updates: Partial<Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, sessionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating workout session:', error);
      throw error;
    }
  }

  static async deleteWorkoutSession(sessionId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, sessionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting workout session:', error);
      throw error;
    }
  }

  static async getRecentSessions(userId: string, limitCount: number = 5): Promise<WorkoutSession[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('completed', '==', true),
        orderBy('endTime', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return WorkoutSessionSchema.parse({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      throw error;
    }
  }

  static async getSessionsByWorkout(userId: string, workoutId: string): Promise<WorkoutSession[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('workoutId', '==', workoutId),
        orderBy('startTime', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return WorkoutSessionSchema.parse({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting sessions by workout:', error);
      throw error;
    }
  }
}