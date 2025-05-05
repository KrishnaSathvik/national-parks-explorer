const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const mime = require("mime");

// 🔐 Your Firebase service account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "national-parks-explorer-7bc55.appspot.com", // 👈 change to your bucket if different
});

const bucket = admin.storage().bucket();

const uploadThumbnail = async (filename, parkCode) => {
  const filePath = path.join(__dirname, "thumbnails", filename);
  const destination = `thumbnails/${parkCode}.jpg`;
  const contentType = mime.getType(filePath);

  const [uploadedFile] = await bucket.upload(filePath, {
    destination,
    metadata: {
      contentType,
      cacheControl: "public,max-age=31536000",
    },
  });

  await uploadedFile.makePublic(); // Optional: makes the URL accessible

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
  console.log(`✅ Uploaded ${filename} → ${publicUrl}`);
  return publicUrl;
};

// 🧪 Example usage for acad.jpg
uploadThumbnail("acad.jpg", "acad").catch(console.error);
