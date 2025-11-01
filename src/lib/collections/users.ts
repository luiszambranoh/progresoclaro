import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, UserSchema } from '../schemas';

export class UsersCollection {
  private static collectionName = 'users';

  static async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return UserSchema.parse({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const userId = userData.uid;

      const userDoc = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = doc(db, this.collectionName, userId);
      await setDoc(docRef, userDoc);

      return userId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return UserSchema.parse({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }
}