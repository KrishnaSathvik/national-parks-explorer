// src/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export default app;



-----------------------------------------------------------


/*

VITE_FIREBASE_API_KEY=***REMOVED***
VITE_FIREBASE_AUTH_DOMAIN=national-parks-explorer-7bc55.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=national-parks-explorer-7bc55
VITE_FIREBASE_STORAGE_BUCKET=national-parks-explorer-7bc55.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=683155277657
VITE_FIREBASE_APP_ID=1:683155277657:web:edafbd29d36fb7774fee48


*/