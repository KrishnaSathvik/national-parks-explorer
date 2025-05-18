import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { db } from "../firebase";
import { useToast } from "../context/ToastContext";

const EditBlog = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPost(data);
          setTitle(data.title);
          setEditorState(EditorState.createWithContent(convertFromRaw(data.content)));
        } else {
          showToast("❌ Blog not found", "error");
        }
      } catch (err) {
        console.error("Error loading blog:", err);
        showToast("❌ Failed to load blog", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, showToast]);

  const handleSave = async () => {
    const rawContent = convertToRaw(editorState.getCurrentContent());
    try {
      await updateDoc(doc(db, "blogs", id), {
        title: title.trim(),
        content: rawContent,
      });
      showToast("✅ Blog updated successfully!", "success");
      navigate("/blog/" + id);
    } catch (err) {
      console.error("Error updating blog:", err);
      showToast("❌ Failed to update blog", "error");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 p-10 font-sans">
        ⏳ Loading blog post...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-green-700 mb-6 text-center">
        ✏️ Edit Blog Post
      </h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
        placeholder="Blog title"
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
          onClick={handleSave}
          className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-3 rounded-full shadow transition"
        >
          💾 Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditBlog;
