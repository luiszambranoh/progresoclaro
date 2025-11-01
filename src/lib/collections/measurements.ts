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
import { Measurement, MeasurementSchema } from '../schemas';

export class MeasurementsCollection {
  private static collectionName = 'measurements';

  static async getMeasurements(userId: string, limitCount: number = 100): Promise<Measurement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return MeasurementSchema.parse({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting measurements:', error);
      throw error;
    }
  }

  static async getMeasurement(measurementId: string): Promise<Measurement | null> {
    try {
      const docRef = doc(db, this.collectionName, measurementId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return MeasurementSchema.parse({
          id: docSnap.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting measurement:', error);
      throw error;
    }
  }

  static async createMeasurement(measurementData: Omit<Measurement, 'id' | 'createdAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = doc(collection(db, this.collectionName));

      const measurementDoc = {
        ...measurementData,
        createdAt: now,
      };

      await setDoc(docRef, measurementDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating measurement:', error);
      throw error;
    }
  }

  static async updateMeasurement(measurementId: string, updates: Partial<Omit<Measurement, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, measurementId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating measurement:', error);
      throw error;
    }
  }

  static async deleteMeasurement(measurementId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, measurementId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting measurement:', error);
      throw error;
    }
  }

  static async getMeasurementsByType(userId: string, type: string): Promise<Measurement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return MeasurementSchema.parse({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting measurements by type:', error);
      throw error;
    }
  }

  static async getLatestMeasurements(userId: string): Promise<Record<string, Measurement>> {
    try {
      const types = ['weight', 'bodyFat', 'circumference'];
      const latestMeasurements: Record<string, Measurement> = {};

      for (const type of types) {
        const q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          where('type', '==', type),
          orderBy('date', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          latestMeasurements[type] = MeasurementSchema.parse({
            id: doc.id,
            ...data,
            date: data.date?.toDate(),
            createdAt: data.createdAt?.toDate(),
          });
        }
      }

      return latestMeasurements;
    } catch (error) {
      console.error('Error getting latest measurements:', error);
      throw error;
    }
  }
}