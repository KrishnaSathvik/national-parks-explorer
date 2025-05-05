const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();
const enhancedParks = require("./parks-enhanced.json");

async function uploadEnhancedParks() {
  for (const park of enhancedParks) {
    const ref = db.collection("parks").doc(park.id.toString());
    await ref.set(park, { merge: true }); // merge to retain old fields if any
    console.log(`✅ Uploaded: ${park.name}`);
  }

  console.log("🎉 All enhanced park data uploaded.");
}

uploadEnhancedParks();
