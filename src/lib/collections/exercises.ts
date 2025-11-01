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
import { Exercise, ExerciseSchema } from '../schemas';

export class ExercisesCollection {
  private static collectionName = 'exercises';

  static async getExercises(userId: string): Promise<Exercise[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const exercisesRef = collection(userDocRef, this.collectionName);
      const q = query(exercisesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return ExerciseSchema.parse({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting exercises:', error);
      throw error;
    }
  }

  static async getExercise(userId: string, exerciseId: string): Promise<Exercise | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const exerciseDocRef = doc(userDocRef, this.collectionName, exerciseId);
      const docSnap = await getDoc(exerciseDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return ExerciseSchema.parse({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting exercise:', error);
      throw error;
    }
  }

  static async createExercise(userId: string, exerciseData: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const userDocRef = doc(db, 'users', userId);
      const exercisesRef = collection(userDocRef, this.collectionName);
      const docRef = doc(exercisesRef);

      const exerciseDoc = {
        ...exerciseData,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, exerciseDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  }

  static async updateExercise(userId: string, exerciseId: string, updates: Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const exerciseDocRef = doc(userDocRef, this.collectionName, exerciseId);
      await updateDoc(exerciseDocRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  }

  static async deleteExercise(userId: string, exerciseId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const exerciseDocRef = doc(userDocRef, this.collectionName, exerciseId);
      await deleteDoc(exerciseDocRef);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  }

  static async getExercisesByCategory(userId: string, category: string): Promise<Exercise[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const exercisesRef = collection(userDocRef, this.collectionName);
      const q = query(exercisesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return ExerciseSchema.parse({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        })
        .filter(exercise => exercise.category === category);
    } catch (error) {
      console.error('Error getting exercises by category:', error);
      throw error;
    }
  }

  static async searchExercises(userId: string, searchTerm: string, limitCount: number = 20): Promise<Exercise[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const exercisesRef = collection(userDocRef, this.collectionName);
      const q = query(exercisesRef, orderBy('name'), limit(limitCount));
      const querySnapshot = await getDocs(q);

      const exercises = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return ExerciseSchema.parse({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });

      // Client-side filtering for search term
      return exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups.some(group => group.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching exercises:', error);
      throw error;
    }
  }
}