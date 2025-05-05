// bulkUpload.js
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const parks = require('./parks.json'); // Make sure parks.json is in same folder

initializeApp({
  credential: applicationDefault()
});

const db = getFirestore();

async function uploadParks() {
  const batch = db.batch();
  const parksCollection = db.collection('parks');

  parks.forEach((park) => {
    const docRef = parksCollection.doc(park.id.toString());
    batch.set(docRef, park);
  });

  await batch.commit();
  console.log('✅ All parks uploaded to Firestore!');
}

uploadParks();
