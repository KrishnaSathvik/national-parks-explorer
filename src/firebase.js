// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "national-parks-explorer-7bc55.firebaseapp.com",
  projectId: "national-parks-explorer-7bc55",
  storageBucket: "national-parks-explorer-7bc55.appspot.com",
  messagingSenderId: "683155277657",
  appId: "1:683155277657:web:edafbd29d36fb7774fee48",
  measurementId: "G-530THD6VS0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
