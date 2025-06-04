export const seasonalParkData = {
  spring: {
    'yellowstone': {
      whyFamous: 'Wildlife awakens after winter, and thermal features are most active',
      uniqueActivities: ['Bear watching in Lamar Valley', 'Geyser photography with wildflowers', 'Early bird watching'],
      bestFeatures: ['Lower Falls with spring mist', 'Mammoth Hot Springs terraces', 'Wildlife viewing corridors'],
      tips: 'Some high elevation roads may still be closed. Pack layers for temperature swings.'
    },
    'yosemite': {
      whyFamous: 'Waterfalls reach peak flow from snowmelt, creating spectacular displays',
      uniqueActivities: ['Waterfall photography', 'Valley floor wildflower walks', 'Mist Trail hiking'],
      bestFeatures: ['Yosemite Falls at peak flow', 'Bridalveil Fall rainbow viewing', 'Valley wildflower meadows'],
      tips: 'Waterfalls are strongest in May. Trails can be muddy from snowmelt.'
    },
    'grand canyon': {
      whyFamous: 'Perfect temperatures for hiking with clear, crisp air for photography',
      uniqueActivities: ['Rim-to-rim hiking prep', 'Dawn photography', 'Desert wildflower viewing'],
      bestFeatures: ['Crystal clear canyon views', 'Comfortable hiking weather', 'Desert bloom displays'],
      tips: 'Book accommodations early. Weather can still be unpredictable in March.'
    }
    // Add more parks as needed
  },
  summer: {
    'yellowstone': {
      whyFamous: 'All roads and facilities open, prime wildlife viewing season',
      uniqueActivities: ['Backcountry camping', 'Full loop road touring', 'Ranger-led programs'],
      bestFeatures: ['All geysers accessible', 'Wildlife at peak activity', 'Full park access'],
      tips: 'Book accommodations a year in advance. Arrive early at popular spots.'
    },
    'glacier': {
      whyFamous: 'Going-to-Sun Road fully accessible, alpine wildflowers at peak',
      uniqueActivities: ['Going-to-Sun Road drive', 'Alpine hiking', 'Lake activities'],
      bestFeatures: ['Logan Pass accessibility', 'Wildflower displays', 'Clear mountain views'],
      tips: 'Going-to-Sun Road can be crowded. Consider shuttle services.'
    }
    // Add more parks
  }
  // Continue for fall and winter
};

export const getSeasonalParkInfo = (parkName, season) => {
  const parkKey = parkName.toLowerCase().replace(/\s+/g, '').replace('nationalpark', '');
  return seasonalParkData[season]?.[parkKey] || null;
};