// ✨ Enhanced TripTemplates.jsx - Advanced Template System
import React, { useState, useMemo } from 'react';
import {
    FaStar,
    FaMapMarkerAlt,
    FaDollarSign,
    FaClock,
    FaHeart,
    FaRegHeart,
    FaFilter,
    FaSearch,
    FaSort,
    FaShareAlt,
    FaCalendarAlt,
    FaRoute,
    FaChevronDown,
    FaChevronUp,
    FaTags,
    FaUsers,
    FaThermometerHalf,
    FaMountain
} from 'react-icons/fa';
import { TemplateSkeleton } from '../shared/ui/LoadingStates';
import { CardFadeIn, StaggerGroup } from '../FadeInWrapper';
import { useToast } from '../shared/ui/SmartToast';

const EnhancedTripTemplates = ({
                                   templates = [],
                                   onSelectTemplate,
                                   loading = false,
                                   showFilters = true,
                                   showSearch = true,
                                   showFavorites = true,
                                   allowSharing = true,
                                   className = ''
                               }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        difficulty: 'all',
        season: 'all',
        duration: 'all',
        budget: 'all'
    });
    const [sortBy, setSortBy] = useState('popular');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const { toast } = useToast();

    // Filter and sort logic
    const filteredAndSortedTemplates = useMemo(() => {
        let filtered = templates.filter(template => {
            // Search filter
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const matchesSearch =
                    template.title.toLowerCase().includes(search) ||
                    template.description.toLowerCase().includes(search) ||
                    template.highlights.some(h => h.toLowerCase().includes(search)) ||
                    template.parks.some(p => p.name.toLowerCase().includes(search));

                if (!matchesSearch) return false;
            }

            // Difficulty filter
            if (selectedFilters.difficulty !== 'all' &&
                template.difficulty.toLowerCase() !== selectedFilters.difficulty) {
                return false;
            }

            // Season filter
            if (selectedFilters.season !== 'all' &&
                template.season.toLowerCase() !== selectedFilters.season) {
                return false;
            }

            // Duration filter
            if (selectedFilters.duration !== 'all') {
                const duration = template.duration;
                if (selectedFilters.duration === 'short' && duration > 5) return false;
                if (selectedFilters.duration === 'medium' && (duration <= 5 || duration > 10)) return false;
                if (selectedFilters.duration === 'long' && duration <= 10) return false;
            }

            // Budget filter
            if (selectedFilters.budget !== 'all') {
                const cost = template.estimatedCost;
                if (selectedFilters.budget === 'budget' && cost > 2000) return false;
                if (selectedFilters.budget === 'mid' && (cost <= 2000 || cost > 5000)) return false;
                if (selectedFilters.budget === 'luxury' && cost <= 5000) return false;
            }

            return true;
        });

        // Sort templates
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.estimatedCost - b.estimatedCost;
                case 'price-high':
                    return b.estimatedCost - a.estimatedCost;
                case 'duration-short':
                    return a.duration - b.duration;
                case 'duration-long':
                    return b.duration - a.duration;
                case 'parks-most':
                    return b.parks.length - a.parks.length;
                case 'newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'popular':
                default:
                    return (b.popularity || 0) - (a.popularity || 0);
            }
        });

        return filtered;
    }, [templates, searchTerm, selectedFilters, sortBy]);

    // Filter options
    const filterOptions = {
        difficulty: [
            { value: 'all', label: 'All Levels' },
            { value: 'easy', label: 'Easy' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'advanced', label: 'Advanced' }
        ],
        season: [
            { value: 'all', label: 'All Seasons' },
            { value: 'spring', label: 'Spring' },
            { value: 'summer', label: 'Summer' },
            { value: 'fall', label: 'Fall' },
            { value: 'winter', label: 'Winter' }
        ],
        duration: [
            { value: 'all', label: 'Any Duration' },
            { value: 'short', label: 'Short (1-5 days)' },
            { value: 'medium', label: 'Medium (6-10 days)' },
            { value: 'long', label: 'Long (11+ days)' }
        ],
        budget: [
            { value: 'all', label: 'Any Budget' },
            { value: 'budget', label: 'Budget ($0-$2k)' },
            { value: 'mid', label: 'Mid-range ($2k-$5k)' },
            { value: 'luxury', label: 'Luxury ($5k+)' }
        ]
    };

    const sortOptions = [
        { value: 'popular', label: 'Most Popular' },
        { value: 'newest', label: 'Newest' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'duration-short', label: 'Duration: Short to Long' },
        { value: 'duration-long', label: 'Duration: Long to Short' },
        { value: 'parks-most', label: 'Most Parks' }
    ];

    // Helper functions
    const getDifficultyConfig = (difficulty) => {
        const configs = {
            easy: { color: 'text-green-600 bg-green-100', icon: '🟢' },
            moderate: { color: 'text-yellow-600 bg-yellow-100', icon: '🟡' },
            advanced: { color: 'text-red-600 bg-red-100', icon: '🔴' }
        };
        const key = difficulty.toLowerCase();
        return configs[key] || { color: 'text-blue-600 bg-blue-100', icon: '🔵' };
    };

    const handleFavoriteToggle = (templateId) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(templateId)) {
            newFavorites.delete(templateId);
            toast.success('Removed from favorites');
        } else {
            newFavorites.add(templateId);
            toast.success('Added to favorites');
        }
        setFavorites(newFavorites);
    };

    const handleShareTemplate = (template) => {
        if (navigator.share) {
            navigator.share({
                title: template.title,
                text: template.description,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleSelectTemplate = (template) => {
        onSelectTemplate(template);
        toast.tripSaved(template.title);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedFilters({
            difficulty: 'all',
            season: 'all',
            duration: 'all',
            budget: 'all'
        });
        setSortBy('popular');
    };

    if (loading) {
        return (
            <div className={`enhanced-trip-templates ${className}`}>
                <TemplateSkeleton count={6} />
            </div>
        );
    }

    return (
        <div className={`enhanced-trip-templates space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Trip Templates</h2>
                    <p className="text-gray-600">
                        {filteredAndSortedTemplates.length} of {templates.length} templates
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="px-3 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                        <FaFilter className="w-3 h-3" />
                        Filters
                        {showAdvancedFilters ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            {(showSearch || showFilters) && (
                <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
                    {/* Search Bar */}
                    {showSearch && (
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search templates, parks, or highlights..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Quick Filters & Sort */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <FaSort className="text-gray-400 w-4 h-4" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quick Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.difficulty.slice(1).map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedFilters(prev => ({
                                        ...prev,
                                        difficulty: prev.difficulty === option.value ? 'all' : option.value
                                    }))}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        selectedFilters.difficulty === option.value
                                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            {Object.entries(filterOptions).slice(1).map(([key, options]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                        {key}
                                    </label>
                                    <select
                                        value={selectedFilters[key]}
                                        onChange={(e) => setSelectedFilters(prev => ({
                                            ...prev,
                                            [key]: e.target.value
                                        }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {filteredAndSortedTemplates.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No templates found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <StaggerGroup staggerDelay={0.1} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredAndSortedTemplates.map((template, index) => (
                        <CardFadeIn key={template.id} index={index}>
                            <TemplateCard
                                template={template}
                                isFavorite={favorites.has(template.id)}
                                onFavoriteToggle={() => handleFavoriteToggle(template.id)}
                                onShare={() => handleShareTemplate(template)}
                                onSelect={() => handleSelectTemplate(template)}
                                showFavorites={showFavorites}
                                allowSharing={allowSharing}
                            />
                        </CardFadeIn>
                    ))}
                </StaggerGroup>
            )}
        </div>
    );
};

// Enhanced Template Card Component
const TemplateCard = ({
                          template,
                          isFavorite,
                          onFavoriteToggle,
                          onShare,
                          onSelect,
                          showFavorites,
                          allowSharing
                      }) => {
    const difficultyConfig = getDifficultyConfig(template.difficulty);

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
                {/* Top Actions */}
                <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl mb-2">{template.image}</div>
                    <div className="flex items-center gap-2">
                        {showFavorites && (
                            <button
                                onClick={onFavoriteToggle}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                {isFavorite ? (
                                    <FaHeart className="w-4 h-4 text-red-300" />
                                ) : (
                                    <FaRegHeart className="w-4 h-4" />
                                )}
                            </button>
                        )}
                        {allowSharing && (
                            <button
                                onClick={onShare}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Share template"
                            >
                                <FaShareAlt className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Template Info */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="text-xl font-bold mb-1">{template.title}</h4>
                        <p className="text-sm text-purple-100 mb-2">{template.subtitle}</p>
                        <p className="text-white/90 text-sm line-clamp-2">{template.description}</p>
                    </div>
                    <div className="text-right ml-4">
                        <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-1 flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            {template.duration} days
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                            <FaThermometerHalf className="w-3 h-3" />
                            {template.season}
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {template.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-white/20 px-2 py-1 rounded-full text-xs">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-6">
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="text-center">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${difficultyConfig.color}`}>
                            <span>{difficultyConfig.icon}</span>
                            <span>{template.difficulty}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Difficulty</div>
                    </div>

                    <div className="text-center">
                        <div className="font-bold text-gray-800 flex items-center justify-center gap-1">
                            <FaMapMarkerAlt className="text-blue-500 w-3 h-3" />
                            {template.parks.length}
                        </div>
                        <div className="text-xs text-gray-500">Parks</div>
                    </div>

                    <div className="text-center">
                        <div className="font-bold text-green-600 flex items-center justify-center gap-1">
                            <FaDollarSign className="text-green-500 w-3 h-3" />
                            {Math.round(template.estimatedCost / 1000)}k
                        </div>
                        <div className="text-xs text-gray-500">Est. Cost</div>
                    </div>

                    <div className="text-center">
                        <div className="font-bold text-purple-600 flex items-center justify-center gap-1">
                            <FaUsers className="text-purple-500 w-3 h-3" />
                            {template.groupSize || '2-4'}
                        </div>
                        <div className="text-xs text-gray-500">Group</div>
                    </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaStar className="text-yellow-500 w-4 h-4" />
                        Highlights
                    </h5>
                    <div className="space-y-2">
                        {template.highlights.slice(0, 3).map((highlight, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium border border-purple-100">
                                {highlight}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enhanced Parks List */}
                <div className="mb-6">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaMountain className="text-green-500 w-4 h-4" />
                        Featured Parks
                    </h5>
                    <div className="space-y-2">
                        {template.parks.slice(0, 3).map((park, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                <span className="text-gray-700 font-medium truncate flex-1">{park.name}</span>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <FaClock className="w-3 h-3" />
                                        {park.days} day{park.days > 1 ? 's' : ''}
                                    </span>
                                    {park.state && (
                                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                            {park.state}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {template.parks.length > 3 && (
                            <div className="text-sm text-gray-500 text-center py-2">
                                +{template.parks.length - 3} more parks...
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Action Button */}
                <button
                    onClick={onSelect}
                    className="w-full py-4 px-6 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 group-hover:from-pink-600 group-hover:to-purple-600"
                >
                    <FaRoute className="w-4 h-4" />
                    Start This Adventure
                </button>
            </div>
        </div>
    );
};

// Helper function (moved inside for context)
const getDifficultyConfig = (difficulty) => {
    const configs = {
        easy: { color: 'text-green-600 bg-green-100', icon: '🟢' },
        moderate: { color: 'text-yellow-600 bg-yellow-100', icon: '🟡' },
        advanced: { color: 'text-red-600 bg-red-100', icon: '🔴' }
    };
    const key = difficulty.toLowerCase();
    return configs[key] || { color: 'text-blue-600 bg-blue-100', icon: '🔵' };
};

export default EnhancedTripTemplates;