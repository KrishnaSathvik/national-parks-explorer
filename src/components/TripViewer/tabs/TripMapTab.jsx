// src/components/TripViewer/tabs/TripMapTab.jsx
import React, { useState } from 'react';
import { FaMapMarkerAlt, FaRoute, FaInfoCircle, FaCompass, FaRoad, FaClock, FaExpand } from 'react-icons/fa';
import InteractiveMap from '../components/InteractiveMap';

const TripMapTab = ({ trip }) => {
    const [mapView, setMapView] = useState('route'); // 'route' or 'details'
    const [showRouteDetails, setShowRouteDetails] = useState(true);

    // Calculate trip statistics
    const validParks = trip.parks?.filter(park => {
        if (!park.coordinates) return false;
        const lat = typeof park.coordinates === 'string'
            ? parseFloat(park.coordinates.split(',')[0])
            : park.coordinates.lat;
        const lng = typeof park.coordinates === 'string'
            ? parseFloat(park.coordinates.split(',')[1])
            : park.coordinates.lng;
        return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }) || [];

    // Get states covered
    const statesCovered = [...new Set(trip.parks?.map(park => park.state).filter(Boolean))];

    // Calculate total driving time estimate
    const estimatedDrivingTime = trip.transportationMode === 'driving'
        ? Math.round((trip.totalDistance || 0) / 60) // Assuming 60 mph average
        : 0;

    // Calculate route segments
    const routeSegments = [];
    if (trip.parks && trip.parks.length > 1) {
        for (let i = 0; i < trip.parks.length - 1; i++) {
            const fromPark = trip.parks[i];
            const toPark = trip.parks[i + 1];

            // Estimate distance between parks (simplified calculation)
            let segmentDistance = 0;
            if (fromPark.coordinates && toPark.coordinates) {
                const lat1 = typeof fromPark.coordinates === 'string'
                    ? parseFloat(fromPark.coordinates.split(',')[0])
                    : fromPark.coordinates.lat;
                const lng1 = typeof fromPark.coordinates === 'string'
                    ? parseFloat(fromPark.coordinates.split(',')[1])
                    : fromPark.coordinates.lng;
                const lat2 = typeof toPark.coordinates === 'string'
                    ? parseFloat(toPark.coordinates.split(',')[0])
                    : toPark.coordinates.lat;
                const lng2 = typeof toPark.coordinates === 'string'
                    ? parseFloat(toPark.coordinates.split(',')[1])
                    : toPark.coordinates.lng;

                // Haversine formula for distance calculation
                const R = 3959; // Earth's radius in miles
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLng = (lng2 - lng1) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                segmentDistance = Math.round(R * c);
            }

            routeSegments.push({
                from: fromPark,
                to: toPark,
                distance: segmentDistance,
                estimatedTime: trip.transportationMode === 'flying'
                    ? '2-4 hours'
                    : `${Math.round(segmentDistance / 60)} hours`
            });
        }
    }

    return (
        <div className="space-y-6">
            {/* Trip Route Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <FaRoute className="text-blue-600" />
                    Route Overview
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-blue-600">{validParks.length}</div>
                        <div className="text-blue-700">Parks</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-green-600">{Math.round(trip.totalDistance || 0).toLocaleString()}</div>
                        <div className="text-green-700">Miles</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-purple-600">{statesCovered.length}</div>
                        <div className="text-purple-700">States</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-orange-600">
                            {trip.transportationMode === 'driving' ? `${estimatedDrivingTime}h` : 'Flight'}
                        </div>
                        <div className="text-orange-700">Travel Time</div>
                    </div>
                </div>

                {/* States covered */}
                {statesCovered.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="text-sm text-blue-700 mb-2">States/Regions:</div>
                        <div className="flex flex-wrap gap-2">
                            {statesCovered.map((state, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {state}
                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Interactive Map */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        Interactive Route Map
                    </h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMapView('route')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                mapView === 'route'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Route View
                        </button>
                        <button
                            onClick={() => setMapView('details')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                mapView === 'details'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Park Details
                        </button>
                    </div>
                </div>

                {/* Map Component */}
                <InteractiveMap trip={trip} className="h-96" />
            </div>

            {/* Route Segments */}
            {routeSegments.length > 0 && showRouteDetails && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FaRoad className="text-green-500" />
                            Route Segments
                        </h4>
                        <button
                            onClick={() => setShowRouteDetails(!showRouteDetails)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            {showRouteDetails ? 'Hide' : 'Show'} Details
                        </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {routeSegments.map((segment, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Segment Number */}
                                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>

                                    {/* Route Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-800">
                                                {segment.from.parkName} → {segment.to.parkName}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-600">
                                                    {segment.distance > 0 ? `${segment.distance} miles` : 'Distance unknown'}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FaClock />
                                                    {segment.estimatedTime}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transportation mode for this segment */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                          trip.transportationMode === 'flying'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                      }`}>
                        {trip.transportationMode === 'flying' ? 'Flight + Drive' : 'Road Trip'}
                      </span>
                                            {segment.distance > 500 && trip.transportationMode === 'driving' && (
                                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Long Drive
                        </span>
                                            )}
                                        </div>

                                        {/* Segment-specific tips */}
                                        {segment.distance > 0 && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                {trip.transportationMode === 'driving' && segment.distance > 400 &&
                                                    "Consider breaking this drive into multiple days for safety and comfort."}
                                                {trip.transportationMode === 'driving' && segment.distance <= 200 &&
                                                    "A pleasant drive with opportunities for scenic stops."}
                                                {trip.transportationMode === 'flying' &&
                                                    "Book flights early for better rates. Don't forget rental car reservations."}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Park Sequence */}
            {validParks.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FaCompass className="text-green-500" />
                            Park Sequence ({validParks.length} stops)
                        </h4>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {trip.parks.map((park, index) => (
                            <div key={park.parkId || index} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Stop Number */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                        index === 0 ? 'bg-green-500' :
                                            index === trip.parks.length - 1 ? 'bg-red-500' :
                                                'bg-blue-500'
                                    }`}>
                                        {index + 1}
                                    </div>

                                    {/* Park Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h5 className="font-semibold text-gray-800">{park.parkName}</h5>
                                                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                                    <FaMapMarkerAlt className="text-red-400 text-xs" />
                                                    {park.state}
                                                    {index === 0 && (
                                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              Start
                            </span>
                                                    )}
                                                    {index === trip.parks.length - 1 && (
                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              End
                            </span>
                                                    )}
                                                </p>
                                                {park.description && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {park.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-sm font-medium text-gray-800">
                                                    {park.stayDuration || 2} day{(park.stayDuration || 2) > 1 ? 's' : ''}
                                                </div>
                                                {index < trip.parks.length - 1 && routeSegments[index] && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Next: {routeSegments[index].distance}mi
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Coordinates display */}
                                        {park.coordinates && (
                                            <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                                <span>📍</span>
                                                <span>
                          {typeof park.coordinates === 'string'
                              ? park.coordinates
                              : `${park.coordinates.lat}, ${park.coordinates.lng}`
                          }
                        </span>
                                            </div>
                                        )}

                                        {/* Activities preview */}
                                        {park.suggestedActivities && park.suggestedActivities.length > 0 && (
                                            <div className="mt-2">
                                                <div className="text-xs text-gray-500 mb-1">Suggested activities:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {park.suggestedActivities.slice(0, 3).map((activity, actIndex) => (
                                                        <span key={actIndex} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                              {activity}
                            </span>
                                                    ))}
                                                    {park.suggestedActivities.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-full text-xs">
                              +{park.suggestedActivities.length - 3} more
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Travel segment info */}
                                {index < trip.parks.length - 1 && routeSegments[index] && (
                                    <div className="mt-3 ml-14 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaRoad className="text-blue-500" />
                                                <span>
                          Travel to {trip.parks[index + 1].parkName}
                        </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {routeSegments[index].distance}mi • {routeSegments[index].estimatedTime}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Travel Tips */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-green-600" />
                    Route Planning Tips
                </h4>
                <ul className="space-y-2 text-sm text-green-700">
                    {trip.transportationMode === 'driving' ? (
                        <>
                            <li>• Plan rest stops every 2 hours for safety and comfort</li>
                            <li>• Download offline maps in case of poor cell service in remote areas</li>
                            <li>• Check road conditions and park closures before departure</li>
                            <li>• Fill up gas tank before entering remote park areas</li>
                            {trip.totalDistance > 1000 && (
                                <li>• Consider breaking long drives into multiple days for a more relaxed pace</li>
                            )}
                            {estimatedDrivingTime > 12 && (
                                <li>• Total driving time exceeds 12 hours - plan overnight stops</li>
                            )}
                        </>
                    ) : (
                        <>
                            <li>• Book flights 2-3 months in advance for better rates</li>
                            <li>• Reserve rental cars at each destination airport</li>
                            <li>• Check baggage restrictions for camping and outdoor gear</li>
                            <li>• Allow extra time for airport transfers and check-in</li>
                            <li>• Consider travel insurance for weather-related delays</li>
                        </>
                    )}
                    <li>• Always have park entrance fees and passes ready</li>
                    <li>• Check park websites for seasonal closures and current alerts</li>
                    <li>• Download park apps for offline maps and information</li>
                </ul>
            </div>

            {/* Map Legend */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Map Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                        <span className="text-gray-600">Start Point</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                        <span className="text-gray-600">Waypoint</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                        <span className="text-gray-600">End Point</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 bg-blue-400 opacity-70 border-dashed border-blue-400"></div>
                        <span className="text-gray-600">Planned Route</span>
                    </div>
                </div>
            </div>

            {/* Trip Statistics Summary */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Trip Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="font-bold text-blue-600 text-lg">{trip.parks?.length || 0}</div>
                        <div className="text-xs text-blue-700">Total Parks</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="font-bold text-green-600 text-lg">{Math.round(trip.totalDistance || 0)}</div>
                        <div className="text-xs text-green-700">Total Miles</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="font-bold text-purple-600 text-lg">{trip.totalDuration || 1}</div>
                        <div className="text-xs text-purple-700">Total Days</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="font-bold text-orange-600 text-lg">{statesCovered.length}</div>
                        <div className="text-xs text-orange-700">States Visited</div>
                    </div>
                </div>
            </div>

            {/* No coordinates warning */}
            {validParks.length === 0 && trip.parks?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-yellow-600 mt-1" />
                        <div>
                            <h4 className="font-semibold text-yellow-800 mb-2">Missing Location Data</h4>
                            <p className="text-sm text-yellow-700 mb-3">
                                Some parks in your trip don't have coordinate information available.
                                The map may not show the complete route. This is normal for some remote
                                or newly added parks.
                            </p>
                            <div className="text-xs text-yellow-600">
                                Parks with missing coordinates: {trip.parks.length - validParks.length}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {trip.parks?.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FaMapMarkerAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Parks Selected</h3>
                    <p className="text-sm text-gray-500">
                        Add parks to your trip to see the route map and travel details.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TripMapTab;