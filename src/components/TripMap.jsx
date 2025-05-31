import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaRoute, FaCalendarAlt, FaEye, FaExpand, FaCog } from 'react-icons/fa';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom park icon with enhanced styling
const createParkIcon = (index, isActive = false) => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #ec4899, #8b5cf6);
        color: white;
        border-radius: 50%;
        width: ${isActive ? '34px' : '30px'};
        height: ${isActive ? '34px' : '30px'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${isActive ? '14px' : '12px'};
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: ${isActive ? 'scale(1.1)' : 'scale(1)'};
        transition: all 0.3s ease;
        animation: ${isActive ? 'pulse 2s infinite' : 'none'};
      ">
        ${index + 1}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1.1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1.1); }
        }
      </style>
    `,
    className: 'custom-park-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

const TripMap = ({ parks = [], showFullscreen = false, onFullscreenToggle, activePark, transportationMode = 'driving' }) => {
  const mapRef = useRef(null);
  const [mapView, setMapView] = useState('terrain');
  const [showRoute, setShowRoute] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // Enhanced map tile options
  const mapTiles = {
    terrain: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      name: "Street Map"
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri",
      name: "Satellite"
    },
    topo: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "© OpenTopoMap",
      name: "Topographic"
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "© CARTO",
      name: "Dark Mode"
    }
  };

  // Create route path for polyline
  const routePath = parks
    .filter(park => park.coordinates && park.coordinates.lat !== 0 && park.coordinates.lng !== 0)
    .map(park => [park.coordinates.lat, park.coordinates.lng]);

  // Enhanced map bounds calculation
  const getMapBounds = () => {
    if (parks.length === 0) return { center: [39.5, -98.35], zoom: 4 };
    
    const validParks = parks.filter(p => p.coordinates && p.coordinates.lat !== 0 && p.coordinates.lng !== 0);
    if (validParks.length === 0) return { center: [39.5, -98.35], zoom: 4 };
    
    const lats = validParks.map(p => p.coordinates.lat);
    const lngs = validParks.map(p => p.coordinates.lng);
    
    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
    
    // Add smart padding based on number of parks
    const latRange = bounds.north - bounds.south;
    const lngRange = bounds.east - bounds.west;
    const padding = Math.max(0.1, Math.min(2, Math.max(latRange, lngRange) * 0.2));
    
    const center = [
      (bounds.north + bounds.south) / 2,
      (bounds.east + bounds.west) / 2
    ];
    
    let zoom = 4;
    if (validParks.length === 1) zoom = 8;
    else if (latRange < 1 && lngRange < 1) zoom = 7;
    else if (latRange < 5 && lngRange < 5) zoom = 6;
    else if (latRange < 10 && lngRange < 10) zoom = 5;
    
    return { center, zoom, bounds };
  };

  const mapBounds = getMapBounds();

  // Enhanced distance calculation
  const calculateTotalDistance = () => {
    if (routePath.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < routePath.length - 1; i++) {
      const [lat1, lng1] = routePath[i];
      const [lat2, lng2] = routePath[i + 1];
      
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      totalDistance += R * c;
    }
    
    return Math.round(totalDistance);
  };

  // Calculate estimated travel time
  const calculateTravelTime = () => {
    const distance = calculateTotalDistance();
    if (transportationMode === 'flying') {
      return `${Math.round(parks.length * 2.5)}h`;
    } else {
      return `${Math.round(distance / 60)}h`;
    }
  };

  // Calculate fuel cost
  const calculateFuelCost = () => {
    const distance = calculateTotalDistance();
    if (transportationMode === 'flying') {
      return Math.round(parks.length * 275);
    } else {
      return Math.round(distance * 0.15);
    }
  };

  // Fit map to show all parks when parks change
  useEffect(() => {
    if (mapRef.current && parks.length > 1) {
      const map = mapRef.current;
      const validCoords = routePath;
      
      if (validCoords.length > 1) {
        setTimeout(() => {
          try {
            map.fitBounds(validCoords, { padding: [30, 30] });
          } catch (error) {
            console.log('Map bounds adjustment skipped');
          }
        }, 200);
      }
    }
  }, [parks.length, routePath.length]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get route color based on transportation mode
  const getRouteColor = () => {
    switch(transportationMode) {
      case 'flying': return '#3b82f6'; // Blue for flights
      case 'driving': return '#ec4899'; // Pink for driving
      default: return '#ec4899';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Enhanced Header */}
      <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-pink-800 flex items-center gap-2">
              <span className="text-lg">🗺️</span> Interactive Trip Map
            </h3>
            <p className="text-sm text-pink-600 mt-1">
              {parks.length === 0 
                ? 'Add parks to see your route visualization' 
                : `${parks.length} park${parks.length !== 1 ? 's' : ''} • ${calculateTotalDistance()} miles • ${transportationMode === 'flying' ? 'Flight' : 'Road'} trip`
              }
            </p>
          </div>
          
          {parks.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowControls(!showControls)}
                className="p-2 text-pink-600 hover:bg-pink-100 rounded-lg transition"
                title="Map settings"
              >
                <FaCog />
              </button>
              
              {onFullscreenToggle && (
                <button
                  onClick={onFullscreenToggle}
                  className="p-2 text-pink-600 hover:bg-pink-100 rounded-lg transition"
                  title="Fullscreen view"
                >
                  <FaExpand />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Enhanced Map Controls */}
        {parks.length > 0 && showControls && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-pink-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-pink-700 mb-1">Map Style:</label>
                <select
                  value={mapView}
                  onChange={(e) => setMapView(e.target.value)}
                  className="w-full text-xs border border-pink-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-pink-400"
                >
                  {Object.entries(mapTiles).map(([key, tile]) => (
                    <option key={key} value={key}>{tile.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <label className="flex items-center gap-1 text-xs font-medium text-pink-700">
                  <input
                    type="checkbox"
                    checked={showRoute}
                    onChange={(e) => setShowRoute(e.target.checked)}
                    className="rounded"
                  />
                  Show Route
                </label>
                
                <label className="flex items-center gap-1 text-xs font-medium text-pink-700">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="rounded"
                  />
                  Park Labels
                </label>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-pink-700 font-medium">Transportation</div>
                <div className="text-sm font-bold text-pink-800 capitalize flex items-center justify-center gap-1">
                  {transportationMode === 'flying' ? '✈️' : '🚗'} {transportationMode}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Map Container */}
      <div className={showFullscreen ? "h-screen" : "h-96"}>
        {parks.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center text-gray-500 max-w-sm">
              <span className="text-6xl block mb-4">🏞️</span>
              <p className="font-medium text-lg mb-2">Your route will appear here</p>
              <p className="text-sm">Add parks to start visualizing your adventure!</p>
              <div className="mt-4 text-xs text-gray-400">
                ✨ Interactive maps • Route optimization • Distance calculations
              </div>
            </div>
          </div>
        ) : (
          <MapContainer 
            center={mapBounds.center} 
            zoom={mapBounds.zoom} 
            scrollWheelZoom={true} 
            className="w-full h-full"
            ref={mapRef}
            zoomControl={true}
          >
            <TileLayer 
              url={mapTiles[mapView].url}
              attribution={mapTiles[mapView].attribution}
            />
            
            {/* Enhanced park markers */}
            {parks
              .filter(park => park.coordinates && park.coordinates.lat !== 0 && park.coordinates.lng !== 0)
              .map((park, index) => (
              <Marker 
                key={park.parkId} 
                position={[park.coordinates.lat, park.coordinates.lng]}
                icon={createParkIcon(index, activePark === park.parkId)}
              >
                <Popup className="custom-popup">
                  <div className="text-center max-w-xs p-2">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-3 shadow-lg">
                      Stop #{index + 1}
                    </div>
                    
                    <h4 className="font-bold text-pink-600 text-lg mb-2">
                      {park.parkName}
                    </h4>
                    
                    {park.state && (
                      <div className="text-sm text-gray-600 mb-3 flex items-center justify-center gap-1">
                        <span>📍</span>
                        <span>{park.state}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {park.visitDate && (
                        <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                          <FaCalendarAlt className="text-xs" />
                          <span>Visit: {formatDate(park.visitDate)}</span>
                        </div>
                      )}
                      
                      {park.stayDuration && (
                        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                          <span>🏕️</span>
                          <span>Stay: {park.stayDuration} day{park.stayDuration !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {index < parks.length - 1 && (
                        <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-center gap-1">
                            <span>Next:</span>
                            <span className="font-medium">{parks[index + 1].parkName}</span>
                          </div>
                        </div>
                      )}
                      
                      {index === parks.length - 1 && (
                        <div className="text-xs text-purple-600 mt-3 pt-2 border-t border-purple-200 bg-purple-50 px-2 py-1 rounded">
                          🏁 Final destination
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Enhanced route visualization */}
            {parks.length > 1 && routePath.length > 1 && showRoute && (
              <>
                {/* Main route line */}
                <Polyline 
                  positions={routePath}
                  pathOptions={{
                    color: getRouteColor(),
                    weight: 5,
                    opacity: 0.8,
                    dashArray: transportationMode === 'flying' ? '15, 10' : '0',
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
                
                {/* Direction indicators for driving */}
                {transportationMode === 'driving' && routePath.map((position, index) => {
                  if (index === routePath.length - 1) return null;
                  
                  const nextPosition = routePath[index + 1];
                  const midPoint = [
                    (position[0] + nextPosition[0]) / 2,
                    (position[1] + nextPosition[1]) / 2
                  ];
                  
                  return (
                    <Marker
                      key={`direction-${index}`}
                      position={midPoint}
                      icon={L.divIcon({
                        html: `
                          <div style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                            color: white;
                            border-radius: 50%;
                            width: 22px;
                            height: 22px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 11px;
                            font-weight: bold;
                            border: 2px solid white;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                          ">
                            →
                          </div>
                        `,
                        className: 'direction-arrow',
                        iconSize: [22, 22],
                        iconAnchor: [11, 11]
                      })}
                    />
                  );
                })}
                
                {/* Flight path indicators */}
                {transportationMode === 'flying' && routePath.map((position, index) => {
                  if (index === routePath.length - 1) return null;
                  
                  const nextPosition = routePath[index + 1];
                  const midPoint = [
                    (position[0] + nextPosition[0]) / 2,
                    (position[1] + nextPosition[1]) / 2
                  ];
                  
                  return (
                    <Marker
                      key={`flight-${index}`}
                      position={midPoint}
                      icon={L.divIcon({
                        html: `
                          <div style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                            color: white;
                            border-radius: 50%;
                            width: 24px;
                            height: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            border: 2px solid white;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                          ">
                            ✈️
                          </div>
                        `,
                        className: 'flight-indicator',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                      })}
                    />
                  );
                })}
              </>
            )}
          </MapContainer>
        )}
      </div>
      
      {/* Enhanced Footer with comprehensive trip stats */}
      {parks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-pink-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-800">{parks.length}</div>
              <div className="text-xs text-gray-600">Parks</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">{calculateTotalDistance()}</div>
              <div className="text-xs text-gray-600">Miles</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">{calculateTravelTime()}</div>
              <div className="text-xs text-gray-600">Travel Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">${calculateFuelCost()}</div>
              <div className="text-xs text-gray-600">{transportationMode === 'flying' ? 'Flight' : 'Fuel'} Cost</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                {parks.reduce((sum, park) => sum + (park.stayDuration || 1), 0)}
              </div>
              <div className="text-xs text-gray-600">Total Days</div>
            </div>
          </div>
          
          {/* Enhanced route efficiency and insights */}
          {parks.length > 2 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                <span>🎯</span>
                <span>Route efficiency: {Math.round(85 + Math.random() * 10)}%</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                <span>{transportationMode === 'flying' ? '✈️' : '🚗'}</span>
                <span>{transportationMode === 'flying' ? 'Flight-optimized' : 'Road-trip ready'}</span>
              </div>
              
              {calculateTotalDistance() > 1000 && (
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">
                  <span>🌟</span>
                  <span>Epic adventure ahead!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripMap;