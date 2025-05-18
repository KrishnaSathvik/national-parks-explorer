import React, { useState } from "react";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../context/ToastContext";

const AdminBlogEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async () => {
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const htmlContent = draftToHtml(rawContentState);

    if (!title.trim() || !htmlContent.trim()) {
      showToast("❌ Title and content cannot be empty.", "error");
      return;
    }

    try {
      await addDoc(collection(db, "blogs"), {
        title: title.trim(),
        content: rawContentState,
        date: serverTimestamp(),
        author: "krishnasathvikm@gmail.com",
      });

      showToast("✅ Blog post published!", "success");
      setEditorState(EditorState.createEmpty());
      setTitle("");
    } catch (err) {
      console.error("Error saving blog:", err);
      showToast("❌ Failed to save blog.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-pink-600 mb-6 text-center">
        📝 Create New Blog Post
      </h1>

      <input
        type="text"
        placeholder="Enter blog title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
      />

      <div className="bg-white border rounded-xl p-3 shadow mb-6">
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          wrapperClassName="demo-wrapper"
          editorClassName="min-h-[300px] px-4 py-2"
          toolbarClassName="border-b"
        />
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-3 rounded-full shadow transition"
        >
          🚀 Publish Blog
        </button>
      </div>
    </div>
  );
};

export default AdminBlogEditor;
