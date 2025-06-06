// TripItinerary.jsx
import React, { useMemo } from 'react';
import { FaCalendarDay, FaClock } from 'react-icons/fa';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

const generateItinerary = (parks, startDate, transportationMode) => {
    if (!Array.isArray(parks) || !startDate) return [];

    let currentDate = new Date(startDate);
    const itinerary = [];

    parks.forEach((park, index) => {
        const duration = Math.max(1, parseInt(park.stayDuration || 2));

        for (let d = 0; d < duration; d++) {
            itinerary.push({
                type: 'visit',
                parkName: park.parkName,
                date: new Date(currentDate),
                state: park.state,
                index
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const isLast = index === parks.length - 1;
        if (!isLast) {
            itinerary.push({
                type: 'travel',
                date: new Date(currentDate),
                mode: transportationMode
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    return itinerary;
};

const TripItinerary = ({ trip }) => {
    const itinerary = useMemo(() => generateItinerary(trip.parks, trip.startDate, trip.transportationMode), [trip]);

    if (!itinerary.length) {
        return <p className="text-sm text-gray-500">No itinerary available.</p>;
    }

    return (
        <ul className="divide-y divide-gray-200 border border-gray-100 rounded-xl overflow-hidden">
            {itinerary.map((item, index) => (
                <li key={index} className="p-4 bg-white hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                        <div className="text-pink-500 mt-1">
                            {item.type === 'visit' ? <FaCalendarDay /> : <FaClock />}
                        </div>
                        <div className="flex-1">
                            {item.type === 'visit' ? (
                                <>
                                    <div className="font-semibold text-gray-800 text-sm">
                                        Visit: {item.parkName} {item.state ? `(${item.state})` : ''}
                                    </div>
                                    <div className="text-xs text-gray-500">{formatDate(item.date)}</div>
                                </>
                            ) : (
                                <>
                                    <div className="font-semibold text-gray-800 text-sm">
                                        Travel Day ({item.mode === 'flying' ? 'Flight' : 'Drive'})
                                    </div>
                                    <div className="text-xs text-gray-500">{formatDate(item.date)}</div>
                                </>
                            )}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default TripItinerary;
