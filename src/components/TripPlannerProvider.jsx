import React, { createContext, useContext } from 'react';
import { useTripPlanner } from '../hooks/useTripPlanner';

const TripPlannerContext = createContext();

export const useTripPlannerContext = () => {
    const context = useContext(TripPlannerContext);
    if (!context) {
        throw new Error('useTripPlannerContext must be used within TripPlannerProvider');
    }
    return context;
};

export const TripPlannerProvider = ({ children }) => {
    const tripPlannerState = useTripPlanner();

    return (
        <TripPlannerContext.Provider value={tripPlannerState}>
            {children}
        </TripPlannerContext.Provider>
    );
};