// src/components/shared/maps/MapLayers.jsx
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
    FaLayerGroup,
    FaEye,
    FaEyeSlash,
    FaMapMarkerAlt,
    FaRoute,
    FaTree,
    FaCamera,
    FaUtensils,
    FaBed,
    FaGasPump,
    FaCloudSun,
    FaCar,
    FaPlane,
    FaInfoCircle,
    FaFilter,
    FaSearch,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';

/**
 * Advanced map layer management system for trip planning
 * Handles parks, attractions, routes, weather, traffic, and custom overlays
 */

// Map Layers Context
const MapLayersContext = createContext();

export const useMapLayers = () => {
    const context = useContext(MapLayersContext);
    if (!context) {
        throw new Error('useMapLayers must be used within a MapLayersProvider');
    }
    return context;
};

// Map Layers Provider
export const MapLayersProvider = ({ children, initialLayers = {} }) => {
    const [layers, setLayers] = useState({
        // Base layers
        parks: { visible: true, data: [], loading: false, error: null },
        attractions: { visible: true, data: [], loading: false, error: null },
        restaurants: { visible: false, data: [], loading: false, error: null },
        hotels: { visible: false, data: [], loading: false, error: null },
        gas_stations: { visible: false, data: [], loading: false, error: null },

        // Route layers
        route: { visible: true, data: null, loading: false, error: null },
        traffic: { visible: false, data: [], loading: false, error: null },

        // Weather layers
        weather: { visible: false, data: null, loading: false, error: null },

        // Custom layers
        trip_markers: { visible: true, data: [], loading: false, error: null },
        user_markers: { visible: true, data: [], loading: false, error: null },

        ...initialLayers
    });

    const [layerGroups, setLayerGroups] = useState({
        points_of_interest: {
            label: 'Points of Interest',
            expanded: true,
            layers: ['parks', 'attractions', 'restaurants', 'hotels', 'gas_stations']
        },
        navigation: {
            label: 'Navigation',
            expanded: true,
            layers: ['route', 'traffic']
        },
        environment: {
            label: 'Environment',
            expanded: false,
            layers: ['weather']
        },
        custom: {
            label: 'Trip Markers',
            expanded: true,
            layers: ['trip_markers', 'user_markers']
        }
    });

    // Toggle layer visibility
    const toggleLayer = (layerId) => {
        setLayers(prev => ({
            ...prev,
            [layerId]: {
                ...prev[layerId],
                visible: !prev[layerId].visible
            }
        }));
    };

    // Update layer data
    const updateLayerData = (layerId, data, options = {}) => {
        setLayers(prev => ({
            ...prev,
            [layerId]: {
                ...prev[layerId],
                data,
                loading: false,
                error: null,
                ...options
            }
        }));
    };

    // Set layer loading state
    const setLayerLoading = (layerId, loading = true) => {
        setLayers(prev => ({
            ...prev,
            [layerId]: {
                ...prev[layerId],
                loading
            }
        }));
    };

    // Set layer error
    const setLayerError = (layerId, error) => {
        setLayers(prev => ({
            ...prev,
            [layerId]: {
                ...prev[layerId],
                error,
                loading: false
            }
        }));
    };

    // Get visible layers
    const getVisibleLayers = () => {
        return Object.entries(layers)
            .filter(([_, layer]) => layer.visible)
            .reduce((acc, [id, layer]) => ({ ...acc, [id]: layer }), {});
    };

    // Toggle layer group
    const toggleLayerGroup = (groupId) => {
        setLayerGroups(prev => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                expanded: !prev[groupId].expanded
            }
        }));
    };

    const contextValue = {
        layers,
        layerGroups,
        toggleLayer,
        updateLayerData,
        setLayerLoading,
        setLayerError,
        getVisibleLayers,
        toggleLayerGroup
    };

    return (
        <MapLayersContext.Provider value={contextValue}>
            {children}
        </MapLayersContext.Provider>
    );
};

// Main Map Layers Component
const MapLayers = ({
                       className = '',
                       compact = false,
                       showSearch = true,
                       showFilters = true,
                       onLayerChange = null
                   }) => {
    const {
        layers,
        layerGroups,
        toggleLayer,
        getVisibleLayers,
        toggleLayerGroup
    } = useMapLayers();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Layer configurations
    const layerConfigs = {
        parks: {
            label: 'National Parks',
            icon: FaTree,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'National and state parks'
        },
        attractions: {
            label: 'Attractions',
            icon: FaCamera,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: 'Tourist attractions and landmarks'
        },
        restaurants: {
            label: 'Restaurants',
            icon: FaUtensils,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            description: 'Restaurants and dining'
        },
        hotels: {
            label: 'Hotels',
            icon: FaBed,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Hotels and accommodation'
        },
        gas_stations: {
            label: 'Gas Stations',
            icon: FaGasPump,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            description: 'Gas stations and fuel stops'
        },
        route: {
            label: 'Trip Route',
            icon: FaRoute,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            description: 'Your planned route'
        },
        traffic: {
            label: 'Traffic',
            icon: FaCar,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            description: 'Real-time traffic conditions'
        },
        weather: {
            label: 'Weather',
            icon: FaCloudSun,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
            description: 'Weather conditions and forecast'
        },
        trip_markers: {
            label: 'Trip Stops',
            icon: FaMapMarkerAlt,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            description: 'Your planned stops and destinations'
        },
        user_markers: {
            label: 'Custom Markers',
            icon: FaMapMarkerAlt,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            description: 'Your custom points of interest'
        }
    };

    // Filter layers based on search and category
    const filteredLayers = useMemo(() => {
        let filtered = Object.entries(layers);

        if (searchTerm) {
            filtered = filtered.filter(([id, layer]) => {
                const config = layerConfigs[id];
                return config?.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    config?.description.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        if (filterCategory !== 'all') {
            const groupLayers = layerGroups[filterCategory]?.layers || [];
            filtered = filtered.filter(([id]) => groupLayers.includes(id));
        }

        return filtered;
    }, [layers, searchTerm, filterCategory, layerConfigs, layerGroups]);

    // Handle layer toggle with callback
    const handleLayerToggle = (layerId) => {
        toggleLayer(layerId);
        if (onLayerChange) {
            onLayerChange(layerId, !layers[layerId].visible);
        }
    };

    // Get layer count for categories
    const getLayerCount = (groupId) => {
        const group = layerGroups[groupId];
        if (!group) return 0;
        return group.layers.filter(id => layers[id]?.visible).length;
    };

    if (compact) {
        return <CompactLayerControl />;
    }

    return (
        <div className={`map-layers ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaLayerGroup className="w-4 h-4" />
                    Map Layers
                </h3>
                <div className="text-sm text-gray-500">
                    {Object.values(getVisibleLayers()).length} active
                </div>
            </div>

            {/* Search and Filters */}
            {(showSearch || showFilters) && (
                <div className="p-4 border-b border-gray-200 space-y-3">
                    {/* Search */}
                    {showSearch && (
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search layers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Category Filter */}
                    {showFilters && (
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">All Categories</option>
                                {Object.entries(layerGroups).map(([id, group]) => (
                                    <option key={id} value={id}>
                                        {group.label} ({getLayerCount(id)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Layer Groups */}
            <div className="flex-1 overflow-y-auto">
                {Object.entries(layerGroups).map(([groupId, group]) => (
                    <LayerGroup
                        key={groupId}
                        groupId={groupId}
                        group={group}
                        layers={layers}
                        layerConfigs={layerConfigs}
                        filteredLayers={filteredLayers}
                        onLayerToggle={handleLayerToggle}
                    />
                ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            Object.keys(layers).forEach(id => {
                                if (!layers[id].visible) {
                                    handleLayerToggle(id);
                                }
                            });
                        }}
                        className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        Show All
                    </button>
                    <button
                        onClick={() => {
                            Object.keys(layers).forEach(id => {
                                if (layers[id].visible) {
                                    handleLayerToggle(id);
                                }
                            });
                        }}
                        className="flex-1 px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Hide All
                    </button>
                </div>
            </div>
        </div>
    );
};

// Layer Group Component
const LayerGroup = ({
                        groupId,
                        group,
                        layers,
                        layerConfigs,
                        filteredLayers,
                        onLayerToggle
                    }) => {
    const { toggleLayerGroup } = useMapLayers();

    const groupLayers = group.layers.filter(layerId =>
        filteredLayers.some(([id]) => id === layerId)
    );

    if (groupLayers.length === 0) return null;

    const visibleCount = groupLayers.filter(id => layers[id]?.visible).length;

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            {/* Group Header */}
            <button
                onClick={() => toggleLayerGroup(groupId)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800">{group.label}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {visibleCount}/{groupLayers.length}
                    </span>
                </div>
                {group.expanded ? (
                    <FaChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <FaChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>

            {/* Group Layers */}
            {group.expanded && (
                <div className="pb-2">
                    {groupLayers.map(layerId => (
                        <LayerItem
                            key={layerId}
                            layerId={layerId}
                            layer={layers[layerId]}
                            config={layerConfigs[layerId]}
                            onToggle={() => onLayerToggle(layerId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Individual Layer Item Component
const LayerItem = ({ layerId, layer, config, onToggle }) => {
    if (!config) return null;

    const IconComponent = config.icon;

    return (
        <div className="px-4 py-2 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <IconComponent className={`w-4 h-4 ${config.color}`} />
                    </div>

                    {/* Layer Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 text-sm">
                                {config.label}
                            </span>
                            {layer.loading && (
                                <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            )}
                            {layer.error && (
                                <FaInfoCircle className="w-3 h-3 text-red-500" title={layer.error} />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                            {config.description}
                        </p>
                        {layer.data && Array.isArray(layer.data) && layer.data.length > 0 && (
                            <p className="text-xs text-gray-400">
                                {layer.data.length} items
                            </p>
                        )}
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className={`p-2 rounded-lg transition-all ${
                        layer.visible
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                    {layer.visible ? (
                        <FaEye className="w-4 h-4" />
                    ) : (
                        <FaEyeSlash className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

// Compact Layer Control for mobile/small spaces
const CompactLayerControl = () => {
    const { layers, toggleLayer, getVisibleLayers } = useMapLayers();
    const [isExpanded, setIsExpanded] = useState(false);

    const visibleCount = Object.values(getVisibleLayers()).length;
    const totalCount = Object.keys(layers).length;

    return (
        <div className="compact-layer-control">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
                <FaLayerGroup className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                    {visibleCount}/{totalCount}
                </span>
                {isExpanded ? (
                    <FaChevronUp className="w-3 h-3 text-gray-400" />
                ) : (
                    <FaChevronDown className="w-3 h-3 text-gray-400" />
                )}
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <MapLayers compact={false} />
                </div>
            )}
        </div>
    );
};

// Hook for managing specific layer types
export const useLayerData = () => {
    const { updateLayerData, setLayerLoading, setLayerError } = useMapLayers();

    // Load parks data
    const loadParks = async (bounds) => {
        setLayerLoading('parks');
        try {
            // Simulate API call - replace with actual park data service
            const parks = await fetchParksData(bounds);
            updateLayerData('parks', parks);
        } catch (error) {
            setLayerError('parks', error.message);
        }
    };

    // Load attractions data
    const loadAttractions = async (bounds) => {
        setLayerLoading('attractions');
        try {
            const attractions = await fetchAttractionsData(bounds);
            updateLayerData('attractions', attractions);
        } catch (error) {
            setLayerError('attractions', error.message);
        }
    };

    // Load route data
    const loadRoute = async (waypoints) => {
        setLayerLoading('route');
        try {
            const route = await calculateRoute(waypoints);
            updateLayerData('route', route);
        } catch (error) {
            setLayerError('route', error.message);
        }
    };

    // Load weather data
    const loadWeather = async (location) => {
        setLayerLoading('weather');
        try {
            const weather = await fetchWeatherData(location);
            updateLayerData('weather', weather);
        } catch (error) {
            setLayerError('weather', error.message);
        }
    };

    return {
        loadParks,
        loadAttractions,
        loadRoute,
        loadWeather
    };
};

// Mock data functions (replace with actual API calls)
const fetchParksData = async (bounds) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
        {
            id: 'yellowstone',
            name: 'Yellowstone National Park',
            type: 'national_park',
            coordinates: [-110.5885, 44.4280],
            description: 'America\'s first national park'
        },
        {
            id: 'grand-canyon',
            name: 'Grand Canyon National Park',
            type: 'national_park',
            coordinates: [-112.1401, 36.0544],
            description: 'One of the world\'s most spectacular canyons'
        }
    ];
};

const fetchAttractionsData = async (bounds) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
        {
            id: 'mount-rushmore',
            name: 'Mount Rushmore',
            type: 'monument',
            coordinates: [-103.4590, 43.8791],
            description: 'Iconic presidential sculpture'
        }
    ];
};

const calculateRoute = async (waypoints) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        coordinates: waypoints,
        distance: '1,234 miles',
        duration: '18 hours',
        polyline: 'encoded_polyline_string'
    };
};

const fetchWeatherData = async (location) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
        current: {
            temperature: 72,
            condition: 'Sunny',
            humidity: 45
        },
        forecast: [
            { day: 'Today', high: 75, low: 62, condition: 'Sunny' },
            { day: 'Tomorrow', high: 73, low: 59, condition: 'Partly Cloudy' }
        ]
    };
};

export default MapLayers;