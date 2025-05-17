// src/pages/Blog.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import draftToHtml from "draftjs-to-html";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const loadBlogs = async () => {
      const snapshot = await getDocs(collection(db, "blogs"));
      const blogList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBlogs(blogList.sort((a, b) => b.date?.seconds - a.date?.seconds));
    };
    loadBlogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans">
      {/* Back Button */}
      <div className="mb-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to Parks
        </Link>
      </div>

      {/* Page Header */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-600 mb-6 text-center sm:text-left">
        📚 Travel Stories
      </h1>

      {blogs.length === 0 ? (
        <p className="text-center text-gray-500">No blog posts yet.</p>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <Link
              to={`/blog/${blog.id}`}
              key={blog.id}
              className="block bg-white hover:bg-gray-50 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 transition transform hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-pink-600 leading-snug line-clamp-2">
                {blog.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(blog.date?.seconds * 1000).toLocaleDateString()} · {blog.author}
              </p>
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                {(() => {
                  try {
                    const raw = typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;
                    const html = draftToHtml(raw);
                    const div = document.createElement("div");
                    div.innerHTML = html;
                    return div.textContent.slice(0, 200) + "...";
                  } catch {
                    return "No preview available.";
                  }
                })()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;
