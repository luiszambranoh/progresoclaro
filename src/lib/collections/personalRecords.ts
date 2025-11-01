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
import { PersonalRecord, PersonalRecordSchema } from '../schemas';

export class PersonalRecordsCollection {
  private static collectionName = 'personalRecords';

  static async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const recordsRef = collection(userDocRef, this.collectionName);
      const q = query(recordsRef, orderBy('date', 'desc'));
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

  static async getPersonalRecord(userId: string, recordId: string): Promise<PersonalRecord | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const recordDocRef = doc(userDocRef, this.collectionName, recordId);
      const docSnap = await getDoc(recordDocRef);

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

  static async createPersonalRecord(userId: string, recordData: Omit<PersonalRecord, 'id' | 'createdAt'>): Promise<string> {
    try {
      const now = new Date();
      const userDocRef = doc(db, 'users', userId);
      const recordsRef = collection(userDocRef, this.collectionName);
      const docRef = doc(recordsRef);

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

  static async updatePersonalRecord(userId: string, recordId: string, updates: Partial<Omit<PersonalRecord, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const recordDocRef = doc(userDocRef, this.collectionName, recordId);
      await updateDoc(recordDocRef, updates);
    } catch (error) {
      console.error('Error updating personal record:', error);
      throw error;
    }
  }

  static async deletePersonalRecord(userId: string, recordId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const recordDocRef = doc(userDocRef, this.collectionName, recordId);
      await deleteDoc(recordDocRef);
    } catch (error) {
      console.error('Error deleting personal record:', error);
      throw error;
    }
  }

  static async getPersonalRecordsByExercise(userId: string, exerciseId: string): Promise<PersonalRecord[]> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const recordsRef = collection(userDocRef, this.collectionName);
      const q = query(recordsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return PersonalRecordSchema.parse({
            id: doc.id,
            ...data,
            date: data.date?.toDate(),
            createdAt: data.createdAt?.toDate(),
          });
        })
        .filter(record => record.exerciseId === exerciseId);
    } catch (error) {
      console.error('Error getting personal records by exercise:', error);
      throw error;
    }
  }

  static async getBestPersonalRecords(userId: string): Promise<Record<string, PersonalRecord>> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const recordsRef = collection(userDocRef, this.collectionName);
      const q = query(recordsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const records = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return PersonalRecordSchema.parse({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      });

      const bestRecords: Record<string, PersonalRecord> = {};

      records.forEach(record => {
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

        await this.createPersonalRecord(userId, recordData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking and updating personal record:', error);
      throw error;
    }
  }
}