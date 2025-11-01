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
import { Measurement, MeasurementSchema } from '../schemas';

export class MeasurementsCollection {
  private static collectionName = 'measurements';

  static async getMeasurements(userId: string, limitCount: number = 100): Promise<Measurement[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const measurementsRef = collection(userDocRef, this.collectionName);
      const q = query(measurementsRef, orderBy('date', 'desc'), limit(limitCount));
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

  static async getMeasurement(userId: string, measurementId: string): Promise<Measurement | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const measurementDocRef = doc(userDocRef, this.collectionName, measurementId);
      const docSnap = await getDoc(measurementDocRef);

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

  static async createMeasurement(userId: string, measurementData: Omit<Measurement, 'id' | 'createdAt'>): Promise<string> {
    try {
      const now = new Date();
      const userDocRef = doc(db, 'users', userId);
      const measurementsRef = collection(userDocRef, this.collectionName);
      const docRef = doc(measurementsRef);

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

  static async updateMeasurement(userId: string, measurementId: string, updates: Partial<Omit<Measurement, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const measurementDocRef = doc(userDocRef, this.collectionName, measurementId);
      await updateDoc(measurementDocRef, updates);
    } catch (error) {
      console.error('Error updating measurement:', error);
      throw error;
    }
  }

  static async deleteMeasurement(userId: string, measurementId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const measurementDocRef = doc(userDocRef, this.collectionName, measurementId);
      await deleteDoc(measurementDocRef);
    } catch (error) {
      console.error('Error deleting measurement:', error);
      throw error;
    }
  }

  static async getMeasurementsByType(userId: string, type: string): Promise<Measurement[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const measurementsRef = collection(userDocRef, this.collectionName);
      const q = query(measurementsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return MeasurementSchema.parse({
            id: doc.id,
            ...data,
            date: data.date?.toDate(),
            createdAt: data.createdAt?.toDate(),
          });
        })
        .filter(measurement => measurement.type === type);
    } catch (error) {
      console.error('Error getting measurements by type:', error);
      throw error;
    }
  }

  static async getLatestMeasurements(userId: string): Promise<Record<string, Measurement>> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const measurementsRef = collection(userDocRef, this.collectionName);
      const q = query(measurementsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const measurements = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return MeasurementSchema.parse({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      });

      const latestMeasurements: Record<string, Measurement> = {};
      const types = ['weight', 'bodyFat', 'circumference'];

      for (const type of types) {
        const typeMeasurements = measurements.filter(m => m.type === type);
        if (typeMeasurements.length > 0) {
          latestMeasurements[type] = typeMeasurements[0];
        }
      }

      return latestMeasurements;
    } catch (error) {
      console.error('Error getting latest measurements:', error);
      throw error;
    }
  }
}