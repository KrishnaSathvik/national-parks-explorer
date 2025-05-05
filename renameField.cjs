const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function renameFieldInParks() {
  const parksRef = db.collection("parks");
  const snapshot = await parksRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.npsCode && !data.parkCode) {
      await parksRef.doc(doc.id).update({
        parkCode: data.npsCode,
        npsCode: FieldValue.delete(), // Delete old field
      });
      console.log(`✅ Updated ${doc.id}: npsCode → parkCode`);
    }
  }

  console.log("🎉 All done!");
}

renameFieldInParks();
