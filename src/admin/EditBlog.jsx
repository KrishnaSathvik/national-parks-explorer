// src/admin/EditBlog.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [slug, setSlug] = useState("");
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    const loadPost = async () => {
      try {
        const docSnap = await getDoc(doc(db, "blogs", id));
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (
            user &&
            user.email !== data.author &&
            user.email !== "krishnasathvikm@gmail.com"
          ) {
            alert("⛔ You are not authorized to edit this blog.");
            navigate(`/blog/${id}`);
            return;
          }

          setTitle(data.title);
          setImageUrl(data.imageUrl || "");
          setTags(data.tags || []);
          setSlug(data.slug || "");

          try {
            const rawContent = JSON.parse(data.content);
            const contentState = convertFromRaw(rawContent);
            setEditorState(EditorState.createWithContent(contentState));
          } catch {
            const contentState = ContentState.createFromText(data.content || "");
            setEditorState(EditorState.createWithContent(contentState));
          }
        } else {
          alert("Blog post not found.");
          navigate("/blog");
        }
      } catch (err) {
        console.error("Error loading blog:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, navigate, user]);

  const handleUpdate = async () => {
    try {
      const rawContent = convertToRaw(editorState.getCurrentContent());
      await updateDoc(doc(db, "blogs", id), {
        title,
        imageUrl,
        tags,
        slug, 
        content: JSON.stringify(rawContent),
        lastEdited: serverTimestamp(),
      });
      alert("✅ Blog updated!");
      navigate(`/blog/${id}`);
    } catch (err) {
      console.error("❌ Update failed:", err.message);
      alert("Failed to update blog.");
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to discard changes?")) {
      navigate(`/blog/${id}`);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const wordCount = editorState.getCurrentContent().getPlainText(" ").trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  const uploadImageCallback = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, `blog_images/content-${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ data: { link: downloadURL } });
        }
      );
    });
  };

  if (loading) return <div className="p-6 text-gray-500 font-sans">Loading blog editor...</div>;

  return (
    <div className="min-h-screen px-4 py-8 bg-yellow-50 font-sans">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">✏️ Edit Blog Post</h1>

        <label className="block mb-2 font-semibold">Title</label>
        <input
          type="text"
          className="w-full p-3 border rounded-lg mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="block mb-2 font-semibold">Slug (URL-friendly)</label>
        <input
          type="text"
          className="w-full p-3 border rounded-lg mb-4"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated-from-title"
        />

        <label className="block mb-2 font-semibold">Tags</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              #{tag}
              <button onClick={() => removeTag(tag)} className="text-pink-500 hover:text-pink-700">
                &times;
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          className="w-full p-3 border rounded-lg mb-4"
          placeholder="Type tag and press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleTagAdd())}
        />

        <label className="block mb-2 font-semibold">Content</label>
        <div className="border rounded-lg bg-white mb-6">
          <Editor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            toolbarClassName="sticky top-0 z-10 bg-white border-b"
            wrapperClassName="demo-wrapper"
            editorClassName="p-4 max-h-[400px] overflow-y-auto"
            toolbar={{
              options: ["inline", "blockType", "list", "link", "emoji", "history", "image"],
              image: {
                uploadCallback: uploadImageCallback,
                previewImage: true,
                alt: { present: true, mandatory: false },
              },
            }}
          />
        </div>

        <div className="text-sm text-gray-500 mb-6">
          📝 Word Count: {wordCount} · ⏱️ Est. Read Time: {readTime} min
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">🔍 Live Preview</h2>
          <div
            className="prose max-w-none text-gray-800"
            dangerouslySetInnerHTML={{
              __html: draftToHtml(convertToRaw(editorState.getCurrentContent())),
            }}
          />
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleUpdate}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            💾 Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
