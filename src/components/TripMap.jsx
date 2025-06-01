import React, { useRef, useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaRoute, FaCalendarAlt, FaExpand, FaCog, FaCar, FaPlane } from 'react-icons/fa';

// Map fallback component for when Leaflet fails to load
const MapFallback = ({ parks, transportationMode, onRetry }) => (
  <div className="h-96 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl flex items-center justify-center">
    <div className="text-center max-w-sm px-4">
      <div className="text-6xl mb-4">🗺️</div>
      <h4 className="font-semibold text-gray-700 mb-2">Interactive Map</h4>
      <p className="text-sm text-gray-500 mb-4">
        {parks.length > 0 
          ? `${parks.length} parks selected • ${transportationMode === 'flying' ? 'Flight' : 'Road'} trip`
          : 'Add parks to see your route'
        }
      </p>
      {parks.length > 0 && (
        <div className="space-y-2">
          {parks.slice(0, 3).map((park, index) => (
            <div key={park.parkId} className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <span>{park.parkName}</span>
            </div>
          ))}
          {parks.length > 3 && (
            <div className="text-xs text-gray-500">+{parks.length - 3} more parks...</div>
          )}
        </div>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
        >
          Try Loading Map
        </button>
      )}
    </div>
  </div>
);

// Simple map component using basic HTML/CSS for route visualization
const SimpleRouteMap = ({ parks, transportationMode }) => {
  const calculateTotalDistance = () => {
    if (parks.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < parks.length - 1; i++) {
      const park1 = parks[i];
      const park2 = parks[i + 1];
      
      if (park1.coordinates && park2.coordinates) {
        const distance = calculateDistance(park1.coordinates, park2.coordinates);
        totalDistance += distance;
      }
    }
    
    return Math.round(totalDistance);
  };

  const calculateDistance = (coord1, coord2) => {
    // Simple distance calculation (Haversine formula)
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-4 w-8 h-8 bg-blue-300 rounded-full"></div>
        <div className="absolute top-12 right-8 w-6 h-6 bg-green-300 rounded-full"></div>
        <div className="absolute bottom-8 left-12 w-4 h-4 bg-purple-300 rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-10 h-10 bg-pink-300 rounded-full"></div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Route Overview</h3>
          <p className="text-sm text-gray-600">
            {parks.length} stops • {calculateTotalDistance()} miles • {transportationMode}
          </p>
        </div>
        
        <div className="flex-1 flex flex-col justify-center space-y-4">
          {parks.map((park, index) => (
            <div key={park.parkId} className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg">
                {index + 1}
              </div>
              <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                <h4 className="font-semibold text-gray-800">{park.parkName}</h4>
                {park.state && (
                  <p className="text-sm text-gray-600">{park.state}</p>
                )}
              </div>
              {index < parks.length - 1 && (
                <div className="flex items-center gap-2 text-gray-500">
                  {transportationMode === 'flying' ? <FaPlane /> : <FaCar />}
                  <div className="text-xs">
                    {park.coordinates && parks[index + 1].coordinates
                      ? `${Math.round(calculateDistance(park.coordinates, parks[index + 1].coordinates))} mi`
                      : 'Est. distance'
                    }
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {parks.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🏞️</div>
              <p className="font-medium">Add parks to see your route</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Leaflet map component (only loads if Leaflet is available)
const LeafletMap = ({ parks, transportationMode, onFullscreenToggle, activePark }) => {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [leafletError, setLeafletError] = useState(false);

  useEffect(() => {
    // Check if Leaflet is available
    if (typeof window !== 'undefined') {
      const checkLeaflet = () => {
        if (window.L) {
          setMapReady(true);
          initializeMap();
        } else {
          // Try to load Leaflet dynamically
          loadLeaflet();
        }
      };

      checkLeaflet();
    }
  }, []);

  const loadLeaflet = () => {
    // Load Leaflet CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(cssLink);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.onload = () => {
      if (window.L) {
        // Fix default markers
        delete window.L.Icon.Default.prototype._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });
        
        setMapReady(true);
        initializeMap();
      }
    };
    script.onerror = () => {
      setLeafletError(true);
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    try {
      // Calculate map center and bounds
      const { center, zoom } = getMapBounds();
      
      // Create map
      const map = window.L.map(mapRef.current, {
        center,
        zoom,
        scrollWheelZoom: true,
      });

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add markers for parks
      parks.forEach((park, index) => {
        if (park.coordinates && park.coordinates.lat && park.coordinates.lng) {
          const marker = window.L.marker([park.coordinates.lat, park.coordinates.lng])
            .addTo(map);
          
          marker.bindPopup(`
            <div class="text-center p-2">
              <h4 class="font-bold text-lg">${park.parkName}</h4>
              <p class="text-sm text-gray-600">Stop #${index + 1}</p>
              ${park.state ? `<p class="text-sm">${park.state}</p>` : ''}
            </div>
          `);
        }
      });

      // Add route line if multiple parks
      if (parks.length > 1) {
        const validCoords = parks
          .filter(park => park.coordinates && park.coordinates.lat && park.coordinates.lng)
          .map(park => [park.coordinates.lat, park.coordinates.lng]);
        
        if (validCoords.length > 1) {
          window.L.polyline(validCoords, {
            color: transportationMode === 'flying' ? '#3b82f6' : '#ec4899',
            weight: 4,
            opacity: 0.8,
            dashArray: transportationMode === 'flying' ? '10, 5' : '0'
          }).addTo(map);
        }
      }

      // Fit bounds if multiple parks
      if (parks.length > 1) {
        const validCoords = parks
          .filter(park => park.coordinates && park.coordinates.lat && park.coordinates.lng)
          .map(park => [park.coordinates.lat, park.coordinates.lng]);
        
        if (validCoords.length > 1) {
          map.fitBounds(validCoords, { padding: [20, 20] });
        }
      }

    } catch (error) {
      console.error('Map initialization error:', error);
      setLeafletError(true);
    }
  };

  const getMapBounds = () => {
    if (parks.length === 0) return { center: [39.5, -98.35], zoom: 4 };
    
    const validParks = parks.filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng);
    if (validParks.length === 0) return { center: [39.5, -98.35], zoom: 4 };
    
    if (validParks.length === 1) {
      return {
        center: [validParks[0].coordinates.lat, validParks[0].coordinates.lng],
        zoom: 8
      };
    }
    
    // Calculate center of all parks
    const avgLat = validParks.reduce((sum, park) => sum + park.coordinates.lat, 0) / validParks.length;
    const avgLng = validParks.reduce((sum, park) => sum + park.coordinates.lng, 0) / validParks.length;
    
    return { center: [avgLat, avgLng], zoom: 6 };
  };

  if (leafletError) {
    return <MapFallback parks={parks} transportationMode={transportationMode} />;
  }

  return (
    <div className="h-96 relative">
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const TripMap = ({ 
  parks = [], 
  showFullscreen = false, 
  onFullscreenToggle, 
  activePark, 
  transportationMode = 'driving',
  useSimpleMap = false 
}) => {
  const [showControls, setShowControls] = useState(false);
  const [mapError, setMapError] = useState(false);

  const calculateTotalDistance = () => {
    if (parks.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < parks.length - 1; i++) {
      const park1 = parks[i];
      const park2 = parks[i + 1];
      
      if (park1.coordinates && park2.coordinates) {
        const distance = calculateDistance(park1.coordinates, park2.coordinates);
        totalDistance += distance;
      }
    }
    
    return Math.round(totalDistance);
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateTravelTime = () => {
    const distance = calculateTotalDistance();
    if (transportationMode === 'flying') {
      return `${Math.round(parks.length * 2.5)}h`;
    } else {
      return `${Math.round(distance / 60)}h`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-pink-800 flex items-center gap-2">
              <span className="text-lg">🗺️</span> 
              <span className="hidden sm:inline">Interactive Trip Map</span>
              <span className="sm:hidden">Trip Map</span>
            </h3>
            <p className="text-sm text-pink-600 mt-1">
              {parks.length === 0 
                ? 'Add parks to see your route' 
                : `${parks.length} park${parks.length !== 1 ? 's' : ''} • ${calculateTotalDistance()} miles`
              }
            </p>
          </div>
          
          {parks.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowControls(!showControls)}
                className="p-2 text-pink-600 hover:bg-pink-100 rounded-lg transition text-sm"
                title="Map settings"
              >
                <FaCog />
              </button>
              
              {onFullscreenToggle && (
                <button
                  onClick={onFullscreenToggle}
                  className="p-2 text-pink-600 hover:bg-pink-100 rounded-lg transition text-sm"
                  title="Fullscreen view"
                >
                  <FaExpand />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Map Container */}
      <div className={showFullscreen ? "h-screen" : "h-96"}>
        {parks.length === 0 ? (
          <MapFallback parks={parks} transportationMode={transportationMode} />
        ) : useSimpleMap || mapError ? (
          <SimpleRouteMap parks={parks} transportationMode={transportationMode} />
        ) : (
          <LeafletMap 
            parks={parks} 
            transportationMode={transportationMode}
            onFullscreenToggle={onFullscreenToggle}
            activePark={activePark}
          />
        )}
      </div>
      
      {/* Footer with trip stats */}
      {parks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-pink-50 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
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
              <div className="text-lg font-bold text-gray-800">
                {parks.reduce((sum, park) => sum + (park.stayDuration || 1), 0)}
              </div>
              <div className="text-xs text-gray-600">Total Days</div>
            </div>
          </div>
          
          {/* Transportation mode indicator */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
              {transportationMode === 'flying' ? <FaPlane /> : <FaCar />}
              <span className="font-medium capitalize">{transportationMode} trip</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMap;