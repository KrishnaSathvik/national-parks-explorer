import React, { useEffect, useState, useMemo, useCallback } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import draftToHtml from "draftjs-to-html";
import useIsMobile from "../hooks/useIsMobile";
import FadeInWrapper from "../components/FadeInWrapper";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from 'lodash';
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaFilter,
  FaHeart,
  FaMapMarkerAlt,
  FaNewspaper,
  FaRegHeart,
  FaRoute,
  FaSearch,
  FaShare,
  FaStar,
  FaTags,
  FaTimes,
  FaUser,
  FaArrowRight,
  FaThumbsUp,
  FaComment,
  FaBookmark,
  FaRegBookmark
} from "react-icons/fa";

// Enhanced Blog Hero Section
const BlogHero = () => {
  const { isMobile } = useIsMobile();

  return (
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 md:p-6 lg:p-8 text-white overflow-hidden rounded-2xl mb-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -top-2 -left-2 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full blur-md"></div>

        <div className="relative z-10">
          <FadeInWrapper delay={0.1}>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <FaBookOpen className={isMobile ? "text-2xl" : "text-3xl"} />
                  </div>
                  <div>
                    <h1 className={`font-extrabold ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
                      📚 Travel Stories & Adventures
                    </h1>
                    <p className={`text-purple-100 mt-1 ${isMobile ? 'text-sm' : 'text-base lg:text-lg'}`}>
                      Discover inspiring stories from fellow park explorers
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                    <FaNewspaper className="text-sm" />
                    <span className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Latest Adventures
                  </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                    <FaStar className="text-yellow-300" />
                    <span className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Expert Tips
                  </span>
                  </div>
                </div>
              </div>
            </div>
          </FadeInWrapper>
        </div>
      </div>
  );
};

// Enhanced Search and Filter Section
const BlogSearchFilter = ({
                            search,
                            onSearchChange,
                            selectedTag,
                            setSelectedTag,
                            selectedAuthor,
                            setSelectedAuthor,
                            sortBy,
                            setSortBy,
                            tags,
                            authors,
                            showFilters,
                            setShowFilters,
                            resultCount
                          }) => {
  const { isMobile } = useIsMobile();

  return (
      <FadeInWrapper delay={0.2}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-6 overflow-hidden">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 md:p-3 rounded-xl text-white">
                  <FaSearch className={isMobile ? "text-lg" : "text-xl"} />
                </div>
                <div>
                  <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Find Stories
                  </h3>
                  <p className="text-gray-600 text-sm">Search through travel adventures</p>
                </div>
              </div>

              <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      showFilters
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <FaFilter />
                {!isMobile && 'Filters'}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <input
                  type="text"
                  placeholder="Search stories, locations, or topics..."
                  value={search}
                  onChange={onSearchChange}
                  className="w-full p-3 pl-10 pr-10 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
                  style={{ fontSize: '16px' }}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {search && (
                  <button
                      onClick={() => onSearchChange({ target: { value: '' } })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <FaTimes />
                  </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                  onClick={() => setSortBy('latest')}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                      sortBy === 'latest'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                🆕 Latest
              </button>
              <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                      sortBy === 'popular'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                🔥 Popular
              </button>
              <button
                  onClick={() => setSortBy('recommended')}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                      sortBy === 'recommended'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                ⭐ Featured
              </button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                  <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 pt-4"
                  >
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {/* Tags Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaTags className="inline mr-2" />
                          Topics
                        </label>
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all bg-white"
                        >
                          <option value="">All Topics</option>
                          {tags.map(tag => (
                              <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>

                      {/* Author Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaUser className="inline mr-2" />
                          Author
                        </label>
                        <select
                            value={selectedAuthor}
                            onChange={(e) => setSelectedAuthor(e.target.value)}
                            className="w-full border-2 border-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all bg-white"
                        >
                          <option value="">All Authors</option>
                          {authors.map(author => (
                              <option key={author} value={author}>{author}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="mt-4 flex justify-end">
                      <button
                          onClick={() => {
                            onSearchChange({ target: { value: '' } });
                            setSelectedTag('');
                            setSelectedAuthor('');
                            setSortBy('latest');
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-4 mt-4">
              <div>
                {resultCount} {resultCount === 1 ? 'story' : 'stories'} found
                {search && ` for "${search}"`}
              </div>
            </div>
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Enhanced Blog Card Component
const EnhancedBlogCard = ({ blog, index, savedPosts, onToggleSave, currentUser, onPlanTrip }) => {
  const { isMobile } = useIsMobile();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(blog.likes || 0);

  const contentHTML = useMemo(() => {
    try {
      const raw = typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;
      return draftToHtml(raw);
    } catch {
      return "";
    }
  }, [blog.content]);

  const plainText = useMemo(() => {
    const div = document.createElement("div");
    div.innerHTML = contentHTML;
    return div.textContent || "";
  }, [contentHTML]);

  const readTime = Math.ceil(plainText.split(" ").length / 200);
  const views = blog.views || Math.floor(Math.random() * 1000) + 100;
  const comments = blog.comments || Math.floor(Math.random() * 50);

  // Extract tags from content or use predefined tags
  const tags = blog.tags || ['Adventure', 'Nature', 'Travel'];

  // Extract location from content
  const extractLocation = (text) => {
    const locationMatch = text.match(/\b[A-Z][a-z]+ National Park\b/);
    return locationMatch ? locationMatch[0] : blog.location || 'National Parks';
  };

  const location = extractLocation(plainText);

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikes(prev => prev + 1);
      // Store in localStorage
      localStorage.setItem(`liked_blog_${blog.id}`, 'true');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSave(blog.id);
  };

  const handlePlanTrip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPlanTrip(blog);
  };

  return (
      <FadeInWrapper delay={index * 0.1}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <Link to={`/blog/${blog.slug || blog.id}`} className="block">
            {/* Header Image/Gradient */}
            <div className="relative h-48 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center overflow-hidden">
              {blog.imageUrl ? (
                  <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
              ) : (
                  <div className="text-6xl opacity-80">📖</div>
              )}

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="flex gap-2">
                    {tags.slice(0, 2).map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full"
                        >
                      {tag}
                    </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {currentUser && (
                  <button
                      onClick={handleSave}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                          savedPosts.includes(blog.id)
                              ? "bg-purple-500 text-white"
                              : "bg-white/80 text-gray-600 hover:bg-white"
                      }`}
                  >
                    {savedPosts.includes(blog.id) ? (
                        <FaBookmark className="text-sm" />
                    ) : (
                        <FaRegBookmark className="text-sm" />
                    )}
                  </button>
              )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              {/* Author and Date */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {blog.author?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {blog.author || 'Anonymous Explorer'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {blog.date?.seconds
                        ? new Date(blog.date.seconds * 1000).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                        : 'Recently'}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className={`font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors ${
                  isMobile ? 'text-lg' : 'text-xl'
              }`}>
                {blog.title}
              </h3>

              {/* Excerpt */}
              <p className={`text-gray-600 mb-4 line-clamp-3 leading-relaxed ${
                  isMobile ? 'text-sm' : 'text-base'
              }`}>
                {plainText.slice(0, 150)}...
              </p>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <FaMapMarkerAlt className="text-pink-500 text-sm" />
                <span className="text-sm">{location}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <FaClock className="text-blue-500" />
                    <span>{readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaEye className="text-green-500" />
                    <span>{views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaComment className="text-purple-500" />
                    <span>{comments}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                    onClick={handleLike}
                    disabled={isLiked}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isLiked
                            ? 'bg-red-100 text-red-600 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }`}
                >
                  <FaHeart className={isLiked ? 'text-red-500' : ''} />
                  {likes}
                </button>

                <button
                    onClick={() => navigator.share?.({
                      title: blog.title,
                      url: window.location.origin + `/blog/${blog.slug || blog.id}`
                    })}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all text-sm font-medium"
                >
                  <FaShare />
                  Share
                </button>

                <button
                    onClick={handlePlanTrip}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium"
                >
                  <FaRoute />
                  Plan Trip
                </button>
              </div>
            </div>
          </Link>
        </motion.div>
      </FadeInWrapper>
  );
};

// Featured Posts Section
const FeaturedPosts = ({ featuredBlogs, savedPosts, onToggleSave, currentUser, onPlanTrip }) => {
  const { isMobile } = useIsMobile();

  if (!featuredBlogs.length) return null;

  return (
      <FadeInWrapper delay={0.3}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl text-white">
              <FaStar className={isMobile ? "text-lg" : "text-xl"} />
            </div>
            <div>
              <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Featured Stories
              </h2>
              <p className="text-gray-600 text-sm">Hand-picked adventures from our community</p>
            </div>
          </div>

          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {featuredBlogs.slice(0, isMobile ? 2 : 3).map((blog, index) => (
                <EnhancedBlogCard
                    key={blog.id}
                    blog={blog}
                    index={index}
                    savedPosts={savedPosts}
                    onToggleSave={onToggleSave}
                    currentUser={currentUser}
                    onPlanTrip={onPlanTrip}
                />
            ))}
          </div>
        </div>
      </FadeInWrapper>
  );
};

// Main Enhanced Blog Component
const EnhancedBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  const { isMobile } = useIsMobile();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const postsPerPage = isMobile ? 6 : 9;

  // Load blogs
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(
            query(collection(db, "blogs"), orderBy("date", "desc"))
        );
        const blogList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          views: doc.data().views || Math.floor(Math.random() * 1000) + 100,
          likes: doc.data().likes || Math.floor(Math.random() * 50),
          comments: doc.data().comments || Math.floor(Math.random() * 25)
        }));
        setBlogs(blogList);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        showToast("Failed to load blog posts", "error");
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [showToast]);

  // Load saved posts
  useEffect(() => {
    if (currentUser) {
      const saved = JSON.parse(localStorage.getItem(`saved_posts_${currentUser.uid}`) || '[]');
      setSavedPosts(saved);
    }
  }, [currentUser]);

  // Extract unique tags and authors
  const tags = useMemo(() => {
    const allTags = blogs.flatMap(blog => blog.tags || ['Adventure', 'Nature', 'Travel']);
    return [...new Set(allTags)].sort();
  }, [blogs]);

  const authors = useMemo(() => {
    const allAuthors = blogs.map(blog => blog.author).filter(Boolean);
    return [...new Set(allAuthors)].sort();
  }, [blogs]);

  // Debounced search
  const debouncedSearch = useMemo(
      () => debounce((searchValue) => {
        setSearch(searchValue);
        setCurrentPage(1);
      }, 300),
      []
  );

  const handleSearchChange = useCallback((e) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  // Filter and sort blogs
  const filteredBlogs = useMemo(() => {
    let filtered = blogs.filter(blog => {
      const matchesSearch = !search ||
          blog.title?.toLowerCase().includes(search.toLowerCase()) ||
          blog.author?.toLowerCase().includes(search.toLowerCase()) ||
          (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));

      const matchesTag = !selectedTag || (blog.tags && blog.tags.includes(selectedTag));
      const matchesAuthor = !selectedAuthor || blog.author === selectedAuthor;

      return matchesSearch && matchesTag && matchesAuthor;
    });

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'recommended':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default: // latest
        filtered.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
    }

    return filtered;
  }, [blogs, search, selectedTag, selectedAuthor, sortBy]);

  // Featured blogs (high engagement)
  const featuredBlogs = useMemo(() => {
    return blogs
        .filter(blog => (blog.likes || 0) > 20 || (blog.views || 0) > 500)
        .slice(0, 3);
  }, [blogs]);

  // Pagination
  const indexLast = currentPage * postsPerPage;
  const indexFirst = indexLast - postsPerPage;
  const currentBlogs = filteredBlogs.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

  // Event handlers
  const handleToggleSave = (blogId) => {
    if (!currentUser) {
      showToast("Please sign in to save posts", "error");
      return;
    }

    const updated = savedPosts.includes(blogId)
        ? savedPosts.filter(id => id !== blogId)
        : [...savedPosts, blogId];

    setSavedPosts(updated);
    localStorage.setItem(`saved_posts_${currentUser.uid}`, JSON.stringify(updated));

    showToast(
        savedPosts.includes(blogId) ? "Removed from saved posts" : "Post saved!",
        savedPosts.includes(blogId) ? "info" : "success"
    );
  };

  const handlePlanTrip = (blog) => {
    // Extract park information from blog content
    const contentHTML = (() => {
      try {
        const raw = typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;
        return draftToHtml(raw);
      } catch {
        return "";
      }
    })();

    const div = document.createElement("div");
    div.innerHTML = contentHTML;
    const plainText = div.textContent || "";

    const parkMatch = plainText.match(/\b[A-Z][a-z]+ National Park\b/);
    const parkName = parkMatch ? parkMatch[0] : blog.title;

    navigate('/trip-planner', {
      state: {
        preloadedTrip: {
          title: `Trip inspired by: ${blog.title}`,
          description: `Trip based on the blog post "${blog.title}" by ${blog.author}`,
          parks: [{
            parkName: parkName,
            notes: `Inspired by ${blog.author}'s blog post`
          }]
        }
      }
    });

    showToast(`🎯 Planning trip based on "${blog.title}"!`, 'success');
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
        <FadeInWrapper delay={0.5}>
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8 px-4">
            <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-white text-purple-600 border-purple-400 hover:bg-purple-50 disabled:hover:bg-white min-h-[44px]"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, isMobile ? 5 : 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= (isMobile ? 5 : 7)) {
                pageNum = i + 1;
              } else if (currentPage <= (isMobile ? 3 : 4)) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - (isMobile ? 2 : 3)) {
                pageNum = totalPages - (isMobile ? 4 : 6) + i;
              } else {
                pageNum = currentPage - (isMobile ? 2 : 3) + i;
              }

              return (
                  <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[44px] px-3 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out ${
                          currentPage === pageNum
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg transform scale-105"
                              : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                      }`}
                  >
                    {pageNum}
                  </button>
              );
            })}

            <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-white text-purple-600 border-purple-400 hover:bg-purple-50 disabled:hover:bg-white min-h-[44px]"
            >
              Next
            </button>
          </div>
        </FadeInWrapper>
    );
  };

  const renderQuickActions = () => (
      <FadeInWrapper delay={0.4}>
        <div className="mb-6">
          <div className={`grid gap-4 w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} max-w-5xl mx-auto`}>
            <button
                onClick={() => navigate('/blog/create')}
                className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 w-full flex flex-col items-center justify-center min-h-[100px]"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✍️</div>
              <div className="font-semibold text-gray-800 text-sm">Write Story</div>
              <div className="text-gray-600 text-xs">Share your adventure</div>
            </button>

            <button
                onClick={() => navigate('/')}
                className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 w-full flex flex-col items-center justify-center min-h-[100px]"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏞️</div>
              <div className="font-semibold text-gray-800 text-sm">Explore Parks</div>
              <div className="text-gray-600 text-xs">Discover destinations</div>
            </button>

            <button
                onClick={() => navigate('/trip-planner')}
                className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 w-full flex flex-col items-center justify-center min-h-[100px]"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎯</div>
              <div className="font-semibold text-gray-800 text-sm">Plan Trip</div>
              <div className="text-gray-600 text-xs">Create itinerary</div>
            </button>

            {currentUser && (
                <Link
                    to="/account"
                    className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 w-full flex flex-col items-center justify-center min-h-[100px]"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
                  <div className="font-semibold text-gray-800 text-sm">My Stories</div>
                  <div className="text-gray-600 text-xs">Saved & written</div>
                </Link>
            )}
          </div>
        </div>
      </FadeInWrapper>
  );

  const renderEmptyState = () => (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h3 className={`font-semibold text-gray-600 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          No stories found
        </h3>
        <p className="text-gray-500 mb-6">
          {search || selectedTag || selectedAuthor
              ? "Try adjusting your search filters"
              : "Be the first to share your adventure!"
          }
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {(search || selectedTag || selectedAuthor) && (
              <button
                  onClick={() => {
                    setSearch('');
                    setSelectedTag('');
                    setSelectedAuthor('');
                    setSortBy('latest');
                  }}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                Clear Filters
              </button>
          )}
          <button
              onClick={() => navigate('/blog/create')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition"
          >
            Write Your Story
          </button>
        </div>
      </div>
  );

  const renderLoadingState = () => (
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
        ))}
      </div>
  );

  // Navigation breadcrumb
  const renderBreadcrumb = () => (
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Link to="/" className="text-purple-600 hover:text-purple-800 transition-colors">
          🏠 Home
        </Link>
        <span className="text-gray-400">→</span>
        <span className="text-gray-600 font-medium">Travel Stories</span>
      </div>
  );

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
              <div className="p-4 md:p-6">
                <BlogHero />
                {renderLoadingState()}
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
            <div className="p-4 md:p-6">
              {/* Breadcrumb */}
              {renderBreadcrumb()}

              {/* Hero Section */}
              <BlogHero />

              {/* Quick Actions */}
              {renderQuickActions()}

              {/* Search and Filter */}
              <BlogSearchFilter
                  search={search}
                  onSearchChange={handleSearchChange}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                  selectedAuthor={selectedAuthor}
                  setSelectedAuthor={setSelectedAuthor}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  tags={tags}
                  authors={authors}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  resultCount={filteredBlogs.length}
              />

              {/* Featured Posts */}
              {!search && !selectedTag && !selectedAuthor && (
                  <FeaturedPosts
                      featuredBlogs={featuredBlogs}
                      savedPosts={savedPosts}
                      onToggleSave={handleToggleSave}
                      currentUser={currentUser}
                      onPlanTrip={handlePlanTrip}
                  />
              )}

              {/* All Stories Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl text-white">
                    <FaNewspaper className={isMobile ? "text-lg" : "text-xl"} />
                  </div>
                  <div>
                    <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                      {search || selectedTag || selectedAuthor ? 'Search Results' : 'All Stories'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {filteredBlogs.length} {filteredBlogs.length === 1 ? 'story' : 'stories'} available
                    </p>
                  </div>
                </div>

                {/* Blog Grid */}
                {currentBlogs.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                      {currentBlogs.map((blog, index) => (
                          <EnhancedBlogCard
                              key={blog.id}
                              blog={blog}
                              index={index}
                              savedPosts={savedPosts}
                              onToggleSave={handleToggleSave}
                              currentUser={currentUser}
                              onPlanTrip={handlePlanTrip}
                          />
                      ))}
                    </div>
                )}
              </div>

              {/* Pagination */}
              {renderPagination()}

              {/* Call to Action - Desktop Only */}
              {!isMobile && (
                  <FadeInWrapper delay={0.6}>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-2xl text-white text-center mt-8">
                      <h3 className="text-2xl font-bold mb-4">Share Your Adventure</h3>
                      <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                        Have an amazing story from your national park adventures?
                        Share it with our community and inspire others to explore!
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate('/blog/create')}
                            className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
                        >
                          ✍️ Write Your Story
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
                        >
                          🏞️ Explore Parks
                        </button>
                      </div>
                    </div>
                  </FadeInWrapper>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default EnhancedBlog;