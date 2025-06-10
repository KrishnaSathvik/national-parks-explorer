import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  doc,
  getDocs,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import draftToHtml from "draftjs-to-html";
import ShareButtons from "../components/ShareButtons";
import useIsMobile from "../hooks/useIsMobile";
import FadeInWrapper from "../components/FadeInWrapper";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookmark,
  FaBookOpen,
  FaClock,
  FaComment,
  FaEdit,
  FaEye,
  FaHeart,
  FaMapMarkerAlt,
  FaPrint,
  FaRegBookmark,
  FaRegHeart,
  FaRoute,
  FaShare,
  FaThumbsUp,
  FaTimes,
  FaUser,
  FaChevronRight,
  FaQuoteLeft,
  FaCalendarAlt,
  FaTag,
  FaLightbulb,
  FaCamera,
  FaInfoCircle,
  FaSave,
  FaReply
} from "react-icons/fa";

// Reading Progress Bar Component
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
            style={{ width: `${progress}%` }}
        />
      </div>
  );
};

// Table of Contents Component
const TableOfContents = ({ content, isVisible, onToggle }) => {
  const [headings, setHeadings] = useState([]);
  const { isMobile } = useIsMobile();

  useEffect(() => {
    if (!content) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4');

    const headingsList = Array.from(headingElements).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1)),
      element: heading
    }));

    setHeadings(headingsList);

    // Add IDs to actual headings in the content
    const actualHeadings = document.querySelectorAll('.blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4');
    actualHeadings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });
  }, [content]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (isMobile) onToggle(); // Close TOC on mobile after click
    }
  };

  if (headings.length === 0) return null;

  return (
      <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? -20 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? -20 : 0 }}
                className={`${
                    isMobile
                        ? 'fixed top-16 left-4 right-4 z-40 bg-white rounded-2xl shadow-xl border border-gray-200'
                        : 'sticky top-24 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200'
                } p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaBookOpen className="text-purple-500" />
                  Table of Contents
                </h4>
                {isMobile && (
                    <button onClick={onToggle} className="text-gray-500 hover:text-gray-700">
                      <FaTimes />
                    </button>
                )}
              </div>

              <nav className="space-y-2 max-h-64 overflow-y-auto">
                {headings.map((heading) => (
                    <button
                        key={heading.id}
                        onClick={() => scrollToHeading(heading.id)}
                        className={`block w-full text-left py-1 px-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition text-sm ${
                            heading.level === 1 ? 'font-semibold' :
                                heading.level === 2 ? 'ml-2 font-medium' :
                                    heading.level === 3 ? 'ml-4' : 'ml-6'
                        } text-gray-700`}
                    >
                      {heading.text}
                    </button>
                ))}
              </nav>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

// Enhanced Author Bio Component
const AuthorBio = ({ author, authorEmail, postDate }) => {
  const { isMobile } = useIsMobile();
  const [authorStats, setAuthorStats] = useState({ posts: 0, totalViews: 0 });

  useEffect(() => {
    const fetchAuthorStats = async () => {
      if (!author) return;

      try {
        const q = query(collection(db, "blogs"), where("author", "==", author));
        const snapshot = await getDocs(q);
        const posts = snapshot.docs.length;
        const totalViews = snapshot.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);
        setAuthorStats({ posts, totalViews });
      } catch (error) {
        console.error("Error fetching author stats:", error);
      }
    };

    fetchAuthorStats();
  }, [author]);

  return (
      <FadeInWrapper delay={0.4}>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 md:p-6 rounded-2xl border border-purple-200">
          <div className="flex items-start gap-4">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              <div className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold ${
                  isMobile ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl'
              }`}>
                {author?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h4 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {author || 'Anonymous Explorer'}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendarAlt className="text-purple-500" />
                  {postDate}
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-3">
                Travel enthusiast and national parks explorer sharing adventures and tips
                from across America's most beautiful destinations.
              </p>

              {/* Author Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <FaBookOpen className="text-blue-500" />
                  <span className="font-medium">{authorStats.posts}</span>
                  <span className="text-gray-600">posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaEye className="text-green-500" />
                  <span className="font-medium">{authorStats.totalViews.toLocaleString()}</span>
                  <span className="text-gray-600">total views</span>
                </div>
                {authorEmail && (
                    <div className="flex items-center gap-1">
                      <FaUser className="text-purple-500" />
                      <span className="text-gray-600">Verified Author</span>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Enhanced Comment Component
const EnhancedComment = ({ comment, onReply, onLike, currentUser, isReplying, setIsReplying }) => {
  const { isMobile } = useIsMobile();
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText("");
      setIsReplying(false);
    }
  };

  return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
              isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10'
          }`}>
            {comment.author?.charAt(0)?.toUpperCase() || 'A'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <div>
                <h5 className={`font-medium text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {comment.author}
                </h5>
                <p className="text-xs text-gray-500">
                  {comment.date?.seconds
                      ? new Date(comment.date.seconds * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : 'Just now'}
                </p>
              </div>
            </div>

            {/* Comment Text */}
            <p className={`text-gray-700 mb-3 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
              {comment.text}
            </p>

            {/* Comment Actions */}
            <div className="flex items-center gap-3">
              <button
                  onClick={() => onLike(comment.id)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
              >
                <FaThumbsUp className="text-xs" />
                <span>{comment.likes || 0}</span>
              </button>

              {currentUser && (
                  <button
                      onClick={() => setIsReplying(!isReplying)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 transition"
                  >
                    <FaReply className="text-xs" />
                    Reply
                  </button>
              )}
            </div>

            {/* Reply Form */}
            {isReplying && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
                    rows="2"
                    style={{ fontSize: '16px' }}
                />
                    <div className="flex flex-col gap-1">
                      <button
                          onClick={handleReply}
                          disabled={!replyText.trim()}
                          className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaSave />
                      </button>
                      <button
                          onClick={() => setIsReplying(false)}
                          className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

// Related Posts Component
const RelatedPosts = ({ currentPost, allPosts }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();

  const relatedPosts = useMemo(() => {
    if (!currentPost || !allPosts.length) return [];

    // Simple similarity based on shared words in title and content
    const currentWords = new Set([
      ...(currentPost.title?.toLowerCase().split(' ') || []),
      ...(currentPost.tags || [])
    ]);

    const scored = allPosts
        .filter(post => post.id !== currentPost.id)
        .map(post => {
          const postWords = new Set([
            ...(post.title?.toLowerCase().split(' ') || []),
            ...(post.tags || [])
          ]);

          const intersection = new Set([...currentWords].filter(x => postWords.has(x)));
          const score = intersection.size;

          return { ...post, score };
        })
        .filter(post => post.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    return scored;
  }, [currentPost, allPosts]);

  if (relatedPosts.length === 0) return null;

  return (
      <FadeInWrapper delay={0.6}>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 md:p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl text-white">
              <FaLightbulb />
            </div>
            <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              You Might Also Like
            </h3>
          </div>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {relatedPosts.map((post) => (
                <button
                    key={post.id}
                    onClick={() => navigate(`/blog/${post.slug || post.id}`)}
                    className="text-left bg-white p-4 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group"
                >
                  <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {post.excerpt || `${post.title.substring(0, 100)}...`}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{post.author}</span>
                    <span className="flex items-center gap-1">
                  <FaClock />
                      {Math.ceil((post.content?.length || 1000) / 1000)} min
                </span>
                  </div>
                </button>
            ))}
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Quick Actions Floating Menu
const QuickActions = ({
                        post,
                        isSaved,
                        onToggleSave,
                        onShare,
                        onPrint,
                        onPlanTrip,
                        showTOC,
                        onToggleTOC,
                        currentUser
                      }) => {
  const { isMobile } = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { icon: FaBookmark, label: 'Save', action: onToggleSave, active: isSaved, color: 'purple' },
    { icon: FaShare, label: 'Share', action: onShare, color: 'blue' },
    { icon: FaBookOpen, label: 'TOC', action: onToggleTOC, active: showTOC, color: 'green' },
    { icon: FaRoute, label: 'Plan Trip', action: onPlanTrip, color: 'pink' },
    { icon: FaPrint, label: 'Print', action: onPrint, color: 'gray' }
  ];

  if (isMobile) {
    return (
        <div className="fixed bottom-4 right-4 z-30">
          <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mb-2 space-y-2"
                >
                  {actions.map((action, index) => (
                      <motion.button
                          key={action.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={action.action}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-sm font-medium transition-all ${
                              action.active
                                  ? `bg-${action.color}-500 text-white`
                                  : `bg-white text-${action.color}-600 hover:bg-${action.color}-50`
                          }`}
                      >
                        <action.icon />
                        {action.label}
                      </motion.button>
                  ))}
                </motion.div>
            )}
          </AnimatePresence>

          <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            {isExpanded ? <FaTimes /> : <FaEllipsisV />}
          </button>
        </div>
    );
  }

  return (
      <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-30">
        <div className="space-y-2">
          {actions.map((action) => (
              <button
                  key={action.label}
                  onClick={action.action}
                  title={action.label}
                  className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
                      action.active
                          ? `bg-${action.color}-500 text-white`
                          : `bg-white text-${action.color}-600 hover:bg-${action.color}-50`
                  }`}
              >
                <action.icon />
              </button>
          ))}
        </div>
      </div>
  );
};

// Park Connection Component
const ParkConnection = ({ content, title }) => {
  const { isMobile } = useIsMobile();
  const [relatedPark, setRelatedPark] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const extractParkInfo = () => {
      const text = `${title} ${content}`.toLowerCase();

      // Common park patterns
      const parkPatterns = [
        /(\w+\s+national\s+park)/gi,
        /(\w+\s+state\s+park)/gi,
        /(yellowstone|yosemite|grand\s+canyon|zion|arches|glacier)/gi
      ];

      for (const pattern of parkPatterns) {
        const match = text.match(pattern);
        if (match) {
          setRelatedPark({
            name: match[0].replace(/\b\w/g, l => l.toUpperCase()),
            searchQuery: match[0]
          });
          break;
        }
      }
    };

    if (content && title) {
      extractParkInfo();
    }
  }, [content, title]);

  if (!relatedPark) return null;

  return (
      <FadeInWrapper delay={0.5}>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 md:p-6 rounded-2xl border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl text-white">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Featured Location
              </h3>
              <p className="text-gray-600 text-sm">Plan your visit to this amazing destination</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-green-100">
            <h4 className="font-semibold text-gray-800 mb-2">{relatedPark.name}</h4>
            <p className="text-gray-600 text-sm mb-4">
              This story features {relatedPark.name}. Explore detailed information,
              weather, activities, and plan your visit.
            </p>

            <div className="flex gap-2">
              <button
                  onClick={() => navigate(`/?search=${encodeURIComponent(relatedPark.searchQuery)}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
              >
                <FaMapMarkerAlt />
                View Park Details
              </button>
              <button
                  onClick={() => navigate('/trip-planner', {
                    state: {
                      preloadedTrip: {
                        title: `Trip to ${relatedPark.name}`,
                        parks: [{ parkName: relatedPark.name }]
                      }
                    }
                  })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
              >
                <FaRoute />
                Plan Trip
              </button>
            </div>
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Main Enhanced BlogPost Component
const EnhancedBlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showTOC, setShowTOC] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [user] = useAuthState(auth);
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Load blog post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "blogs"), where("slug", "==", slug));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const postData = {
            ...docData,
            id: snap.docs[0].id,
          };
          setPost(postData);
          setViews(postData.views || 0);
          setLikes(postData.likes || 0);

          // Update view count
          const postRef = doc(db, "blogs", snap.docs[0].id);
          await updateDoc(postRef, {
            views: increment(1)
          });
          setViews(prev => prev + 1);

          // Check if saved
          if (currentUser) {
            const saved = JSON.parse(localStorage.getItem(`saved_posts_${currentUser.uid}`) || '[]');
            setIsSaved(saved.includes(snap.docs[0].id));

            // Check if liked
            const liked = localStorage.getItem(`liked_blog_${snap.docs[0].id}`);
            setIsLiked(liked === 'true');
          }
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Error loading blog post:", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug, currentUser]);

  // Load all posts for related posts
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "blogs"));
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllPosts(posts);
      } catch (error) {
        console.error("Error fetching all posts:", error);
      }
    };

    fetchAllPosts();
  }, []);

  // Load comments
  useEffect(() => {
    if (!post?.id) return;

    const q = query(collection(db, "comments"), where("blogId", "==", post.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)));
    });

    return () => unsubscribe();
  }, [post?.id]);

  // Event handlers
  const handleCommentSubmit = async () => {
    if (!user) {
      showToast("Please sign in to comment", "error");
      return;
    }

    if (!newComment.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        blogId: post.id,
        text: newComment,
        author: user.displayName || user.email,
        date: serverTimestamp(),
        likes: 0,
      });
      setNewComment("");
      showToast("✅ Comment posted!", "success");
    } catch (err) {
      console.error("Comment error:", err);
      showToast("❌ Failed to post comment", "error");
    }
  };

  const handleLikeComment = async (commentId) => {
    // Simple like system - in production, you'd want to track per user
    showToast("👍 Thanks for the feedback!", "success");
  };

  const handleReplyToComment = async (commentId, replyText) => {
    if (!user) {
      showToast("Please sign in to reply", "error");
      return;
    }

    try {
      await addDoc(collection(db, "comments"), {
        blogId: post.id,
        text: `@${comments.find(c => c.id === commentId)?.author}: ${replyText}`,
        author: user.displayName || user.email,
        date: serverTimestamp(),
        parentId: commentId,
        likes: 0,
      });
      showToast("✅ Reply posted!", "success");
    } catch (error) {
      console.error("Reply error:", error);
      showToast("❌ Failed to post reply", "error");
    }
  };

  const handleToggleSave = () => {
    if (!currentUser) {
      showToast("Please sign in to save posts", "error");
      return;
    }

    const saved = JSON.parse(localStorage.getItem(`saved_posts_${currentUser.uid}`) || '[]');
    const updated = isSaved
        ? saved.filter(id => id !== post.id)
        : [...saved, post.id];

    localStorage.setItem(`saved_posts_${currentUser.uid}`, JSON.stringify(updated));
    setIsSaved(!isSaved);
    showToast(isSaved ? "Removed from saved posts" : "Post saved!", isSaved ? "info" : "success");
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: `Check out this amazing story: ${post.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("📤 Shared successfully!", "success");
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("📋 Link copied to clipboard!", "success");
    }
  };

  const handlePrint = () => {
    window.print();
    showToast("🖨️ Print dialog opened", "info");
  };

  const handlePlanTrip = () => {
    const contentHTML = draftToHtml(
        typeof post.content === "string" ? JSON.parse(post.content) : post.content
    );

    const div = document.createElement("div");
    div.innerHTML = contentHTML;
    const plainText = div.textContent || "";

    const parkMatch = plainText.match(/\b[A-Z][a-z]+ National Park\b/);
    const parkName = parkMatch ? parkMatch[0] : post.title;

    navigate('/trip-planner', {
      state: {
        preloadedTrip: {
          title: `Trip inspired by: ${post.title}`,
          description: `Trip based on the blog post "${post.title}" by ${post.author}`,
          parks: [{
            parkName: parkName,
            notes: `Inspired by ${post.author}'s blog post`
          }]
        }
      }
    });

    showToast(`🎯 Planning trip based on "${post.title}"!`, 'success');
  };

  const handleLikePost = async () => {
    if (isLiked) return;

    try {
      const postRef = doc(db, "blogs", post.id);
      await updateDoc(postRef, {
        likes: increment(1)
      });

      setLikes(prev => prev + 1);
      setIsLiked(true);
      localStorage.setItem(`liked_blog_${post.id}`, 'true');
      showToast("❤️ Thanks for the like!", "success");
    } catch (error) {
      console.error("Error liking post:", error);
      showToast("Failed to like post", "error");
    }
  };

  // Breadcrumb navigation
  const renderBreadcrumb = () => (
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Link to="/" className="text-purple-600 hover:text-purple-800 transition-colors">
          🏠 Home
        </Link>
        <FaChevronRight className="text-gray-400 text-xs" />
        <Link to="/blog" className="text-purple-600 hover:text-purple-800 transition-colors">
          📚 Blog
        </Link>
        <FaChevronRight className="text-gray-400 text-xs" />
        <span className="text-gray-600 font-medium truncate max-w-48">
        {post?.title || 'Loading...'}
      </span>
      </div>
  );

  // Post metadata
  const postContentHTML = post ? draftToHtml(
      typeof post.content === "string" ? JSON.parse(post.content) : post.content
  ) : "";

  const wordCount = postContentHTML.split(" ").length;
  const readTime = Math.ceil(wordCount / 200);

  const isAuthor = user?.email === post?.author;
  const isAdmin = user?.email === "krishnasathvikm@gmail.com";

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <ReadingProgressBar />
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
              <div className="p-4 md:p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                  <div className="h-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl w-2/3"></div>
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (!post) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center py-20 px-4">
            <div className="text-6xl mb-4">📖</div>
            <h1 className={`font-bold text-gray-800 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              Story Not Found
            </h1>
            <p className="text-gray-600 mb-6">The story you're looking for doesn't exist or has been removed.</p>
            <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
            >
              <FaArrowLeft /> Back to Stories
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <ReadingProgressBar />

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
                <div className="p-4 md:p-6 lg:p-8">

                  {/* Breadcrumb */}
                  {renderBreadcrumb()}

                  {/* Article Header */}
                  <FadeInWrapper delay={0.1}>
                    <div className="mb-8">
                      {/* Post Meta */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          <FaCalendarAlt />
                          {post.date?.seconds
                              ? new Date(post.date.seconds * 1000).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })
                              : "Recently"}
                        </div>

                        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          <FaClock />
                          {readTime} min read
                        </div>

                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          <FaEye />
                          {views.toLocaleString()} views
                        </div>

                        {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                              <FaTag />
                              {post.tags[0]}
                            </div>
                        )}
                      </div>

                      {/* Title */}
                      <h1 className={`font-extrabold text-gray-800 mb-6 leading-tight ${
                          isMobile ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'
                      }`}>
                        {post.title}
                      </h1>

                      {/* Author Info Inline */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold ${
                              isMobile ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'
                          }`}>
                            {post.author?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                              {post.author || 'Anonymous Explorer'}
                            </div>
                            <div className="text-sm text-gray-600">Travel Storyteller</div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                          <button
                              onClick={handleLikePost}
                              disabled={isLiked}
                              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                  isLiked
                                      ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                              }`}
                          >
                            <FaHeart className={isLiked ? 'text-red-500' : ''} />
                            {likes}
                          </button>

                          <ShareButtons title={post.title} />
                        </div>
                      </div>
                    </div>
                  </FadeInWrapper>

                  {/* Featured Image */}
                  {post.imageUrl && (
                      <FadeInWrapper delay={0.2}>
                        <div className="mb-8">
                          <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="rounded-2xl w-full h-60 sm:h-80 lg:h-96 object-cover shadow-lg"
                          />
                        </div>
                      </FadeInWrapper>
                  )}

                  {/* Article Content */}
                  <FadeInWrapper delay={0.3}>
                    <div
                        ref={contentRef}
                        className={`blog-content prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed space-y-6 ${
                            isMobile ? 'text-base' : 'text-lg'
                        }`}
                        dangerouslySetInnerHTML={{ __html: postContentHTML }}
                        style={{
                          lineHeight: '1.8',
                          fontSize: isMobile ? '16px' : '18px'
                        }}
                    />
                  </FadeInWrapper>

                  {/* Edit Button for Authors/Admins */}
                  {(isAuthor || isAdmin) && (
                      <FadeInWrapper delay={0.4}>
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <Link
                              to={`/admin/edit-blog/${post?.id}`}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <FaEdit /> Edit Post
                          </Link>
                        </div>
                      </FadeInWrapper>
                  )}

                  {/* Author Bio */}
                  <div className="mt-8">
                    <AuthorBio
                        author={post.author}
                        authorEmail={post.authorEmail}
                        postDate={post.date?.seconds
                            ? new Date(post.date.seconds * 1000).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })
                            : "Recently"}
                    />
                  </div>

                  {/* Park Connection */}
                  <div className="mt-8">
                    <ParkConnection content={postContentHTML} title={post.title} />
                  </div>

                  {/* Comments Section */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <FadeInWrapper delay={0.5}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl text-white">
                          <FaComment className={isMobile ? "text-lg" : "text-xl"} />
                        </div>
                        <div>
                          <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                            💬 Discussion
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                          </p>
                        </div>
                      </div>

                      {/* Comment Form */}
                      <div className="bg-gradient-to-r from-gray-50 to-white p-4 md:p-6 rounded-2xl mb-8 border border-gray-200">
                        <h4 className={`font-semibold text-gray-800 mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
                          Share Your Thoughts
                        </h4>

                        <div className="space-y-4">
                        <textarea
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all resize-none"
                            rows="4"
                            placeholder="What did you think of this story? Share your own experiences..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ fontSize: '16px' }}
                        />

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {user ? (
                                  <span>Commenting as <strong>{user.displayName || user.email}</strong></span>
                              ) : (
                                  <span>Please <Link to="/login" className="text-purple-600 hover:underline">sign in</Link> to comment</span>
                              )}
                            </div>

                            <button
                                onClick={handleCommentSubmit}
                                disabled={!user || !newComment.trim()}
                                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Post Comment
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Comments List */}
                      {comments.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="text-4xl mb-4">💭</div>
                            <h4 className={`font-semibold text-gray-600 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                              No comments yet
                            </h4>
                            <p className="text-gray-500">Be the first to share your thoughts!</p>
                          </div>
                      ) : (
                          <div className="space-y-4">
                            {comments.map((comment) => (
                                <EnhancedComment
                                    key={comment.id}
                                    comment={comment}
                                    onReply={handleReplyToComment}
                                    onLike={handleLikeComment}
                                    currentUser={currentUser}
                                    isReplying={replyingTo === comment.id}
                                    setIsReplying={(isReplying) => setReplyingTo(isReplying ? comment.id : null)}
                                />
                            ))}
                          </div>
                      )}
                    </FadeInWrapper>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Table of Contents */}
              <TableOfContents
                  content={postContentHTML}
                  isVisible={showTOC || !isMobile}
                  onToggle={() => setShowTOC(!showTOC)}
              />

              {/* Related Posts */}
              <RelatedPosts currentPost={post} allPosts={allPosts} />

              {/* Call to Action */}
              <FadeInWrapper delay={0.7}>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-2xl text-white text-center">
                  <h4 className="font-bold text-lg mb-3">Love This Story?</h4>
                  <p className="text-indigo-100 mb-4 text-sm">
                    Plan your own adventure to this amazing destination!
                  </p>
                  <button
                      onClick={handlePlanTrip}
                      className="w-full bg-white text-indigo-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    🎯 Plan Your Trip
                  </button>
                </div>
              </FadeInWrapper>
            </div>
          </div>
        </div>

        {/* Quick Actions Floating Menu */}
        <QuickActions
            post={post}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onShare={handleShare}
            onPrint={handlePrint}
            onPlanTrip={handlePlanTrip}
            showTOC={showTOC}
            onToggleTOC={() => setShowTOC(!showTOC)}
            currentUser={currentUser}
        />
      </div>
  );
};

export default EnhancedBlogPost;