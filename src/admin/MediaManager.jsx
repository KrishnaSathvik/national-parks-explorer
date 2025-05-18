import React, { useEffect, useState } from "react";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { useToast } from "../context/ToastContext";

const MediaManager = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const fetchImages = async () => {
    const storage = getStorage();
    const listRef = ref(storage, "uploads/");
    try {
      const res = await listAll(listRef);
      const urls = await Promise.all(
        res.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return { name: item.name, url };
        })
      );
      setImages(urls);
    } catch (err) {
      console.error("Error loading images:", err);
      showToast("❌ Failed to fetch images", "error");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${file.name}`);
    setUploading(true);

    try {
      await uploadBytes(storageRef, file);
      showToast("✅ Image uploaded!", "success");
      fetchImages();
    } catch (err) {
      console.error("Upload error:", err);
      showToast("❌ Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name) => {
    const storage = getStorage();
    const imageRef = ref(storage, `uploads/${name}`);
    try {
      await deleteObject(imageRef);
      showToast("🗑️ Image deleted", "success");
      setImages((prev) => prev.filter((img) => img.name !== name));
    } catch (err) {
      console.error("Delete error:", err);
      showToast("❌ Failed to delete image", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-green-700 mb-6 text-center">
        🖼️ Media Manager
      </h1>

      <div className="bg-white border rounded-xl p-6 shadow mb-8">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload New Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="block w-full border border-gray-300 p-2 rounded-md text-sm"
        />
        {uploading && (
          <p className="text-sm text-gray-500 mt-2">Uploading...</p>
        )}
      </div>

      {images.length === 0 ? (
        <p className="text-center text-gray-400">🚫 No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.name}
              className="relative bg-white rounded-lg border p-2 shadow hover:shadow-md"
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-40 object-cover rounded-md"
              />
              <button
                onClick={() => handleDelete(img.name)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManager;
