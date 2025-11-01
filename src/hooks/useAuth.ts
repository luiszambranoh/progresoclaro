'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../lib/auth';
import { UsersCollection } from '../lib/collections/users';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await UsersCollection.getUser(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
  };
}