// ============================================
// src/components/TripTemplates.jsx
import React from 'react';
import { FaStar, FaMapMarkerAlt, FaDollarSign, FaClock } from 'react-icons/fa';

const TripTemplates = ({ templates, onSelectTemplate, loading }) => {
    const getDifficultyColor = (difficulty) => {
        if (difficulty.toLowerCase().includes('easy')) return 'text-green-600 bg-green-100';
        if (difficulty.toLowerCase().includes('moderate')) return 'text-yellow-600 bg-yellow-100';
        if (difficulty.toLowerCase().includes('advanced')) return 'text-red-600 bg-red-100';
        return 'text-blue-600 bg-blue-100';
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse">
                        <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                        <div className="p-6">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="h-8 bg-gray-200 rounded"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {templates.map(template => (
                <div key={template.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div className="text-4xl mb-2">{template.image}</div>
                            <div className="text-right">
                                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-1">
                                    {template.duration} days
                                </div>
                                <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
                                    {template.season}
                                </div>
                            </div>
                        </div>

                        <h4 className="text-xl font-bold mb-1">{template.title}</h4>
                        <p className="text-sm text-purple-100 mb-2">{template.subtitle}</p>
                        <p className="text-white/90 text-sm line-clamp-2">{template.description}</p>
                    </div>

                    <div className="p-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center">
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                                    {template.difficulty}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Difficulty</div>
                            </div>

                            <div className="text-center">
                                <div className="font-bold text-gray-800 flex items-center justify-center gap-1">
                                    <FaMapMarkerAlt className="text-blue-500" />
                                    {template.parks.length}
                                </div>
                                <div className="text-xs text-gray-500">Parks</div>
                            </div>

                            <div className="text-center">
                                <div className="font-bold text-green-600 flex items-center justify-center gap-1">
                                    <FaDollarSign className="text-green-500" />
                                    {template.estimatedCost.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">Est. Cost</div>
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="mb-6">
                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FaStar className="text-yellow-500" />
                                Highlights
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                                {template.highlights.slice(0, 3).map((highlight, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium">
                                        {highlight}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Parks List */}
                        <div className="mb-6">
                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-green-500" />
                                Parks Included
                            </h5>
                            <div className="space-y-2">
                                {template.parks.slice(0, 3).map((park, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700 truncate">{park.name}</span>
                                        <span className="text-gray-500 flex items-center gap-1">
                      <FaClock className="text-xs" />
                                            {park.days} day{park.days > 1 ? 's' : ''}
                    </span>
                                    </div>
                                ))}
                                {template.parks.length > 3 && (
                                    <div className="text-sm text-gray-500">
                                        +{template.parks.length - 3} more parks...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => onSelectTemplate(template)}
                            className="w-full py-4 px-6 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
                        >
                            <FaStar />
                            Use This Template
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TripTemplates;