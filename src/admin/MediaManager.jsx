import React, { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";

const MediaManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const storage = getStorage();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const folderRef = ref(storage, "park-images/");
        const result = await listAll(folderRef);

        const imageData = await Promise.all(
          result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return {
              name: itemRef.name,
              fullPath: itemRef.fullPath,
              url,
            };
          })
        );

        setImages(imageData);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleDelete = async (fullPath) => {
    const confirm = window.confirm("Are you sure you want to delete this image?");
    if (!confirm) return;

    try {
      const imageRef = ref(storage, fullPath);
      await deleteObject(imageRef);
      setImages(images.filter((img) => img.fullPath !== fullPath));
      alert("✅ Image deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("❌ Failed to delete image.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🖼 Media Manager</h1>

      {loading ? (
        <p className="text-gray-500">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500">No uploaded park images found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.fullPath}
              className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2"
            >
              <img
                src={img.url}
                alt={img.name}
                className="rounded-md w-full h-48 object-cover"
              />
              <div className="text-sm text-gray-600 break-all">{img.name}</div>
              <a
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline text-sm"
              >
                View Full Image
              </a>
              <button
                onClick={() => handleDelete(img.fullPath)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete Image
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManager;
