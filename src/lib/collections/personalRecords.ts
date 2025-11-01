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
import { PersonalRecord, PersonalRecordSchema } from '../schemas';

export class PersonalRecordsCollection {
  private static collectionName = 'personalRecords';

  static async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return PersonalRecordSchema.parse({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting personal records:', error);
      throw error;
    }
  }

  static async getPersonalRecord(recordId: string): Promise<PersonalRecord | null> {
    try {
      const docRef = doc(db, this.collectionName, recordId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return PersonalRecordSchema.parse({
          id: docSnap.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting personal record:', error);
      throw error;
    }
  }

  static async createPersonalRecord(recordData: Omit<PersonalRecord, 'id' | 'createdAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = doc(collection(db, this.collectionName));

      const recordDoc = {
        ...recordData,
        createdAt: now,
      };

      await setDoc(docRef, recordDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating personal record:', error);
      throw error;
    }
  }

  static async updatePersonalRecord(recordId: string, updates: Partial<Omit<PersonalRecord, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, recordId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating personal record:', error);
      throw error;
    }
  }

  static async deletePersonalRecord(recordId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, recordId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting personal record:', error);
      throw error;
    }
  }

  static async getPersonalRecordsByExercise(userId: string, exerciseId: string): Promise<PersonalRecord[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('exerciseId', '==', exerciseId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return PersonalRecordSchema.parse({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      });
    } catch (error) {
      console.error('Error getting personal records by exercise:', error);
      throw error;
    }
  }

  static async getBestPersonalRecords(userId: string): Promise<Record<string, PersonalRecord>> {
    try {
      const exercisesQuery = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('exerciseId'),
        orderBy('value', 'desc')
      );
      const querySnapshot = await getDocs(exercisesQuery);

      const bestRecords: Record<string, PersonalRecord> = {};

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const record = PersonalRecordSchema.parse({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });

        if (!bestRecords[record.exerciseId] || record.value > bestRecords[record.exerciseId].value) {
          bestRecords[record.exerciseId] = record;
        }
      });

      return bestRecords;
    } catch (error) {
      console.error('Error getting best personal records:', error);
      throw error;
    }
  }

  static async checkAndUpdatePersonalRecord(
    userId: string,
    exerciseId: string,
    type: 'maxWeight' | 'maxReps' | 'bestTime' | 'totalVolume',
    value: number,
    unit: string,
    workoutSessionId?: string
  ): Promise<boolean> {
    try {
      const existingRecords = await this.getPersonalRecordsByExercise(userId, exerciseId);
      const existingRecord = existingRecords.find(record => record.type === type);

      const isNewRecord = !existingRecord || value > existingRecord.value;

      if (isNewRecord) {
        const recordData = {
          userId,
          exerciseId,
          type,
          value,
          unit,
          date: new Date(),
          workoutSessionId,
        };

        await this.createPersonalRecord(recordData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking and updating personal record:', error);
      throw error;
    }
  }
}