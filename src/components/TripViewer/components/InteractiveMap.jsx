// src/components/TripViewer/components/InteractiveMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaRoute, FaExpand, FaCompress, FaLayers, FaInfo } from 'react-icons/fa';

// Fallback map component for when external map libraries aren't available
const InteractiveMap = ({ trip, className = "h-96" }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showRoute, setShowRoute] = useState(true);
    const [activeMarker, setActiveMarker] = useState(null);
    const mapRef = useRef(null);

    // Process park coordinates
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

    // Calculate map bounds
    const getMapBounds = () => {
        if (validParks.length === 0) {
            return { center: { lat: 39.8283, lng: -98.5795 }, zoom: 4 }; // Center of USA
        }

        const lats = validParks.map(park => {
            return typeof park.coordinates === 'string'
                ? parseFloat(park.coordinates.split(',')[0])
                : park.coordinates.lat;
        });
        const lngs = validParks.map(park => {
            return typeof park.coordinates === 'string'
                ? parseFloat(park.coordinates.split(',')[1])
                : park.coordinates.lng;
        });

        const bounds = {
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs)
        };

        const center = {
            lat: (bounds.north + bounds.south) / 2,
            lng: (bounds.east + bounds.west) / 2
        };

        // Calculate zoom level based on bounds
        const latDiff = bounds.north - bounds.south;
        const lngDiff = bounds.east - bounds.west;
        const maxDiff = Math.max(latDiff, lngDiff);

        let zoom = 4;
        if (maxDiff < 1) zoom = 8;
        else if (maxDiff < 3) zoom = 6;
        else if (maxDiff < 8) zoom = 5;
        else if (maxDiff < 15) zoom = 4;

        return { center, zoom };
    };

    const mapBounds = getMapBounds();

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Handle escape key for fullscreen
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isFullscreen]);

    const containerClass = isFullscreen
        ? "fixed inset-0 z-[60] bg-white"
        : className;

    return (
        <div className={`relative ${containerClass} rounded-xl overflow-hidden shadow-lg border border-gray-200`}>
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                    onClick={toggleFullscreen}
                    className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border border-gray-200 transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>

                <button
                    onClick={() => setShowRoute(!showRoute)}
                    className={`p-2 rounded-lg shadow-md border border-gray-200 transition-colors ${
                        showRoute
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                    title={showRoute ? "Hide Route" : "Show Route"}
                >
                    <FaRoute />
                </button>
            </div>

            {/* Map Info Panel */}
            <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md border border-gray-200 p-3 max-w-xs">
                <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <FaInfo className="text-blue-500" />
                    Trip Route
                </h3>
                <div className="text-xs text-gray-600 space-y-1">
                    <div>Parks: {validParks.length}</div>
                    <div>Distance: ~{Math.round(trip.totalDistance || 0)} miles</div>
                    <div>Mode: {trip.transportationMode === 'flying' ? 'Flight + Car' : 'Road Trip'}</div>
                </div>
            </div>

            {/* Fallback Map Display */}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 via-green-100 to-blue-100 relative overflow-hidden">
                {/* Background grid pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#000" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Park Markers */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-4xl">
                        {validParks.map((park, index) => {
                            const lat = typeof park.coordinates === 'string'
                                ? parseFloat(park.coordinates.split(',')[0])
                                : park.coordinates.lat;
                            const lng = typeof park.coordinates === 'string'
                                ? parseFloat(park.coordinates.split(',')[1])
                                : park.coordinates.lng;

                            // Convert coordinates to percentage positions (simplified projection)
                            const x = ((lng + 180) / 360) * 100;
                            const y = ((90 - lat) / 180) * 100;

                            return (
                                <div
                                    key={park.parkId || index}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                    style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                                    onClick={() => setActiveMarker(activeMarker === index ? null : index)}
                                >
                                    {/* Marker */}
                                    <div className="relative">
                                        <div className={`w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-200 ${
                                            index === 0 ? 'bg-green-500 hover:bg-green-600' :
                                                index === validParks.length - 1 ? 'bg-red-500 hover:bg-red-600' :
                                                    'bg-blue-500 hover:bg-blue-600'
                                        } group-hover:scale-110`}>
                                            {index + 1}
                                        </div>

                                        {/* Route line to next park */}
                                        {showRoute && index < validParks.length - 1 && (
                                            <div className="absolute top-4 left-4 w-px h-8 bg-blue-400 opacity-60 transform rotate-45"></div>
                                        )}
                                    </div>

                                    {/* Info popup */}
                                    {activeMarker === index && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-48 z-20">
                                            <div className="text-sm font-semibold text-gray-800 mb-1">
                                                {park.parkName}
                                            </div>
                                            <div className="text-xs text-gray-600 mb-2">
                                                {park.state} • {park.stayDuration || 2} day{(park.stayDuration || 2) > 1 ? 's' : ''}
                                            </div>
                                            {park.suggestedActivities && park.suggestedActivities.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    Activities: {park.suggestedActivities.slice(0, 2).join(', ')}
                                                </div>
                                            )}
                                            {/* Pointer */}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Route Path */}
                {showRoute && validParks.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path
                            d={validParks.map((park, index) => {
                                const lat = typeof park.coordinates === 'string'
                                    ? parseFloat(park.coordinates.split(',')[0])
                                    : park.coordinates.lat;
                                const lng = typeof park.coordinates === 'string'
                                    ? parseFloat(park.coordinates.split(',')[1])
                                    : park.coordinates.lng;

                                const x = ((lng + 180) / 360) * 100;
                                const y = ((90 - lat) / 180) * 100;

                                return `${index === 0 ? 'M' : 'L'} ${Math.max(5, Math.min(95, x))}% ${Math.max(5, Math.min(95, y))}%`;
                            }).join(' ')}
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="8,4"
                            fill="none"
                            opacity="0.7"
                        />
                    </svg>
                )}

                {/* Empty state */}
                {validParks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <FaMapMarkerAlt className="mx-auto text-4xl mb-2 opacity-50" />
                            <p className="text-sm">No valid park coordinates available</p>
                            <p className="text-xs mt-1">Add parks with coordinates to see your route</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-md border border-gray-200 p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        <span>Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                        <span>Waypoint</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                        <span>End</span>
                    </div>
                    {showRoute && (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-1 bg-blue-400 opacity-70" style={{borderStyle: 'dashed'}}></div>
                            <span>Route</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Trip Stats Overlay */}
            <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-md border border-gray-200 p-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center">
                        <div className="font-bold text-blue-600">{validParks.length}</div>
                        <div className="text-gray-600">Parks</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-green-600">{trip.totalDuration || 1}</div>
                        <div className="text-gray-600">Days</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveMap;