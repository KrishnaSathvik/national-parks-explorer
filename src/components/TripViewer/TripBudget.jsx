// TripBudget.jsx
import React, { useMemo } from 'react';
import { FaDollarSign } from 'react-icons/fa';

const calculateCostBreakdown = (trip) => {
    const duration = trip.totalDuration || 1;
    const distance = trip.totalDistance || 0;
    const parksCount = trip.parks?.length || 0;
    const nights = Math.max(0, duration - 1);

    const accommodation = nights * 85; // $85/night
    const transportation = trip.transportationMode === 'flying'
        ? parksCount * 275 // $275 per flight segment
        : distance * 0.2; // $0.20 per mile
    const parkFees = parksCount * 30; // $30/park
    const food = duration * 55; // $55/day

    return {
        accommodation: Math.round(accommodation),
        transportation: Math.round(transportation),
        parkFees: Math.round(parkFees),
        food: Math.round(food),
        total: Math.round(accommodation + transportation + parkFees + food)
    };
};

const TripBudget = ({ trip }) => {
    const cost = useMemo(() => calculateCostBreakdown(trip), [trip]);

    return (
        <div className="space-y-6">
            <div className="text-sm text-gray-500">
                Your trip cost is estimated using average national park fees, budget accommodation rates, and transportation cost based on your selected travel mode.
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-100">
                <div className="divide-y divide-gray-200 text-sm">
                    <div className="flex items-center justify-between p-4">
                        <span className="font-medium text-gray-700">Accommodation</span>
                        <span className="text-gray-800 font-semibold">${cost.accommodation}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="font-medium text-gray-700">Transportation</span>
                        <span className="text-gray-800 font-semibold">${cost.transportation}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="font-medium text-gray-700">Park Fees</span>
                        <span className="text-gray-800 font-semibold">${cost.parkFees}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="font-medium text-gray-700">Food</span>
                        <span className="text-gray-800 font-semibold">${cost.food}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                        <span className="font-bold text-gray-900">Total Estimated Cost</span>
                        <span className="text-pink-600 font-bold text-lg flex items-center gap-1">
              <FaDollarSign className="text-sm" />{cost.total}
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripBudget;