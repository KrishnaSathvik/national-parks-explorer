// ✅ Blog.jsx (updated with font improvements)
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
      <div className="mb-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to Parks
        </Link>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-600 mb-6 text-center sm:text-left font-heading">
        📚 Travel Stories
      </h1>

      {blogs.length === 0 ? (
        <p className="text-center text-gray-500">No blog posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <Link
              to={`/blog/${blog.id}`}
              key={blog.id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[180px]"
            >
              <h2 className="text-xl font-heading text-pink-600 mb-2 leading-snug line-clamp-2">
                {blog.title}
              </h2>
              <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                {(() => {
                  try {
                    const raw = typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;
                    const html = draftToHtml(raw);
                    const div = document.createElement("div");
                    div.innerHTML = html;
                    return div.textContent.slice(0, 160) + "...";
                  } catch {
                    return "No preview available.";
                  }
                })()}
              </p>
              <div className="text-xs text-gray-500 flex justify-between items-center mt-auto">
                <span>{new Date(blog.date?.seconds * 1000).toLocaleDateString()}</span>
                <span>
                  {(() => {
                    const wordCount = draftToHtml(
                      typeof blog.content === "string"
                        ? JSON.parse(blog.content)
                        : blog.content
                    ).split(" ").length;
                    return `${Math.ceil(wordCount / 200)} min read`;
                  })()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;