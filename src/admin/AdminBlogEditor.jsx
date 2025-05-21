// src/admin/AdminBlogEditor.jsx
import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import {
  EditorState,
  convertToRaw,
  ContentState,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";


const AdminBlogEditor = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [submitting, setSubmitting] = useState(false);

  const wordCount = editorState.getCurrentContent().getPlainText(" ").trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 100);

const handlePost = async () => {
  setSubmitting(true);
  try {
    const rawContent = convertToRaw(editorState.getCurrentContent());
    const slug = slugify(title);

    const newDoc = await addDoc(collection(db, "blogs"), {
      title,
      tags,
      slug,
      content: JSON.stringify(rawContent),
      author: user.email,
      date: serverTimestamp(),
    });

    alert("✅ Blog posted!");
    navigate(`/blog/${slug}`);
  } catch (err) {
    console.error("Error posting blog:", err.message);
    alert("❌ Failed to post blog.");
  } finally {
    setSubmitting(false);
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

  return (
    <div className="min-h-screen px-4 py-8 bg-yellow-50 font-sans">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">✍️ Write a New Blog</h1>

        <label className="block mb-2 font-semibold">Title</label>
        <input
          type="text"
          className="w-full p-3 border rounded-lg mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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

        <button
          onClick={handlePost}
          disabled={submitting}
          className="mt-8 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          {submitting ? "Posting..." : "📤 Publish Blog"}
        </button>
      </div>
    </div>
  );
};

export default AdminBlogEditor;
