import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD5ZKFGyDVvRoVpMlarye-izLDobRffQ48",
  authDomain: "progreso-claro.firebaseapp.com",
  projectId: "progreso-claro",
  storageBucket: "progreso-claro.firebasestorage.app",
  messagingSenderId: "592810390747",
  appId: "1:592810390747:web:0c76279c81bfa1f72548fe",
  measurementId: "G-55BEDT8P5R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;