// TripViewer.jsx - Refactored container layout
import React, { useState } from 'react';
import { FaEye, FaCalendarAlt, FaRoute, FaDollarSign, FaEdit, FaTimes } from 'react-icons/fa';
import TripStatsHeader from './TripStatsHeader';
import TripOverview from './TripOverview';
import TripItinerary from './TripItinerary';
import TripMapTab from './TripMapTab';
import TripBudget from './TripBudget';
import MobileErrorToast from '../MobileErrorToast';

const TripViewer = ({ trip, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [errorToast, setErrorToast] = useState(null);

  const tabs = [
    { id: 'overview', title: 'Overview', icon: FaEye, mobileTitle: 'Info' },
    { id: 'itinerary', title: 'Itinerary', icon: FaCalendarAlt, mobileTitle: 'Days' },
    { id: 'map', title: 'Route Map', icon: FaRoute, mobileTitle: 'Map' },
    { id: 'budget', title: 'Budget', icon: FaDollarSign, mobileTitle: 'Cost' }
  ];

  return (
      <>
        {errorToast && (
            <MobileErrorToast
                message={errorToast.message}
                type={errorToast.type}
                onDismiss={() => setErrorToast(null)}
            />
        )}

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Header with quick stats */}
            <TripStatsHeader trip={trip} onEdit={onEdit} onClose={onClose} />

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-white">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-shrink-0 flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all whitespace-nowrap ${
                              isActive
                                  ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                                  : 'text-gray-600 hover:text-pink-600'
                          }`}
                      >
                        <Icon className="text-sm sm:text-base" />
                        <span className="text-sm sm:text-base">
                      <span className="hidden sm:inline">{tab.title}</span>
                      <span className="sm:hidden">{tab.mobileTitle}</span>
                    </span>
                      </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-3 sm:p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'overview' && <TripOverview trip={trip} />}
              {activeTab === 'itinerary' && <TripItinerary trip={trip} />}
              {activeTab === 'map' && <TripMapTab trip={trip} />}
              {activeTab === 'budget' && <TripBudget trip={trip} />}
            </div>
          </div>
        </div>
      </>
  );
};

export default TripViewer;
