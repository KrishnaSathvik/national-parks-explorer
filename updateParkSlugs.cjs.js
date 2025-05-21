import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase.js';
 // make sure this file exports your config

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} = require('firebase/firestore');
const { firebaseConfig } = require('./firebase');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility to create slug from name
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // remove non-alphanumeric
    .replace(/\s+/g, '-')        // replace spaces with dashes
    .slice(0, 100);              // limit slug length

async function updateSlugs() {
  const parksRef = collection(db, 'parks');
  const snapshot = await getDocs(parksRef);

  for (const docSnap of snapshot.docs) {
    const park = docSnap.data();
    const slug = slugify(park.name);

    console.log(`✅ ${park.name} → ${slug}`);
    await updateDoc(doc(db, 'parks', docSnap.id), { slug });
  }

  console.log('🎉 All park slugs updated successfully!');
}

updateSlugs().catch(console.error);
