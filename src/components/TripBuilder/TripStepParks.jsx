// TripStepParks.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';

const TripStepParks = ({ tripData, setTripData, allParks, showToast }) => {
    const addPark = (park) => {
        if (tripData.parks.find(p => p.parkId === park.parkId)) {
            showToast('Park already added', 'warning');
            return;
        }
        const newPark = {
            parkId: park.parkId,
            parkName: park.name,
            state: park.state,
            stayDuration: 2,
            coordinates: park.coordinates
        };
        setTripData(prev => ({ ...prev, parks: [...prev.parks, newPark] }));
        showToast(`${park.name} added`, 'success');
    };

    const removePark = (parkId) => {
        setTripData(prev => ({ ...prev, parks: prev.parks.filter(p => p.parkId !== parkId) }));
        showToast('Park removed', 'info');
    };

    const updateDuration = (parkId, value) => {
        const duration = Math.max(1, parseInt(value));
        setTripData(prev => ({
            ...prev,
            parks: prev.parks.map(p => p.parkId === parkId ? { ...p, stayDuration: duration } : p)
        }));
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-semibold text-gray-700 mb-2">Selected Parks</h3>
                {tripData.parks.length === 0 ? (
                    <p className="text-sm text-gray-500">No parks selected yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-200 border border-gray-100 rounded-xl overflow-hidden">
                        {tripData.parks.map((park, index) => (
                            <li key={park.parkId} className="p-4 bg-white flex items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gradient-to-br from-pink-500 to-yellow-400 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800">{park.parkName}</h4>
                                        <p className="text-xs text-gray-500">{park.state}</p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                                            Stay:
                                            <input
                                                type="number"
                                                value={park.stayDuration}
                                                onChange={(e) => updateDuration(park.parkId, e.target.value)}
                                                min={1}
                                                className="w-16 border p-1 rounded-md text-sm"
                                            />
                                            day{park.stayDuration > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removePark(park.parkId)}
                                    className="text-red-500 hover:text-red-600"
                                    title="Remove"
                                >
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h3 className="font-semibold text-gray-700 mb-2">Available Parks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {allParks.map(park => (
                        <button
                            key={park.parkId}
                            onClick={() => addPark(park)}
                            className="bg-white border border-gray-200 hover:border-pink-400 rounded-xl p-3 text-left shadow-sm"
                        >
                            <div className="font-semibold text-sm text-gray-800">{park.name}</div>
                            <div className="text-xs text-gray-500">{park.state}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TripStepParks;
