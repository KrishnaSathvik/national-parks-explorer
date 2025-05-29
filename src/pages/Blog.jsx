import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import draftToHtml from "draftjs-to-html";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "blogs"));
        const blogList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBlogs(blogList.sort((a, b) => b.date?.seconds - a.date?.seconds));
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      }
    };

    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-pink-100 py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            ← Back to Parks
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-white p-6 sm:p-10 rounded-3xl shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-600 mb-6 text-center sm:text-left font-heading">
            📚 Travel Stories
          </h1>

          {blogs.length === 0 ? (
            <p className="text-center text-gray-500">No blog posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {blogs.map((blog) => {
                const contentHTML = (() => {
                  try {
                    const raw = typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;
                    return draftToHtml(raw);
                  } catch {
                    return "";
                  }
                })();

                const plainText = (() => {
                  const div = document.createElement("div");
                  div.innerHTML = contentHTML;
                  return div.textContent || "";
                })();

                const readTime = Math.ceil(plainText.split(" ").length / 200);

                return (
                  <Link
                    to={`/blog/${blog.slug || blog.id}`}
                    key={blog.id}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[180px] border border-gray-100"
                  >
                    <h2 className="text-xl font-heading text-pink-600 mb-2 leading-snug line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                      {plainText.slice(0, 160) + "..."}
                    </p>
                    <div className="text-xs text-gray-500 flex justify-between items-center mt-auto">
                      <span>
                        {blog.date?.seconds
                          ? new Date(blog.date.seconds * 1000).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                      <span>{readTime} min read</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
