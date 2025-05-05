const fs = require("fs");
const admin = require("firebase-admin");

// 🔑 Load your service account credentials
const serviceAccount = require("./serviceAccountKey.json");

// 🔥 Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 📂 Load your parks.json
const parksData = JSON.parse(fs.readFileSync("parks.json", "utf-8"));

// 🔁 Upload each park
const uploadParks = async () => {
  const batch = db.batch();
  const parksCollection = db.collection("parks");

  parksData.forEach((park) => {
    const docRef = parksCollection.doc(park.id.toString());
    batch.set(docRef, park);
  });

  await batch.commit();
  console.log("✅ Successfully uploaded all parks!");
};

uploadParks().catch((error) => {
  console.error("❌ Upload failed:", error);
});
