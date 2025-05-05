// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "national-parks-explorer-7bc55.firebaseapp.com",
  projectId: "national-parks-explorer-7bc55",
  storageBucket: "national-parks-explorer-7bc55.appspot.com", // ✅ Fixed: should be .app**spot**.com
  messagingSenderId: "683155277657",
  appId: "1:683155277657:web:edafbd29d36fb7774fee48",
  measurementId: "G-530THD6VS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export once
export { db, storage };
