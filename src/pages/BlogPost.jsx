// src/pages/BlogPost.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import draftToHtml from "draftjs-to-html";

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    const q = query(collection(db, "comments"), where("blogId", "==", id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribe();
  }, [id]);

  const isAuthor = user?.email === post?.author;
  const isAdmin = user?.email === "krishnasathvikm@gmail.com";

  const handleCommentSubmit = async () => {
    if (!user) {
      alert("Please login to comment.");
      return;
    }
    if (!newComment.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        blogId: id,
        text: newComment,
        author: user.email,
        date: serverTimestamp(),
      });
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
      alert("Failed to post comment.");
    }
  };

  if (loading)
    return <div className="p-6 text-gray-500 font-sans">Loading blog...</div>;
  if (!post)
    return <div className="p-6 text-red-500 font-sans">❌ Blog post not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-sans">
      <div className="mb-4">
        <Link to="/blog" className="text-sm text-blue-600 hover:underline">
          ← Back to Blogs
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto">
        <h1 className="text-4xl font-heading font-bold mb-3 text-gray-800">
          {post.title}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          📅 {post.date?.seconds
            ? new Date(post.date.seconds * 1000).toLocaleDateString()
            : "Unknown date"} · ✍️ {post.author}
        </p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="cover"
            className="rounded-xl w-full h-64 object-cover mb-6 shadow"
          />
        )}

        <div
          className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{
            __html: draftToHtml(
              typeof post.content === "string"
                ? JSON.parse(post.content)
                : post.content
            ),
          }}
        />

        {(isAuthor || isAdmin) && (
          <Link
            to={`/admin/edit-blog/${id}`}
            className="inline-block mt-6 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            ✏️ Edit Post
          </Link>
        )}

        <hr className="my-6" />
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">💬 Comments</h3>

          {comments.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
          )}

          <div className="space-y-4 mb-6">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 border p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-800 font-medium">{c.author}</p>
                  <span className="text-xs text-gray-400">
                    {c.date?.seconds
                      ? new Date(c.date.seconds * 1000).toLocaleString()
                      : ""}
                  </span>
                </div>
                <p className="text-sm mt-2 text-gray-700">{c.text}</p>
              </div>
            ))}
          </div>

          <textarea
            className="w-full border rounded p-3 text-sm"
            rows="3"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            onClick={handleCommentSubmit}
            className="mt-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded text-sm"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
