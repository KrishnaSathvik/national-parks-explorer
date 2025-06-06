import React from 'react';

const TripStatsCard = ({ value, label, color }) => {
    return (
        <div className={`bg-gradient-to-br ${color} text-white p-4 rounded-xl shadow flex flex-col items-center justify-center`}>
            <div className="text-lg sm:text-xl font-bold">{value}</div>
            <div className="text-xs sm:text-sm font-medium tracking-wide">{label}</div>
        </div>
    );
};

export default TripStatsCard;
