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
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { WorkoutSession, WorkoutSessionSchema } from '../schemas';

export class WorkoutSessionsCollection {
  private static collectionName = 'workoutSessions';

  static async getWorkoutSessions(userId: string, limitCount: number = 50): Promise<WorkoutSession[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const sessionsRef = collection(userDocRef, this.collectionName);
      const q = query(sessionsRef, orderBy('startTime', 'desc'), limit(limitCount));
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

  static async getWorkoutSession(userId: string, sessionId: string): Promise<WorkoutSession | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const sessionDocRef = doc(userDocRef, this.collectionName, sessionId);
      const docSnap = await getDoc(sessionDocRef);

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

  static async createWorkoutSession(userId: string, sessionData: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const userDocRef = doc(db, 'users', userId);
      const sessionsRef = collection(userDocRef, this.collectionName);
      const docRef = doc(sessionsRef);

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

  static async updateWorkoutSession(userId: string, sessionId: string, updates: Partial<Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const sessionDocRef = doc(userDocRef, this.collectionName, sessionId);
      await updateDoc(sessionDocRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating workout session:', error);
      throw error;
    }
  }

  static async deleteWorkoutSession(userId: string, sessionId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const sessionDocRef = doc(userDocRef, this.collectionName, sessionId);
      await deleteDoc(sessionDocRef);
    } catch (error) {
      console.error('Error deleting workout session:', error);
      throw error;
    }
  }

  static async getRecentSessions(userId: string, limitCount: number = 5): Promise<WorkoutSession[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const sessionsRef = collection(userDocRef, this.collectionName);
      const q = query(sessionsRef, orderBy('endTime', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return WorkoutSessionSchema.parse({
            id: doc.id,
            ...data,
            startTime: data.startTime?.toDate(),
            endTime: data.endTime?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        })
        .filter(session => session.completed);
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      throw error;
    }
  }

  static async getSessionsByWorkout(userId: string, workoutId: string): Promise<WorkoutSession[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const sessionsRef = collection(userDocRef, this.collectionName);
      const q = query(sessionsRef, orderBy('startTime', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return WorkoutSessionSchema.parse({
            id: doc.id,
            ...data,
            startTime: data.startTime?.toDate(),
            endTime: data.endTime?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        })
        .filter(session => session.workoutId === workoutId);
    } catch (error) {
      console.error('Error getting sessions by workout:', error);
      throw error;
    }
  }
}