export const createTripFromPark = (park, navigate, showToast) => {
  const newTrip = {
    title: `${park.name} Adventure`,
    description: `Explore the beautiful ${park.name} in ${park.state}`,
    parks: [{
      parkId: park.id,
      parkName: park.name,
      visitDate: '',
      stayDuration: 2,
      coordinates: park.coordinates ? {
        lat: parseFloat(park.coordinates.split(',')[0]),
        lng: parseFloat(park.coordinates.split(',')[1])
      } : { lat: 0, lng: 0 },
      state: park.state,
      description: park.highlight || park.description
    }],
    startDate: '',
    endDate: '',
    transportationMode: 'driving',
    isPublic: false
  };

  navigate('/trip-planner', { state: { preloadedTrip: newTrip } });
  showToast(`🎯 Added ${park.name} to trip planner!`, 'success');
};