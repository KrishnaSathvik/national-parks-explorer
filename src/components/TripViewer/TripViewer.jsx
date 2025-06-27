// src/components/TripViewer/TripViewer.jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaCalendarAlt, FaRoute, FaDollarSign, FaEdit, FaTimes, FaShare, FaCopy } from 'react-icons/fa';
import { useTripPlanner } from '../TripPlanner/core/TripPlannerProvider';
import TripOverview from './tabs/TripOverview';
import TripItinerary from './tabs/TripItinerary';
import TripMapTab from './tabs/TripMapTab';
import TripBudget from './tabs/TripBudget';
import ShareOptions from './components/ShareOptions';
import { shareTrip } from '../../utils/tripPlanner/tripHelpers';

const TripViewer = ({ trip, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { startBuilding, stopViewing } = useTripPlanner();

  // Enhanced stats calculation
  const tripStats = {
    parks: trip.parks?.length || 0,
    days: trip.totalDuration || 1,
    miles: Math.round(trip.totalDistance || 0),
    cost: Math.round(trip.estimatedCost || 0)
  };

  const tabs = [
    { id: 'overview', title: 'Overview', icon: FaEye, mobileTitle: 'Info' },
    { id: 'itinerary', title: 'Itinerary', icon: FaCalendarAlt, mobileTitle: 'Days' },
    { id: 'map', title: 'Route Map', icon: FaRoute, mobileTitle: 'Map' },
    { id: 'budget', title: 'Budget', icon: FaDollarSign, mobileTitle: 'Cost' }
  ];

  // Handle edit trip
  const handleEdit = () => {
    if (onEdit) {
      onEdit(trip);
    } else {
      // Fallback to provider method
      startBuilding(trip);
      handleClose();
    }
  };

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      stopViewing();
    }
  };

  // Handle share
  const handleShare = async () => {
    setIsLoading(true);
    try {
      const result = await shareTrip(trip);
      if (result.success) {
        if (result.method === 'clipboard') {
          // Show temporary success message
          const tempToast = document.createElement('div');
          tempToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[60]';
          tempToast.textContent = 'Trip details copied to clipboard!';
          document.body.appendChild(tempToast);
          setTimeout(() => document.body.removeChild(tempToast), 3000);
        }
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key >= '1' && e.key <= '4') {
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [tabs]);

  return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200">

            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold truncate mb-2">
                    {trip.title || 'Untitled Trip'}
                  </h1>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 sm:gap-6 text-sm text-white/90">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{tripStats.parks}</span>
                      <span className="hidden sm:inline">Parks</span>
                      <span className="sm:hidden">P</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{tripStats.days}</span>
                      <span className="hidden sm:inline">Days</span>
                      <span className="sm:hidden">D</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{tripStats.miles}</span>
                      <span className="hidden sm:inline">Miles</span>
                      <span className="sm:hidden">Mi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">${tripStats.cost.toLocaleString()}</span>
                      <span className="hidden sm:inline">Budget</span>
                      <span className="sm:hidden">$</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                      onClick={handleShare}
                      disabled={isLoading}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                      title="Share Trip"
                  >
                    <FaShare className="text-sm sm:text-base" />
                  </button>

                  <button
                      onClick={handleEdit}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                      title="Edit Trip"
                  >
                    <FaEdit className="text-sm sm:text-base" />
                  </button>

                  <button
                      onClick={handleClose}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                      title="Close (Esc)"
                  >
                    <FaTimes className="text-sm sm:text-base" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all whitespace-nowrap relative ${
                              isActive
                                  ? 'text-pink-600 bg-pink-50'
                                  : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className="text-sm sm:text-base" />
                        <span className="text-sm sm:text-base">
                      <span className="hidden sm:inline">{tab.title}</span>
                      <span className="sm:hidden">{tab.mobileTitle}</span>
                    </span>

                        {/* Keyboard shortcut hint */}
                        <span className="hidden lg:inline-block text-xs text-gray-400 ml-1">
                      {index + 1}
                    </span>

                        {/* Active indicator */}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"></div>
                        )}
                      </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-3 sm:p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="animate-fadeIn">
                {activeTab === 'overview' && <TripOverview trip={trip} />}
                {activeTab === 'itinerary' && <TripItinerary trip={trip} />}
                {activeTab === 'map' && <TripMapTab trip={trip} />}
                {activeTab === 'budget' && <TripBudget trip={trip} />}
              </div>
            </div>

            {/* Footer with helpful hints */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="hidden lg:block">
                  Press 1-4 to switch tabs • ESC to close
                </div>
                <div className="text-right">
                  <span className="capitalize">{trip.transportationMode || 'driving'}</span> trip
                  {trip.startDate && (
                      <span className="ml-2">
                    • Starts {new Date(trip.startDate).toLocaleDateString()}
                  </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Options Modal */}
        {showShareOptions && (
            <ShareOptions
                trip={trip}
                onClose={() => setShowShareOptions(false)}
            />
        )}

        <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb #f3f4f6;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </>
  );
};

export default TripViewer;