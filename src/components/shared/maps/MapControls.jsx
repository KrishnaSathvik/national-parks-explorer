// src/components/shared/maps/MapControls.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    FaSearchPlus,
    FaSearchMinus,
    FaExpand,
    FaCompress,
    FaCrosshairs,
    FaLayerGroup,
    FaRoute,
    FaPrint,
    FaShare,
    FaDownload,
    FaCog,
    FaQuestion,
    FaMapMarkerAlt,
    FaRuler,
    FaDrawPolygon,
    FaTrash,
    FaUndo,
    FaRedo,
    FaSave,
    FaMap,
    FaSatellite,
    FaTh
} from 'react-icons/fa';

/**
 * Interactive map controls component for trip planning maps
 * Provides zoom, fullscreen, location, drawing tools, and style switching
 */

const MapControls = ({
                         // Map control props
                         onZoomIn = null,
                         onZoomOut = null,
                         onResetView = null,
                         onCurrentLocation = null,
                         onFullscreen = null,
                         onShare = null,
                         onPrint = null,
                         onDownload = null,

                         // Layer control props
                         onToggleLayers = null,
                         layersVisible = false,

                         // Drawing tools props
                         onStartDrawing = null,
                         onStopDrawing = null,
                         drawingMode = null, // 'marker', 'line', 'polygon', null

                         // Map style props
                         onStyleChange = null,
                         currentStyle = 'standard',

                         // Control visibility
                         showZoomControls = true,
                         showLocationControl = true,
                         showFullscreenControl = true,
                         showLayerControl = true,
                         showDrawingTools = false,
                         showMeasurementTools = false,
                         showStyleSwitcher = true,
                         showShareControls = false,

                         // Layout
                         position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
                         orientation = 'vertical', // 'vertical', 'horizontal'
                         compact = false,
                         className = ''
                     }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [showStyleMenu, setShowStyleMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [measurementMode, setMeasurementMode] = useState(null);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const controlsRef = useRef(null);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Handle clicking outside to close menus
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (controlsRef.current && !controlsRef.current.contains(event.target)) {
                setShowStyleMenu(false);
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Map styles configuration
    const mapStyles = [
        { id: 'standard', label: 'Standard', icon: FaMap },
        { id: 'satellite', label: 'Satellite', icon: FaSatellite },
        { id: 'terrain', label: 'Terrain', icon: FaTh },
        { id: 'hybrid', label: 'Hybrid', icon: FaLayerGroup }
    ];

    // Handle current location
    const handleCurrentLocation = async () => {
        if (!onCurrentLocation) return;

        setIsLocating(true);
        try {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        onCurrentLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            accuracy: position.coords.accuracy
                        });
                        setIsLocating(false);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        setIsLocating(false);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000
                    }
                );
            }
        } catch (error) {
            console.error('Geolocation not supported:', error);
            setIsLocating(false);
        }
    };

    // Handle fullscreen toggle
    const handleFullscreen = () => {
        if (!onFullscreen) return;

        if (!isFullscreen) {
            onFullscreen(true);
        } else {
            onFullscreen(false);
        }
    };

    // Handle drawing mode
    const handleDrawingMode = (mode) => {
        if (drawingMode === mode) {
            onStopDrawing?.();
        } else {
            onStartDrawing?.(mode);
        }
    };

    // Handle measurement mode
    const handleMeasurementMode = (mode) => {
        if (measurementMode === mode) {
            setMeasurementMode(null);
            onStopDrawing?.();
        } else {
            setMeasurementMode(mode);
            onStartDrawing?.(mode);
        }
    };

    // Control button component
    const ControlButton = ({
                               icon: Icon,
                               label,
                               onClick,
                               active = false,
                               loading = false,
                               disabled = false,
                               className: buttonClassName = ''
                           }) => (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            title={label}
            className={`
                p-2 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${compact ? 'p-1.5' : 'p-2'}
                ${active ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-600 hover:text-gray-800'}
                ${orientation === 'horizontal'
                ? 'first:rounded-l-lg last:rounded-r-lg border-r-0 last:border-r'
                : 'first:rounded-t-lg last:rounded-b-lg border-b-0 last:border-b'
            }
                ${buttonClassName}
            `}
        >
            {loading ? (
                <div className="w-4 h-4 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
                <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            )}
        </button>
    );

    // Control group component
    const ControlGroup = ({ children, className: groupClassName = '' }) => (
        <div className={`
            shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200
            ${orientation === 'horizontal' ? 'flex' : 'flex flex-col'}
            ${groupClassName}
        `}>
            {children}
        </div>
    );

    // Position classes
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4'
    };

    return (
        <div
            ref={controlsRef}
            className={`
                fixed ${positionClasses[position]} z-40 
                ${orientation === 'horizontal' ? 'flex flex-row gap-2' : 'flex flex-col gap-2'}
                ${className}
            `}
        >
            {/* Zoom Controls */}
            {showZoomControls && (
                <ControlGroup>
                    <ControlButton
                        icon={FaSearchPlus}
                        label="Zoom in"
                        onClick={onZoomIn}
                    />
                    <ControlButton
                        icon={FaSearchMinus}
                        label="Zoom out"
                        onClick={onZoomOut}
                    />
                    {onResetView && (
                        <ControlButton
                            icon={FaCrosshairs}
                            label="Reset view"
                            onClick={onResetView}
                        />
                    )}
                </ControlGroup>
            )}

            {/* Location & Fullscreen Controls */}
            {(showLocationControl || showFullscreenControl) && (
                <ControlGroup>
                    {showLocationControl && (
                        <ControlButton
                            icon={FaCrosshairs}
                            label="Current location"
                            onClick={handleCurrentLocation}
                            loading={isLocating}
                        />
                    )}
                    {showFullscreenControl && (
                        <ControlButton
                            icon={isFullscreen ? FaCompress : FaExpand}
                            label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            onClick={handleFullscreen}
                            active={isFullscreen}
                        />
                    )}
                </ControlGroup>
            )}

            {/* Layer Controls */}
            {showLayerControl && onToggleLayers && (
                <ControlGroup>
                    <ControlButton
                        icon={FaLayerGroup}
                        label="Toggle layers"
                        onClick={onToggleLayers}
                        active={layersVisible}
                    />
                </ControlGroup>
            )}

            {/* Drawing Tools */}
            {showDrawingTools && (
                <ControlGroup>
                    <ControlButton
                        icon={FaMapMarkerAlt}
                        label="Add marker"
                        onClick={() => handleDrawingMode('marker')}
                        active={drawingMode === 'marker'}
                    />
                    <ControlButton
                        icon={FaRoute}
                        label="Draw line"
                        onClick={() => handleDrawingMode('line')}
                        active={drawingMode === 'line'}
                    />
                    <ControlButton
                        icon={FaDrawPolygon}
                        label="Draw area"
                        onClick={() => handleDrawingMode('polygon')}
                        active={drawingMode === 'polygon'}
                    />
                    <ControlButton
                        icon={FaTrash}
                        label="Clear drawings"
                        onClick={() => onStopDrawing?.('clear')}
                    />
                </ControlGroup>
            )}

            {/* Measurement Tools */}
            {showMeasurementTools && (
                <ControlGroup>
                    <ControlButton
                        icon={FaRuler}
                        label="Measure distance"
                        onClick={() => handleMeasurementMode('distance')}
                        active={measurementMode === 'distance'}
                    />
                    <ControlButton
                        icon={FaDrawPolygon}
                        label="Measure area"
                        onClick={() => handleMeasurementMode('area')}
                        active={measurementMode === 'area'}
                    />
                </ControlGroup>
            )}

            {/* Undo/Redo Controls */}
            {(undoStack.length > 0 || redoStack.length > 0) && (
                <ControlGroup>
                    <ControlButton
                        icon={FaUndo}
                        label="Undo"
                        onClick={() => {
                            // Handle undo logic
                            if (undoStack.length > 0) {
                                const lastAction = undoStack[undoStack.length - 1];
                                setRedoStack([...redoStack, lastAction]);
                                setUndoStack(undoStack.slice(0, -1));
                            }
                        }}
                        disabled={undoStack.length === 0}
                    />
                    <ControlButton
                        icon={FaRedo}
                        label="Redo"
                        onClick={() => {
                            // Handle redo logic
                            if (redoStack.length > 0) {
                                const lastAction = redoStack[redoStack.length - 1];
                                setUndoStack([...undoStack, lastAction]);
                                setRedoStack(redoStack.slice(0, -1));
                            }
                        }}
                        disabled={redoStack.length === 0}
                    />
                </ControlGroup>
            )}

            {/* Map Style Switcher */}
            {showStyleSwitcher && onStyleChange && (
                <div className="relative">
                    <ControlGroup>
                        <ControlButton
                            icon={FaMap}
                            label="Map style"
                            onClick={() => setShowStyleMenu(!showStyleMenu)}
                            active={showStyleMenu}
                        />
                    </ControlGroup>

                    {/* Style Menu */}
                    {showStyleMenu && (
                        <div className={`
                            absolute ${position.includes('right') ? 'right-0' : 'left-0'} 
                            ${position.includes('top') ? 'top-full mt-2' : 'bottom-full mb-2'}
                            w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50
                        `}>
                            <div className="p-2">
                                <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                                    Map Style
                                </div>
                                {mapStyles.map(style => {
                                    const StyleIcon = style.icon;
                                    return (
                                        <button
                                            key={style.id}
                                            onClick={() => {
                                                onStyleChange(style.id);
                                                setShowStyleMenu(false);
                                            }}
                                            className={`
                                                w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm
                                                transition-colors hover:bg-gray-50
                                                ${currentStyle === style.id
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700'
                                            }
                                            `}
                                        >
                                            <StyleIcon className="w-4 h-4" />
                                            <span>{style.label}</span>
                                            {currentStyle === style.id && (
                                                <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Share Controls */}
            {showShareControls && (
                <div className="relative">
                    <ControlGroup>
                        <ControlButton
                            icon={FaShare}
                            label="Share & Export"
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            active={showShareMenu}
                        />
                    </ControlGroup>

                    {/* Share Menu */}
                    {showShareMenu && (
                        <div className={`
                            absolute ${position.includes('right') ? 'right-0' : 'left-0'} 
                            ${position.includes('top') ? 'top-full mt-2' : 'bottom-full mb-2'}
                            w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50
                        `}>
                            <div className="p-2">
                                <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                                    Share & Export
                                </div>

                                {onShare && (
                                    <button
                                        onClick={() => {
                                            onShare();
                                            setShowShareMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FaShare className="w-4 h-4" />
                                        <span>Share Map</span>
                                    </button>
                                )}

                                {onPrint && (
                                    <button
                                        onClick={() => {
                                            onPrint();
                                            setShowShareMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FaPrint className="w-4 h-4" />
                                        <span>Print Map</span>
                                    </button>
                                )}

                                {onDownload && (
                                    <button
                                        onClick={() => {
                                            onDownload();
                                            setShowShareMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FaDownload className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                )}

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                    onClick={() => {
                                        // Handle save map state
                                        setShowShareMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <FaSave className="w-4 h-4" />
                                    <span>Save View</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Help/Settings */}
            {!compact && (
                <ControlGroup>
                    <ControlButton
                        icon={FaQuestion}
                        label="Help"
                        onClick={() => {
                            // Show help overlay or modal
                        }}
                    />
                    <ControlButton
                        icon={FaCog}
                        label="Settings"
                        onClick={() => {
                            // Show settings modal
                        }}
                    />
                </ControlGroup>
            )}
        </div>
    );
};

// Compact mobile controls
export const MobileMapControls = ({
                                      onZoomIn,
                                      onZoomOut,
                                      onCurrentLocation,
                                      onToggleLayers,
                                      layersVisible = false
                                  }) => {
    return (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
            {/* Zoom Controls */}
            <div className="flex flex-col shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200">
                <button
                    onClick={onZoomIn}
                    className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-b border-gray-200 transition-colors"
                >
                    <FaSearchPlus className="w-5 h-5" />
                </button>
                <button
                    onClick={onZoomOut}
                    className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                >
                    <FaSearchMinus className="w-5 h-5" />
                </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onCurrentLocation}
                    className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-gray-600 hover:text-gray-800 hover:shadow-xl transition-all"
                >
                    <FaCrosshairs className="w-5 h-5" />
                </button>

                {onToggleLayers && (
                    <button
                        onClick={onToggleLayers}
                        className={`
                            p-3 border border-gray-200 rounded-lg shadow-lg transition-all hover:shadow-xl
                            ${layersVisible
                            ? 'bg-blue-50 border-blue-300 text-blue-600'
                            : 'bg-white text-gray-600 hover:text-gray-800'
                        }
                        `}
                    >
                        <FaLayerGroup className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

// Floating Action Button for main map action
export const MapActionFAB = ({
                                 icon: Icon = FaRoute,
                                 label = "Plan Route",
                                 onClick,
                                 variant = "primary", // "primary", "secondary", "success", "warning"
                                 size = "normal" // "small", "normal", "large"
                             }) => {
    const variants = {
        primary: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white",
        success: "bg-green-500 hover:bg-green-600 text-white",
        warning: "bg-orange-500 hover:bg-orange-600 text-white"
    };

    const sizes = {
        small: "w-12 h-12",
        normal: "w-14 h-14",
        large: "w-16 h-16"
    };

    const iconSizes = {
        small: "w-5 h-5",
        normal: "w-6 h-6",
        large: "w-7 h-7"
    };

    return (
        <button
            onClick={onClick}
            title={label}
            className={`
                fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50
                ${sizes[size]} ${variants[variant]}
                rounded-full shadow-xl hover:shadow-2xl
                flex items-center justify-center
                transition-all duration-200 hover:scale-110 active:scale-95
                font-semibold
            `}
        >
            <Icon className={iconSizes[size]} />
        </button>
    );
};

// Hook for map control state management
export const useMapControls = () => {
    const [zoom, setZoom] = useState(10);
    const [center, setCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US
    const [bounds, setBounds] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);

    const zoomIn = () => setZoom(prev => Math.min(prev + 1, 20));
    const zoomOut = () => setZoom(prev => Math.max(prev - 1, 1));

    const resetView = () => {
        setZoom(10);
        setCenter({ lat: 39.8283, lng: -98.5795 });
        setBounds(null);
    };

    const goToLocation = (location) => {
        setCenter(location);
        setZoom(12);
    };

    const fitBounds = (bounds) => {
        setBounds(bounds);
    };

    return {
        zoom,
        center,
        bounds,
        isFullscreen,
        currentLocation,
        setZoom,
        setCenter,
        setBounds,
        setIsFullscreen,
        setCurrentLocation,
        zoomIn,
        zoomOut,
        resetView,
        goToLocation,
        fitBounds
    };
};

// Export components and hooks
export default MapControls;
export { MobileMapControls, MapActionFAB, useMapControls };