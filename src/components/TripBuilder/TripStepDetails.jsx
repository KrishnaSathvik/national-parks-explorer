// TripStepDetails.jsx
import React from 'react';

const TripStepDetails = ({ tripData, setTripData, errors, dismissError }) => {
    const updateField = (field, value) => {
        setTripData(prev => ({ ...prev, [field]: value }));
        dismissError(field);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="title" className="block font-medium text-sm text-gray-700 mb-1">
                    Trip Title
                </label>
                <input
                    type="text"
                    id="title"
                    className={`w-full p-2 border rounded-xl text-sm ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g. Summer Road Trip"
                    value={tripData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block font-medium text-sm text-gray-700 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        className={`w-full p-2 border rounded-xl text-sm ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                        value={tripData.startDate || ''}
                        onChange={(e) => updateField('startDate', e.target.value)}
                    />
                    {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                </div>

                <div>
                    <label htmlFor="endDate" className="block font-medium text-sm text-gray-700 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        className={`w-full p-2 border rounded-xl text-sm ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                        value={tripData.endDate || ''}
                        onChange={(e) => updateField('endDate', e.target.value)}
                    />
                    {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                </div>
            </div>

            <div>
                <label className="block font-medium text-sm text-gray-700 mb-1">
                    Transportation Mode
                </label>
                <div className="flex gap-4">
                    <label className={`flex items-center gap-2 cursor-pointer text-sm ${tripData.transportationMode === 'driving' ? 'font-bold text-blue-600' : ''}`}>
                        <input
                            type="radio"
                            name="transportationMode"
                            value="driving"
                            checked={tripData.transportationMode === 'driving'}
                            onChange={(e) => updateField('transportationMode', e.target.value)}
                            className="accent-blue-600"
                        />
                        Driving
                    </label>

                    <label className={`flex items-center gap-2 cursor-pointer text-sm ${tripData.transportationMode === 'flying' ? 'font-bold text-purple-600' : ''}`}>
                        <input
                            type="radio"
                            name="transportationMode"
                            value="flying"
                            checked={tripData.transportationMode === 'flying'}
                            onChange={(e) => updateField('transportationMode', e.target.value)}
                            className="accent-purple-600"
                        />
                        Flying
                    </label>
                </div>
                {errors.transportationMode && <p className="text-xs text-red-500 mt-1">{errors.transportationMode}</p>}
            </div>
        </div>
    );
};

export default TripStepDetails;