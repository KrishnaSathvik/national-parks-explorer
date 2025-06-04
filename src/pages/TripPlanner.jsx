// Enhanced TripPlanner.jsx with improved functionality
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TripBuilder from '../components/TripBuilder';
import TripList from '../components/TripList';
import TripViewer from '../components/TripViewer';
import FadeInWrapper from '../components/FadeInWrapper';
import { useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";
import { 
  FaPlus, 
  FaRoute, 
  FaCalendarAlt, 
  FaChartBar, 
  FaStar, 
  FaBrain, 
  FaMapMarkerAlt, 
  FaDollarSign,
  FaArrowLeft,
  FaClock,
  FaHiking,
  FaCamera,
  FaInfoCircle
} from 'react-icons/fa';

const TripPlanner = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [allParks, setAllParks] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('my-trips');
  
  // Enhanced auto-loading preferences
  const [autoLoadPreferences, setAutoLoadPreferences] = useState({
    enabled: true,
    triggerOnFirstVisit: true,
    lastRecommended: null,
    showVisualIndicators: true
  });

  const [autoLoadingState, setAutoLoadingState] = useState({
    isLoading: false,
    hasTriggered: false,
    recommendedTemplate: null,
    showRecommendationBanner: false
  });

  // Tab configuration
  const tabs = [
    { id: 'my-trips', title: 'My Trips', icon: FaRoute, description: 'Your planned adventures' },
    { id: 'templates', title: 'Templates', icon: FaStar, description: 'Detailed trip guides' },
    { id: 'analytics', title: 'Analytics', icon: FaChartBar, description: 'Your travel insights' },
    { id: 'suggestions', title: 'Suggestions', icon: FaBrain, description: 'Smart recommendations' }
  ];

  // Enhanced detailed trip templates
  const detailedTemplates = [
    {
      id: 'big-bend-texas',
      title: '🌵 Big Bend National Park Adventure',
      subtitle: 'Texas Desert & Rio Grande Experience',
      description: 'Explore the Chihuahuan Desert, paddle the Rio Grande, and experience one of America\'s most remote national parks',
      duration: 3,
      difficulty: 'Moderate',
      estimatedCost: 1200,
      season: 'October-April',
      image: '🌵',
      region: 'Texas',
      highlights: ['Santa Elena Canyon', 'Chisos Mountains', 'Hot Springs', 'Dark Sky Stargazing'],
      transportation: {
        arrival: 'Fly to Midland/Odessa (MAF)',
        drivingTime: '4.5 hours from airport',
        rentalCarRequired: true
      },
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Desert Introduction',
          activities: [
            { time: '10:00 AM', type: 'travel', activity: 'Flight STL → MAF (Midland International)', icon: '✈️' },
            { time: '2:00 PM', type: 'drive', activity: 'Scenic drive to Big Bend (4.5 hrs)', icon: '🚗' },
            { time: '7:00 PM', type: 'accommodation', activity: 'Check-in: Chisos Mountains Lodge', icon: '🛏️' },
            { time: '8:00 PM', type: 'sunset', activity: 'Sotol Vista Overlook sunset', icon: '🌄' }
          ],
          tips: ['Fill up on gas and bring snacks - services are limited!', 'Chisos Lodge books up fast - reserve early']
        },
        {
          day: 2,
          title: 'Rio Grande & Canyon Adventures',
          activities: [
            { time: '7:00 AM', type: 'hike', activity: 'Santa Elena Canyon Trail (1.7 mi RT)', icon: '🥾' },
            { time: '10:00 AM', type: 'water', activity: 'Rio Grande kayaking/rafting (half-day)', icon: '🛶' },
            { time: '2:00 PM', type: 'drive', activity: 'Ross Maxwell Scenic Drive', icon: '🛣️' },
            { time: '4:00 PM', type: 'explore', activity: 'Mule Ears Viewpoint & Tuff Canyon', icon: '📸' },
            { time: '9:00 PM', type: 'stargazing', activity: 'Dark Sky Park stargazing', icon: '⭐' }
          ],
          tips: ['Start early to avoid heat', 'Book river trips in advance', 'Bring headlamp for stargazing']
        },
        {
          day: 3,
          title: 'Chisos Mountains & Departure',
          activities: [
            { time: '6:00 AM', type: 'hike', activity: 'Lost Mine Trail (4.8 mi RT) - early start!', icon: '🥾' },
            { time: '10:00 AM', type: 'explore', activity: 'Window View Trail (0.3 mi easy)', icon: '🚶' },
            { time: '12:00 PM', type: 'visit', activity: 'Panther Junction Visitor Center', icon: '🏛️' },
            { time: '2:00 PM', type: 'travel', activity: 'Drive back to Midland (5 hrs + airport time)', icon: '🚗' }
          ],
          tips: ['Allow 7 hours total for departure day', 'Pack lunch for the road']
        }
      ],
      budgetBreakdown: {
        accommodation: { nights: 2, rate: 150, total: 300 },
        transportation: { flights: 400, rental: 180, gas: 120, total: 700 },
        food: { daily: 60, days: 3, total: 180 },
        activities: { riverTrip: 80, parkFees: 30, total: 110 },
        total: 1290
      },
      packingList: ['Hiking boots', 'Sun hat', 'Sunscreen SPF 50+', 'Water bottles', 'Headlamp', 'Layers for temperature swings'],
      bonusActivities: [
        'Boquillas Crossing to Mexico (passport required)',
        'Hot Springs Historic Trail natural soak',
        'Photography workshops at sunset'
      ]
    },
    {
      id: 'utah-big5-extended',
      title: '🏜️ Utah\'s Mighty Five Complete',
      subtitle: 'All Five Utah National Parks',
      description: 'Experience every Utah national park with expert routing and hidden gems',
      duration: 12,
      difficulty: 'Moderate to Advanced',
      estimatedCost: 3200,
      season: 'April-October',
      image: '🏜️',
      region: 'Utah',
      highlights: ['Delicate Arch', 'Narrows', 'Angels Landing', 'Mesa Arch', 'Bryce Amphitheater'],
      transportation: {
        arrival: 'Fly to Salt Lake City or Las Vegas',
        drivingTime: 'Various between parks',
        rentalCarRequired: true
      },
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Arches National Park',
          activities: [
            { time: '9:00 AM', type: 'travel', activity: 'Arrival in Moab', icon: '✈️' },
            { time: '11:00 AM', type: 'hike', activity: 'Delicate Arch Trail (3 mi RT)', icon: '🥾' },
            { time: '3:00 PM', type: 'explore', activity: 'Windows Section & Turret Arch', icon: '📸' },
            { time: '6:00 PM', type: 'sunset', activity: 'Courthouse Towers sunset', icon: '🌄' }
          ],
          tips: ['Start with easier hikes to acclimate', 'Bring plenty of water']
        },
        {
          day: 2,
          title: 'Canyonlands & Moab Adventures',
          activities: [
            { time: '8:00 AM', type: 'hike', activity: 'Mesa Arch Sunrise Hike', icon: '🌅' },
            { time: '10:00 AM', type: 'drive', activity: 'Island in the Sky Scenic Drive', icon: '🛣️' },
            { time: '2:00 PM', type: 'explore', activity: 'Dead Horse Point State Park', icon: '📍' },
            { time: '5:00 PM', type: 'relax', activity: 'Downtown Moab - Dinner & shopping', icon: '🍽️' }
          ],
          tips: ['Watch for afternoon thunderstorms', 'Use sun protection at Dead Horse Point']
        },
        {
          day: 3,
          title: 'Drive to Capitol Reef',
          activities: [
            { time: '9:00 AM', type: 'drive', activity: 'Moab → Capitol Reef via Scenic Byway 24 (2.5 hrs)', icon: '🚗' },
            { time: '12:00 PM', type: 'explore', activity: 'Fruita Historic District & Petroglyphs', icon: '🏛️' },
            { time: '3:00 PM', type: 'hike', activity: 'Hickman Bridge Trail (1.8 mi RT)', icon: '🥾' },
            { time: '6:00 PM', type: 'sunset', activity: 'Sunset Point View', icon: '🌄' }
          ],
          tips: ['Try pies at Gifford House!', 'Spot bighorn sheep along the drive']
        },
        {
          day: 4,
          title: 'Capitol Reef & Scenic Drive',
          activities: [
            { time: '8:00 AM', type: 'hike', activity: 'Cohab Canyon or Cassidy Arch Trail', icon: '🥾' },
            { time: '12:00 PM', type: 'drive', activity: 'Scenic Capitol Gorge Drive', icon: '🛣️' },
            { time: '3:00 PM', type: 'relax', activity: 'Apple picking or picnic in Fruita', icon: '🍎' }
          ],
          tips: ['Cohab Canyon offers incredible hidden views']
        },
        {
          day: 5,
          title: 'Scenic Drive to Bryce Canyon',
          activities: [
            { time: '9:00 AM', type: 'drive', activity: 'Capitol Reef → Bryce Canyon (~2.5 hrs)', icon: '🚗' },
            { time: '12:00 PM', type: 'explore', activity: 'Scenic stops along UT-12 (Burr Trail, Escalante)', icon: '📍' },
            { time: '4:00 PM', type: 'accommodation', activity: 'Check-in: Bryce Lodge or Ruby’s Inn', icon: '🛏️' },
            { time: '6:00 PM', type: 'sunset', activity: 'Sunset Point Amphitheater', icon: '🌄' }
          ],
          tips: ['UT-12 is one of America’s most scenic drives']
        },
        {
          day: 6,
          title: 'Bryce Canyon Hikes & Hoodoos',
          activities: [
            { time: '7:00 AM', type: 'hike', activity: 'Navajo Loop & Queen’s Garden (3 mi combo)', icon: '🥾' },
            { time: '11:00 AM', type: 'explore', activity: 'Scenic Drive to Rainbow Point', icon: '🛣️' },
            { time: '3:00 PM', type: 'relax', activity: 'Visitor Center or local lunch', icon: '🍽️' }
          ],
          tips: ['Early morning gives best light on hoodoos']
        },
        {
          day: 7,
          title: 'Drive to Zion National Park',
          activities: [
            { time: '8:00 AM', type: 'drive', activity: 'Bryce → Zion (2 hrs)', icon: '🚗' },
            { time: '11:00 AM', type: 'explore', activity: 'Zion Scenic Drive via shuttle', icon: '🚌' },
            { time: '3:00 PM', type: 'hike', activity: 'Riverside Walk or Watchman Trail', icon: '🥾' }
          ],
          tips: ['Zion has shuttle-only zones in peak season']
        },
        {
          day: 8,
          title: 'Zion Extreme Adventures',
          activities: [
            { time: '6:00 AM', type: 'hike', activity: 'Angels Landing (permit required)', icon: '⚠️' },
            { time: '12:00 PM', type: 'explore', activity: 'Zion Human History Museum', icon: '🏛️' },
            { time: '4:00 PM', type: 'relax', activity: 'Springdale town shopping/dinner', icon: '🛍️' }
          ],
          tips: ['Permits for Angels Landing must be applied in advance']
        },
        {
          day: 9,
          title: 'The Narrows & Riverside',
          activities: [
            { time: '7:00 AM', type: 'hike', activity: 'The Narrows (rent water gear)', icon: '🌊' },
            { time: '1:00 PM', type: 'relax', activity: 'Zion Lodge lunch', icon: '🍴' }
          ],
          tips: ['Check flash flood warnings before entering The Narrows']
        }
        // Continue up to day 12 if needed with Las Vegas/SLC return
      ],
      budgetBreakdown: {
        accommodation: { nights: 11, rate: 120, total: 1320 },
        transportation: { flights: 500, rental: 660, gas: 400, total: 1560 },
        food: { daily: 70, days: 12, total: 840 },
        activities: { parkFees: 150, gear: 80, guides: 200, total: 430 },
        total: 4150
      },
      packingList: [
        'Sturdy hiking shoes',
        'Lightweight layers (desert days, chilly nights)',
        'Sunhat & sunglasses',
        'Hydration pack or large water bottles',
        'Permit printouts (e.g., Angels Landing)',
        'Trekking poles (optional for Narrows)'
      ],
      bonusActivities: [
        'Canyoneering in Escalante',
        'Horseback riding in Bryce',
        'Helicopter ride over Canyonlands',
        'Moab stargazing tours',
        'ATV tours near Zion or Arches'
      ]
    },
    {
      id: 'yellowstone-tetons-wildlife',
      title: '🦌 Yellowstone & Tetons Wildlife Safari',
      subtitle: 'Wildlife Photography & Geysers',
      description: 'Perfect timing for wildlife viewing, geyser exploration, and mountain photography',
      duration: 8,
      difficulty: 'Easy to Moderate',
      estimatedCost: 2400,
      season: 'May-September',
      image: '🦌',
      region: 'Wyoming',
      highlights: ['Old Faithful', 'Grand Prismatic', 'Wildlife viewing', 'Jackson Lake'],
      transportation: {
        arrival: 'Jackson Hole Airport (JAC)',
        drivingTime: 'Minimal - stay in area',
        rentalCarRequired: true
      },
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Jackson & Scenic Drive',
          activities: [
            { time: '11:00 AM', type: 'travel', activity: 'Arrive at Jackson Hole Airport', icon: '✈️' },
            { time: '1:00 PM', type: 'drive', activity: 'Scenic drive to Grand Teton NP', icon: '🚗' },
            { time: '3:00 PM', type: 'explore', activity: 'Jenny Lake Overlook & Visitor Center', icon: '📍' },
            { time: '6:00 PM', type: 'sunset', activity: 'Sunset at Oxbow Bend', icon: '🌄' }
          ],
          tips: ['Oxbow Bend is best at sunset for wildlife and reflections']
        },
        {
          day: 2,
          title: 'Grand Teton Wildlife Day',
          activities: [
            { time: '6:00 AM', type: 'wildlife', activity: 'Sunrise wildlife spotting at Mormon Row', icon: '🦌' },
            { time: '9:00 AM', type: 'hike', activity: 'Taggart Lake Trail (3.8 mi RT)', icon: '🥾' },
            { time: '2:00 PM', type: 'explore', activity: 'Signal Mountain & Jackson Lake', icon: '📸' },
            { time: '9:00 PM', type: 'stargazing', activity: 'Dark skies over Grand Teton', icon: '⭐' }
          ],
          tips: ['Use binoculars and long lenses for wildlife shots']
        },
        {
          day: 3,
          title: 'Drive to Yellowstone & Geyser Basin',
          activities: [
            { time: '8:00 AM', type: 'drive', activity: 'Drive from Tetons → Yellowstone South Entrance (~1.5 hrs)', icon: '🚗' },
            { time: '11:00 AM', type: 'explore', activity: 'West Thumb Geyser Basin', icon: '♨️' },
            { time: '1:00 PM', type: 'explore', activity: 'Old Faithful Geyser eruption', icon: '🌋' },
            { time: '3:00 PM', type: 'hike', activity: 'Observation Point Trail (1.6 mi RT)', icon: '🥾' },
            { time: '6:00 PM', type: 'accommodation', activity: 'Check-in: Old Faithful Inn or nearby lodging', icon: '🛏️' }
          ],
          tips: ['Check eruption times at visitor center']
        },
        {
          day: 4,
          title: 'Geysers & Hot Springs Photography',
          activities: [
            { time: '7:00 AM', type: 'explore', activity: 'Morning Glory Pool & Upper Geyser Basin walk', icon: '📸' },
            { time: '11:00 AM', type: 'explore', activity: 'Grand Prismatic Spring Overlook (via Fairy Falls Trail)', icon: '🌈' },
            { time: '2:00 PM', type: 'drive', activity: 'Firehole Lake Drive & Gibbon Falls', icon: '🛣️' }
          ],
          tips: ['Visit Grand Prismatic around midday for vivid colors']
        },
        {
          day: 5,
          title: 'Wildlife Safari: Hayden & Lamar Valley',
          activities: [
            { time: '5:00 AM', type: 'wildlife', activity: 'Drive to Hayden Valley for sunrise safari', icon: '🦅' },
            { time: '9:00 AM', type: 'visit', activity: 'Grand Canyon of the Yellowstone - Artist Point', icon: '🏞️' },
            { time: '1:00 PM', type: 'picnic', activity: 'Lunch at Canyon Village', icon: '🍽️' },
            { time: '4:00 PM', type: 'drive', activity: 'Drive to Lamar Valley (2 hrs)', icon: '🚗' },
            { time: '6:00 PM', type: 'wildlife', activity: 'Evening wolf/bear spotting in Lamar Valley', icon: '🐺' }
          ],
          tips: ['Bring long zoom lenses or spotting scopes']
        },
        {
          day: 6,
          title: 'Mammoth Area & Northern Yellowstone',
          activities: [
            { time: '9:00 AM', type: 'explore', activity: 'Mammoth Hot Springs Terraces walk', icon: '♨️' },
            { time: '12:00 PM', type: 'visit', activity: 'Historic Fort Yellowstone area', icon: '🏛️' },
            { time: '3:00 PM', type: 'relax', activity: 'Boiling River soak (if open)', icon: '💧' }
          ],
          tips: ['Watch for elk herds around Mammoth area']
        },
        {
          day: 7,
          title: 'Return to Tetons & Relax',
          activities: [
            { time: '9:00 AM', type: 'drive', activity: 'Yellowstone → Grand Teton (~2 hrs)', icon: '🚗' },
            { time: '12:00 PM', type: 'explore', activity: 'Lunch at Dornan’s, Moose Junction', icon: '🍴' },
            { time: '2:00 PM', type: 'relax', activity: 'Scenic float trip on Snake River', icon: '🛶' },
            { time: '6:00 PM', type: 'sunset', activity: 'Final sunset at Schwabacher Landing', icon: '🌄' }
          ],
          tips: ['Float trips can be booked online in advance']
        },
        {
          day: 8,
          title: 'Departure from Jackson Hole',
          activities: [
            { time: '8:00 AM', type: 'souvenir', activity: 'Quick breakfast & gift shop in Jackson', icon: '☕' },
            { time: '10:00 AM', type: 'travel', activity: 'Fly out from Jackson Hole Airport', icon: '✈️' }
          ],
          tips: ['Arrive 90 minutes early to JAC - small airport but busy in summer']
        }
      ],
      budgetBreakdown: {
        accommodation: { nights: 7, rate: 180, total: 1260 },
        transportation: { flights: 600, rental: 420, gas: 200, total: 1220 },
        food: { daily: 80, days: 8, total: 640 },
        activities: { parkFees: 70, tours: 300, gear: 110, total: 480 },
        total: 3600
      },
      packingList: [
        'Camera with telephoto lens',
        'Binoculars',
        'Warm layers (mornings are cold)',
        'Refillable water bottles',
        'Bear spray (available locally)',
        'National Park Pass or entry fee'
      ],
      bonusActivities: [
        'Horseback riding near Roosevelt',
        'Yellowstone Lake boat tours',
        'Wildlife photography workshops',
        'Scenic flight over the Tetons',
        'Night sky ranger program at Colter Bay'
      ]
    },
    {
      id: 'yosemite-sequoia-california',
      title: '🌲 Yosemite & Sequoia National Park Adventure',
      subtitle: 'Granite Cliffs & Giant Trees of California',
      description: 'Experience two of California’s crown jewels—massive granite peaks, giant sequoias, and some of the best hikes and views in the U.S.',
      duration: 5,
      difficulty: 'Moderate',
      estimatedCost: 1600,
      season: 'May-October',
      image: '🌲',
      region: 'California',
      highlights: ['Yosemite Valley', 'Half Dome View', 'Mariposa Grove', 'Tunnel View', 'General Sherman Tree'],
      transportation: {
        arrival: 'Fly to Fresno Yosemite International (FAT)',
        drivingTime: '1.5–2 hours to each park',
        rentalCarRequired: true
      },
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Giant Trees in Sequoia',
          activities: [
            { time: '10:00 AM', type: 'travel', activity: 'Flight into Fresno Yosemite Intl (FAT)', icon: '✈️' },
            { time: '12:00 PM', type: 'drive', activity: 'Drive to Sequoia National Park (~2 hrs)', icon: '🚗' },
            { time: '3:00 PM', type: 'explore', activity: 'Walk the Congress Trail to General Sherman Tree', icon: '🌲' },
            { time: '6:00 PM', type: 'sunset', activity: 'Sunset at Moro Rock (short climb)', icon: '🌄' },
            { time: '8:00 PM', type: 'accommodation', activity: 'Check-in: Wuksachi Lodge or nearby', icon: '🛏️' }
          ],
          tips: ['Start early — park roads can be narrow and curvy', 'Bring layers; elevation = chilly evenings']
        },
        {
          day: 2,
          title: 'Sequoia & Kings Canyon Scenic Drive',
          activities: [
            { time: '8:00 AM', type: 'hike', activity: 'Hike to Tokopah Falls (4 mi RT)', icon: '🥾' },
            { time: '11:00 AM', type: 'drive', activity: 'Scenic drive to Kings Canyon', icon: '🛣️' },
            { time: '1:00 PM', type: 'explore', activity: 'Zumwalt Meadow & Grizzly Falls picnic', icon: '🍽️' },
            { time: '5:00 PM', type: 'drive', activity: 'Head toward Yosemite lodging (2.5–3 hrs)', icon: '🚗' }
          ],
          tips: ['Kings Canyon is one of the deepest in the U.S.!', 'Watch for black bears in meadows']
        },
        {
          day: 3,
          title: 'Yosemite Valley Essentials',
          activities: [
            { time: '7:00 AM', type: 'sunrise', activity: 'Tunnel View at sunrise', icon: '🌄' },
            { time: '9:00 AM', type: 'hike', activity: 'Vernal & Nevada Falls via Mist Trail (5–7 mi RT)', icon: '💦' },
            { time: '2:00 PM', type: 'visit', activity: 'Yosemite Visitor Center & Valley View', icon: '🏞️' },
            { time: '5:00 PM', type: 'relax', activity: 'Dinner at Curry Village or Yosemite Village', icon: '🍽️' }
          ],
          tips: ['Mist Trail is slippery – wear grippy shoes', 'Yosemite parking fills fast – arrive early!']
        },
        {
          day: 4,
          title: 'Glacier Point & Mariposa Grove',
          activities: [
            { time: '8:00 AM', type: 'drive', activity: 'Drive to Glacier Point', icon: '🚗' },
            { time: '9:00 AM', type: 'explore', activity: 'Panoramic views: Half Dome, Clouds Rest, Nevada Falls', icon: '📸' },
            { time: '12:00 PM', type: 'visit', activity: 'Lunch and explore Mariposa Grove of Giant Sequoias', icon: '🌳' },
            { time: '4:00 PM', type: 'hike', activity: 'Hike the Grizzly Giant Loop (2 mi RT)', icon: '🥾' }
          ],
          tips: ['Road to Glacier Point may be seasonal – check status', 'Shuttle required for Mariposa Grove in summer']
        },
        {
          day: 5,
          title: 'Wrap-up & Departure',
          activities: [
            { time: '9:00 AM', type: 'souvenir', activity: 'Morning coffee & gift shopping at Yosemite Village', icon: '☕' },
            { time: '11:00 AM', type: 'drive', activity: 'Drive back to Fresno Airport (~2.5 hrs)', icon: '🚗' },
            { time: '3:00 PM', type: 'travel', activity: 'Fly home from FAT', icon: '✈️' }
          ],
          tips: ['Allow extra time for traffic near Yosemite exits']
        }
      ],
      budgetBreakdown: {
        accommodation: { nights: 4, rate: 180, total: 720 },
        transportation: { flights: 400, rental: 280, gas: 100, total: 780 },
        food: { daily: 70, days: 5, total: 350 },
        activities: { parkFees: 60, guided tours: 80, total: 140 },
        total: 1990
      },
      packingList: [
        'Hiking boots with grip',
        'Rain jacket (waterfalls spray)',
        'Reusable water bottle',
        'Bear-safe food container or daypack',
        'Camera with wide-angle lens',
        'Sunscreen + hat'
      ],
      bonusActivities: [
        'Stargazing at Glacier Point (bring a blanket)',
        'Yosemite Falls Lower Trail night walk',
        'Sequoia National Forest scenic overlooks',
        'Sunrise photography at Valley View',
        'Bike rentals in Yosemite Valley'
      ]
    }
  ];

  // Initialize data
  useEffect(() => {
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (location.state?.preloadedTrip) {
      setActiveTrip(location.state.preloadedTrip);
      setCurrentTab('my-trips');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Enhanced auto-loading with better logic
  useEffect(() => {
    if (currentTab === 'templates' && autoLoadPreferences.enabled && trips.length > 0) {
      const hasAutoLoadedToday = localStorage.getItem('lastAutoLoadDate') === new Date().toDateString();
      
      if (!hasAutoLoadedToday && !autoLoadingState.hasTriggered) {
        setAutoLoadingState(prev => ({ ...prev, isLoading: true, hasTriggered: true }));
        localStorage.setItem('lastAutoLoadDate', new Date().toDateString());
        
        setTimeout(() => {
          const recommended = getEnhancedTemplateRecommendation();
          
          if (recommended) {
            setAutoLoadingState(prev => ({
              ...prev,
              isLoading: false,
              recommendedTemplate: recommended,
              showRecommendationBanner: true
            }));
            
            setAutoLoadPreferences(prev => ({
              ...prev,
              lastRecommended: recommended.id
            }));
            
            showToast(`🎯 Based on your travel style, we recommend "${recommended.title}"!`, 'success');
            
            setTimeout(() => {
              const templateElement = document.getElementById(`template-${recommended.id}`);
              if (templateElement) {
                templateElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 1000);
          }
        }, 2000);
      }
    }
  }, [currentTab, trips.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const parksSnapshot = await getDocs(collection(db, 'parks'));
      const parks = parksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllParks(parks);

      if (currentUser) {
        const q = query(collection(db, 'trips'), where('userId', '==', currentUser.uid));
        const tripsSnapshot = await getDocs(q);
        const userTrips = tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrips(userTrips);
      } else {
        const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]');
        setTrips(savedTrips);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced recommendation logic that avoids duplicates
  const getEnhancedTemplateRecommendation = () => {
    if (trips.length === 0) return null;
    
    // Get user's visited states and parks
    const userStates = [...new Set(trips.flatMap(trip => 
      trip.parks?.map(p => p.state?.toLowerCase()).filter(Boolean) || []
    ))];
    
    const userParks = trips.flatMap(trip => trip.parks?.map(p => p.parkName?.toLowerCase()) || []);
    const userTitles = trips.map(trip => trip.title?.toLowerCase() || '');
    
    // Filter out templates that are too similar to existing trips
    const availableTemplates = detailedTemplates.filter(template => {
      // Check if user already has this exact template
      const hasExactTemplate = userTitles.some(title => 
        title.includes(template.title.toLowerCase().replace(/[🌵🏜️🦌]/g, '').trim().split(' ')[0])
      );
      
      // Check if user has been to this region recently
      const hasVisitedRegion = userStates.includes(template.region?.toLowerCase());
      
      return !hasExactTemplate && (!hasVisitedRegion || Math.random() > 0.7);
    });
    
    if (availableTemplates.length === 0) {
      return detailedTemplates.find(t => t.id === 'big-bend-texas'); // Fallback
    }
    
    // Score templates based on user preferences
    const scoredTemplates = availableTemplates.map(template => {
      let score = 50; // Base score
      
      const avgCost = trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0) / trips.length;
      const avgDuration = trips.reduce((sum, trip) => sum + (trip.totalDuration || 0), 0) / trips.length;
      
      // Budget matching
      if (Math.abs(template.estimatedCost - avgCost) < 500) score += 30;
      
      // Duration matching
      if (Math.abs(template.duration - avgDuration) < 3) score += 20;
      
      // Diversity bonus (new region)
      if (!userStates.includes(template.region?.toLowerCase())) score += 25;
      
      return { template, score };
    });
    
    const bestMatch = scoredTemplates.sort((a, b) => b.score - a.score)[0];
    console.log('🎯 Enhanced recommendation:', bestMatch?.template?.title, 'Score:', bestMatch?.score);
    
    return bestMatch?.template || availableTemplates[0];
  };

  // Enhanced smart suggestions with better fallbacks
  const generateEnhancedSmartSuggestions = () => {
    const suggestions = [];
    
    if (trips.length === 0) {
      // First-time user suggestions
      suggestions.push(
        {
          type: 'beginner_friendly',
          title: 'Perfect First National Park Trip',
          description: 'Start your national parks journey with the most accessible and rewarding experiences',
          actionText: 'Plan My First Adventure',
          parks: ['Great Smoky Mountains NP', 'Mammoth Cave NP'],
          estimatedDays: 5,
          estimatedCost: 800,
          confidence: 95,
          icon: '🌟',
          reason: 'Perfect introduction to national parks with easy access and diverse activities'
        },
        {
          type: 'classic_road_trip',
          title: 'Classic American Road Trip',
          description: 'Experience the iconic southwestern parks that define American adventure',
          actionText: 'Start Classic Journey',
          parks: ['Grand Canyon NP', 'Zion NP', 'Bryce Canyon NP'],
          estimatedDays: 8,
          estimatedCost: 1800,
          confidence: 90,
          icon: '🛣️',
          reason: 'Most popular first-time multi-park adventure'
        }
      );
      return suggestions;
    }
    
    // Existing user suggestions with enhanced logic
    const userStates = [...new Set(trips.flatMap(trip => 
      trip.parks?.map(p => p.state?.toLowerCase()).filter(Boolean) || []
    ))];
    
    const userParks = trips.flatMap(trip => trip.parks?.map(p => p.parkName?.toLowerCase()) || []);
    const avgCost = trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0) / trips.length;
    const totalParksVisited = userParks.length;
    
    // Advanced user suggestions
    if (totalParksVisited >= 5) {
      suggestions.push({
        type: 'expert_challenge',
        title: 'Alaska Wilderness Challenge',
        description: 'Ready for the ultimate adventure? Tackle America\'s final frontier',
        actionText: 'Accept the Challenge',
        parks: ['Denali National Park', 'Katmai National Park'],
        estimatedDays: 10,
        estimatedCost: Math.max(4500, avgCost * 1.5),
        confidence: 85,
        icon: '🏔️',
        reason: `With ${totalParksVisited} parks under your belt, you\'re ready for Alaska!`
      });
    }
    
    // Regional completion suggestions
    if (userStates.includes('utah') && userParks.filter(p => ['zion', 'bryce', 'arches', 'capitol', 'canyonlands'].some(up => p.includes(up))).length >= 2) {
      const visitedUtah = userParks.filter(p => ['zion', 'bryce', 'arches', 'capitol', 'canyonlands'].some(up => p.includes(up)));
      const missingUtah = ['Arches', 'Bryce Canyon', 'Canyonlands', 'Capitol Reef', 'Zion'].filter(up => 
        !userParks.some(p => p.includes(up.toLowerCase()))
      );
      
      if (missingUtah.length > 0 && missingUtah.length < 4) {
        suggestions.push({
          type: 'complete_series',
          title: 'Complete Utah\'s Big 5',
          description: `You've conquered ${visitedUtah.length} Utah parks. Finish the legendary Big 5!`,
          actionText: 'Complete the Collection',
          parks: missingUtah.map(park => `${park} National Park`),
          estimatedDays: missingUtah.length * 2,
          estimatedCost: Math.round(avgCost * (missingUtah.length / 3)),
          confidence: 95,
          icon: '🏆',
          reason: `${missingUtah.length} parks left to complete Utah\'s Big 5`
        });
      }
    }
    
    // Budget-conscious suggestions
    if (avgCost > 2500) {
      suggestions.push({
        type: 'budget_optimization',
        title: 'Hidden Gems on a Budget',
        description: 'Discover amazing parks without the premium price tag',
        actionText: 'Explore Budget-Friendly',
        parks: ['Hot Springs NP', 'Congaree NP', 'Mammoth Cave NP'],
        estimatedDays: 6,
        estimatedCost: 1000,
        confidence: 80,
        icon: '💎',
        reason: 'Great value adventures in underrated parks'
      });
    }
    
    // Always provide at least one suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'seasonal_special',
        title: 'Perfect Season Adventure',
        description: 'Specially timed for optimal weather and experiences',
        actionText: 'Book Seasonal Trip',
        parks: ['Yellowstone NP', 'Grand Teton NP'],
        estimatedDays: Math.max(6, Math.round(avgCost / 300)),
        estimatedCost: Math.max(1800, avgCost),
        confidence: 85,
        icon: '🌺',
        reason: 'Ideal timing for wildlife and wildflowers'
      });
    }
    
    return suggestions.slice(0, 4);
  };

  // Enhanced template creation with proper date constraints
  const createTripFromDetailedTemplate = (template) => {
    try {
      // Calculate start and end dates based on template duration
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // 30 days from now
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + template.duration);
      
      // Find parks in database
      const templateParks = [];
      
      template.highlights.forEach((highlight, index) => {
        const matchingPark = allParks.find(park => 
          park.name?.toLowerCase().includes(highlight.toLowerCase().split(' ')[0]) ||
          park.fullName?.toLowerCase().includes(highlight.toLowerCase().split(' ')[0]) ||
          highlight.toLowerCase().includes(park.name?.toLowerCase().split(' ')[0] || '')
        );
        
        if (matchingPark) {
          let coordinates = { lat: 0, lng: 0 };
          if (matchingPark.coordinates && matchingPark.coordinates.includes(',')) {
            const [lat, lng] = matchingPark.coordinates.split(',').map(val => parseFloat(val.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = { lat, lng };
            }
          }

          templateParks.push({
            parkId: matchingPark.id,
            parkName: matchingPark.name || matchingPark.fullName,
            visitDate: new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            stayDuration: Math.ceil(template.duration / template.highlights.length),
            coordinates,
            state: matchingPark.state,
            description: matchingPark.description
          });
        }
      });

      const newTrip = {
        title: template.title.replace(/[🌵🏜️🦌🌟]/g, '').trim(),
        description: template.description,
        parks: templateParks,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        transportationMode: template.transportation.rentalCarRequired ? 'driving' : 'flying',
        isPublic: false,
        templateId: template.id,
        totalDistance: 0,
        estimatedCost: template.budgetBreakdown?.total || template.estimatedCost,
        totalDuration: template.duration,
        templateData: {
          itinerary: template.itinerary,
          budgetBreakdown: template.budgetBreakdown,
          packingList: template.packingList,
          season: template.season
        }
      };

      setActiveTrip(newTrip);
      setCurrentTab('my-trips');
      showToast(`✨ ${template.title} loaded with ${template.duration}-day itinerary and ${templateParks.length} parks!`, 'success');
      
    } catch (error) {
      console.error('Error creating trip from template:', error);
      showToast('Failed to load template. Please try again.', 'error');
    }
  };

  // Enhanced save function with better error handling
  const saveTrip = async (tripData) => {
    try {
      // Validate required fields
      if (!tripData.title?.trim()) {
        showToast('Trip title is required', 'error');
        return null;
      }
      
      if (!tripData.parks || tripData.parks.length === 0) {
        showToast('Please add at least one park to your trip', 'error');
        return null;
      }

      // Clean and validate numeric fields
      const cleanedTripData = {
        title: tripData.title.trim(),
        description: tripData.description?.trim() || '',
        parks: tripData.parks || [],
        startDate: tripData.startDate || '',
        endDate: tripData.endDate || '',
        transportationMode: tripData.transportationMode || 'driving',
        totalDistance: Number(tripData.totalDistance) || 0,
        estimatedCost: Number(tripData.estimatedCost) || 0,
        totalDuration: Number(tripData.totalDuration) || 0,
        isPublic: Boolean(tripData.isPublic),
        templateId: tripData.templateId || null,
        templateData: tripData.templateData || null
      };

      if (!currentUser) {
        const newTrip = { 
          id: Date.now().toString(), 
          ...cleanedTripData, 
          createdAt: new Date().toISOString(),
          userId: 'local' 
        };
        const updatedTrips = [...trips, newTrip];
        setTrips(updatedTrips);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));
        showToast('💖 Trip saved locally! Log in to sync across devices', 'info');
        setActiveTrip(null);
        return newTrip;
      }

      const firestoreData = {
        ...cleanedTripData,
        userId: currentUser.uid,
        createdAt: tripData.id ? undefined : new Date(),
        updatedAt: new Date()
      };

      if (tripData.id) {
        await updateDoc(doc(db, 'trips', tripData.id), firestoreData);
        const updatedTrips = trips.map(t => t.id === tripData.id ? { ...firestoreData, id: tripData.id } : t);
        setTrips(updatedTrips);
        showToast('✅ Trip updated successfully!', 'success');
      } else {
        const docRef = await addDoc(collection(db, 'trips'), firestoreData);
        const savedTrip = { id: docRef.id, ...firestoreData };
        setTrips([...trips, savedTrip]);
        showToast('✅ Trip saved successfully!', 'success');
      }
      
      setActiveTrip(null);
      return cleanedTripData;
      
    } catch (error) {
      console.error('Save error:', error);
      showToast(`❌ Failed to save trip: ${error.message}`, 'error');
      throw error;
    }
  };

  const createNewTrip = () => {
    setActiveTrip({
      title: '',
      description: '',
      parks: [],
      startDate: '',
      endDate: '',
      transportationMode: 'driving',
      isPublic: false
    });
    setCurrentTab('my-trips');
  };

  const editTrip = (trip) => {
    setActiveTrip(trip);
    setViewingTrip(null);
    setCurrentTab('my-trips');
  };

  const deleteTrip = async (tripId) => {
    try {
      if (!currentUser) {
        const updatedTrips = trips.filter(t => t.id !== tripId);
        setTrips(updatedTrips);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));
        showToast('Trip deleted', 'info');
        return;
      }

      await deleteDoc(doc(db, 'trips', tripId));
      setTrips(trips.filter(t => t.id !== tripId));
      showToast('Trip deleted', 'info');
    } catch (error) {
      console.error('Error deleting trip:', error);
      showToast('Failed to delete trip', 'error');
    }
  };

  const createTripFromSuggestion = (suggestion) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + suggestion.estimatedDays);

    const suggestedParks = [];
    
    suggestion.parks.forEach((parkName, index) => {
      const matchingPark = allParks.find(park => 
        park.name?.toLowerCase().includes(parkName.toLowerCase().split(' ')[0]) ||
        park.fullName?.toLowerCase().includes(parkName.toLowerCase().split(' ')[0])
      );
      
      if (matchingPark) {
        let coordinates = { lat: 0, lng: 0 };
        if (matchingPark.coordinates && matchingPark.coordinates.includes(',')) {
          const [lat, lng] = matchingPark.coordinates.split(',').map(val => parseFloat(val.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates = { lat, lng };
          }
        }

        suggestedParks.push({
          parkId: matchingPark.id,
          parkName: matchingPark.name || matchingPark.fullName,
          visitDate: new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          stayDuration: Math.ceil(suggestion.estimatedDays / suggestion.parks.length),
          coordinates,
          state: matchingPark.state,
          description: matchingPark.description
        });
      }
    });

    const newTrip = {
      title: suggestion.title,
      description: suggestion.description,
      parks: suggestedParks,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      transportationMode: 'driving',
      estimatedCost: suggestion.estimatedCost,
      totalDuration: suggestion.estimatedDays,
      isPublic: false,
      suggestionType: suggestion.type
    };

    setActiveTrip(newTrip);
    setCurrentTab('my-trips');
    showToast(`🧠 Smart suggestion applied! ${suggestedParks.length} parks added.`, 'success');
  };

  // Enhanced template card component
  const DetailedTemplateCard = ({ template, isRecommended = false }) => {
    const getDifficultyColor = (difficulty) => {
      if (difficulty.toLowerCase().includes('easy')) return 'text-green-600 bg-green-100';
      if (difficulty.toLowerCase().includes('moderate')) return 'text-yellow-600 bg-yellow-100';
      if (difficulty.toLowerCase().includes('advanced')) return 'text-red-600 bg-red-100';
      return 'text-blue-600 bg-blue-100';
    };

    return (
      <div 
        id={`template-${template.id}`}
        className={`group bg-white rounded-3xl overflow-hidden shadow-lg border transition-all duration-300 hover:shadow-2xl ${
          isRecommended 
            ? 'border-yellow-300 ring-2 ring-yellow-200 transform hover:scale-105' 
            : 'border-gray-100 hover:shadow-xl'
        }`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
          {isRecommended && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
              🎯 Smart Pick
            </div>
          )}
          
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl mb-2">{template.image}</div>
            <div className="text-right">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-1">
                {template.duration} days
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
                {template.season}
              </div>
            </div>
          </div>
          
          <h4 className="text-xl font-bold mb-1">{template.title}</h4>
          <p className="text-sm text-purple-100 mb-2">{template.subtitle}</p>
          <p className="text-white/90 text-sm">{template.description}</p>
        </div>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </div>
              <div className="text-xs text-gray-500 mt-1">Difficulty</div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-gray-800">{template.highlights.length}</div>
              <div className="text-xs text-gray-500">Highlights</div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-green-600">${template.estimatedCost.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Est. Cost</div>
            </div>
          </div>

          {/* Transportation Info */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <FaRoute className="text-blue-600" />
              Getting There
            </h5>
            <div className="text-sm text-blue-700">
              <div>✈️ {template.transportation.arrival}</div>
              <div>🚗 {template.transportation.drivingTime}</div>
              {template.transportation.rentalCarRequired && (
                <div className="text-xs text-blue-600 mt-1">🔑 Rental car required</div>
              )}
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-6">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              Must-See Highlights
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {template.highlights.map((highlight, idx) => (
                <div key={idx} className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2">
                  <FaCamera className="text-purple-500" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          {/* Sample Itinerary Preview */}
          {template.itinerary && (
            <div className="mb-6">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                Sample Itinerary
              </h5>
              <div className="space-y-2">
                {template.itinerary.slice(0, 2).map((day, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-800 text-sm mb-1">
                      Day {day.day}: {day.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {day.activities.slice(0, 2).map((activity, actIdx) => (
                        <div key={actIdx} className="flex items-center gap-2 mb-1">
                          <span>{activity.icon}</span>
                          <span>{activity.time} - {activity.activity}</span>
                        </div>
                      ))}
                      {day.activities.length > 2 && (
                        <div className="text-gray-500">+{day.activities.length - 2} more activities...</div>
                      )}
                    </div>
                  </div>
                ))}
                {template.itinerary.length > 2 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{template.itinerary.length - 2} more days of detailed planning...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Budget Breakdown Preview */}
          {template.budgetBreakdown && (
            <div className="mb-6">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaDollarSign className="text-green-500" />
                Budget Breakdown
              </h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-blue-800">Accommodation</div>
                  <div className="text-blue-600">${template.budgetBreakdown.accommodation?.total || 0}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-800">Transportation</div>
                  <div className="text-green-600">${template.budgetBreakdown.transportation?.total || 0}</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="font-medium text-yellow-800">Food & Meals</div>
                  <div className="text-yellow-600">${template.budgetBreakdown.food?.total || 0}</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-medium text-purple-800">Activities</div>
                  <div className="text-purple-600">${template.budgetBreakdown.activities?.total || 0}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => createTripFromDetailedTemplate(template)}
            className={`w-full py-4 px-6 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isRecommended
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 hover:from-yellow-500 hover:to-orange-500'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
            }`}
          >
            <FaStar /> 
            {isRecommended ? 'Use Smart Pick ✨' : 'Use This Template'}
          </button>
          
          {template.bonusActivities && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 font-medium mb-1">Bonus Activities:</div>
              <div className="text-xs text-gray-500">
                {template.bonusActivities.slice(0, 2).join(' • ')}
                {template.bonusActivities.length > 2 && ' • +more'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Recommendation Banner
  const RecommendationBanner = () => {
    if (!autoLoadingState.showRecommendationBanner || !autoLoadingState.recommendedTemplate) {
      return null;
    }
    
    const template = autoLoadingState.recommendedTemplate;
    const reason = trips.length > 0 
      ? `Based on your ${trips.length} planned trips and preferences`
      : 'Perfect for first-time adventurers';

    return (
      <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-orange-100/20 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-xl text-white animate-bounce">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-800 mb-1">
                  Smart Recommendation: {template.title}
                </h3>
                <p className="text-yellow-700 text-sm">{reason}</p>
              </div>
            </div>
            
            <button
              onClick={() => setAutoLoadingState(prev => ({ ...prev, showRecommendationBanner: false }))}
              className="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-200 transition"
            >
              ✕
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-medium text-sm">
              {template.duration} days
            </span>
            <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium text-sm">
              ${template.estimatedCost?.toLocaleString()}
            </span>
            <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium text-sm">
              {template.highlights?.length} highlights
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                createTripFromDetailedTemplate(template);
                setAutoLoadingState(prev => ({ ...prev, showRecommendationBanner: false }));
              }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition font-medium flex items-center gap-2 shadow-lg"
            >
              <span>✨</span> Use This Recommendation
            </button>
            
            <button
              onClick={() => {
                document.getElementById(`template-${template.id}`)?.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
              }}
              className="bg-white text-yellow-700 border-2 border-yellow-300 px-6 py-3 rounded-xl hover:bg-yellow-50 transition font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
          
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-6 md:p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <FadeInWrapper delay={0.1}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                      🧠 Trip Planner
                    </h1>
                    <p className="text-lg md:text-xl text-pink-100 max-w-2xl">
                      Plan your perfect national parks adventure with detailed guides and smart recommendations.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
                    >
                      <FaArrowLeft />
                      <span className="hidden md:inline">Back to Explore</span>
                      <span className="md:hidden">Back</span>
                    </Link>
                    {(currentTab === 'my-trips' && !activeTrip) && (
                      <button 
                        onClick={createNewTrip}
                        className="group relative inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-purple-600 rounded-2xl hover:bg-pink-50 transition-all duration-300 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <FaPlus className="group-hover:rotate-180 transition-transform duration-300" /> 
                        <span className="hidden sm:inline">Create New Trip</span>
                        <span className="sm:hidden">New Trip</span>
                      </button>
                    )}
                  </div>
                </div>
              </FadeInWrapper>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`group flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 font-medium transition-all duration-300 min-w-max ${
                        isActive
                          ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                          : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      <Icon className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <div className="text-left">
                        <div className="font-semibold text-sm md:text-base">{tab.title}</div>
                        <div className="text-xs text-gray-500 hidden md:block">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 md:p-8">
            {/* Stats Overview */}
            {currentTab === 'my-trips' && trips.length > 0 && !activeTrip && (
              <FadeInWrapper delay={0.2}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="group bg-gradient-to-br from-pink-500 to-rose-500 p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">{trips.length}</div>
                        <div className="text-pink-100 font-medium text-sm md:text-base">Total Trips</div>
                      </div>
                      <FaRoute className="text-2xl md:text-4xl text-pink-200 group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-blue-500 to-cyan-500 p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">
                          {trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)}
                        </div>
                        <div className="text-blue-100 font-medium text-sm md:text-base">Parks to Visit</div>
                      </div>
                      <FaMapMarkerAlt className="text-2xl md:text-4xl text-blue-200 group-hover:bounce transition-transform" />
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-green-500 to-emerald-500 p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">
                          {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0)).toLocaleString()}
                        </div>
                        <div className="text-green-100 font-medium text-sm md:text-base">Total Miles</div>
                      </div>
                      <span className="text-2xl md:text-4xl text-green-200 group-hover:rotate-45 transition-transform">🛣️</span>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-yellow-500 to-orange-500 p-4 md:p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">
                          ${Math.round(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)).toLocaleString()}
                        </div>
                        <div className="text-yellow-100 font-medium text-sm md:text-base">Total Budget</div>
                      </div>
                      <FaDollarSign className="text-2xl md:text-4xl text-yellow-200 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {/* Tab Content */}
            {currentTab === 'my-trips' && (
              <>
                {activeTrip ? (
                  <TripBuilder 
                    trip={activeTrip}
                    allParks={allParks}
                    onSave={saveTrip}
                    onCancel={() => setActiveTrip(null)}
                  />
                ) : (
                  <TripList 
                    trips={trips}
                    onEditTrip={editTrip}
                    onDeleteTrip={deleteTrip}
                    onViewTrip={setViewingTrip}
                  />
                )}
              </>
            )}

            {currentTab === 'templates' && (
              <FadeInWrapper delay={0.2}>
                <div className="space-y-6 md:space-y-8">
                  <div className="text-center mb-6 md:mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🌟 Detailed Trip Templates</h3>
                    <p className="text-gray-600">
                      Expert-designed adventures with day-by-day itineraries and budget breakdowns
                    </p>
                  </div>

                  {/* Enhanced Auto-Load Status Panel */}
                  {trips.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                            <span>🎯</span> Smart Template Engine
                          </h4>
                          <p className="text-sm text-blue-600">
                            AI-powered recommendations based on your {trips.length} trip{trips.length !== 1 ? 's' : ''} and preferences
                          </p>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoLoadPreferences.enabled}
                            onChange={(e) => setAutoLoadPreferences({
                              ...autoLoadPreferences,
                              enabled: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {autoLoadPreferences.enabled && (
                        <div className="mt-4 flex items-center gap-4">
                          <button
                            onClick={() => {
                              const template = getEnhancedTemplateRecommendation();
                              if (template) {
                                showToast(`🧠 AI Recommended: ${template.title}`, 'info');
                                createTripFromDetailedTemplate(template);
                              } else {
                                showToast('No new recommendations available right now', 'info');
                              }
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
                          >
                            <FaBrain />
                            Get AI Recommendation
                          </button>
                          
                          <button
                            onClick={() => {
                              localStorage.removeItem('lastAutoLoadDate');
                              setAutoLoadingState({
                                isLoading: false,
                                hasTriggered: false,
                                recommendedTemplate: null,
                                showRecommendationBanner: false
                              });
                              showToast('AI engine reset! Fresh recommendations on next visit.', 'info');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                          >
                            Reset AI Engine
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendation Banner */}
                  <RecommendationBanner />

                  {/* Enhanced Templates Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {detailedTemplates.map((template, index) => {
                      const isRecommended = trips.length > 0 && 
                        getEnhancedTemplateRecommendation()?.id === template.id;
                        
                      return (
                        <FadeInWrapper key={template.id} delay={index * 0.1}>
                          <DetailedTemplateCard 
                            template={template} 
                            isRecommended={isRecommended}
                          />
                        </FadeInWrapper>
                      );
                    })}
                  </div>
                </div>
              </FadeInWrapper>
            )}

            {/* Enhanced Analytics Tab */}
            {currentTab === 'analytics' && (
              <FadeInWrapper delay={0.2}>
                <div className="space-y-6 md:space-y-8">
                  {trips.length === 0 ? (
                    <div className="text-center py-12 md:py-20">
                      <div className="text-4xl md:text-6xl mb-4">📊</div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">No Analytics Available</h3>
                      <p className="text-gray-600 mb-6">Create some trips to see detailed analytics and insights!</p>
                      <button
                        onClick={createNewTrip}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition"
                      >
                        Create Your First Trip
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6 md:mb-8">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">📊 Your Travel Analytics</h3>
                        <p className="text-gray-600">Insights from your {trips.length} planned trip{trips.length !== 1 ? 's' : ''}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 md:p-6 rounded-2xl text-white text-center">
                          <div className="text-2xl md:text-3xl font-bold">{trips.length}</div>
                          <div className="text-blue-100 text-sm">Total Trips</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-6 rounded-2xl text-white text-center">
                          <div className="text-2xl md:text-3xl font-bold">
                            {Math.round(trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0)).toLocaleString()}
                          </div>
                          <div className="text-purple-100 text-sm">Total Miles</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 md:p-6 rounded-2xl text-white text-center col-span-2 md:col-span-1">
                          <div className="text-2xl md:text-3xl font-bold">
                            ${Math.round(trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)).toLocaleString()}
                          </div>
                          <div className="text-yellow-100 text-sm">Total Budget</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                        <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-6">Trip Breakdown</h4>
                        <div className="space-y-4">
                          {trips.map((trip, index) => (
                            <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                              <div className="flex items-center gap-4">
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                                  ['from-pink-500 to-rose-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-indigo-500'][index % 4]
                                }`}></div>
                                <div>
                                  <h5 className="font-semibold text-gray-800">{trip.title}</h5>
                                  <div className="text-sm text-gray-600">
                                    {trip.parks?.length || 0} parks • {trip.totalDistance || 0} miles
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-800">${trip.estimatedCost || 0}</div>
                                <div className="text-sm text-gray-600">Budget</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h4 className="text-lg font-bold text-gray-800 mb-4">Transportation Preferences</h4>
                          <div className="space-y-3">
                            {(() => {
                              const driving = trips.filter(t => t.transportationMode === 'driving').length;
                              const flying = trips.filter(t => t.transportationMode === 'flying').length;
                              const total = driving + flying || 1;
                              
                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span>🚗 Road Trips</span>
                                    <span className="font-semibold">{Math.round((driving / total) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(driving / total) * 100}%` }}
                                    ></div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <span>✈️ Flight Trips</span>
                                    <span className="font-semibold">{Math.round((flying / total) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(flying / total) * 100}%` }}
                                    ></div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h4 className="text-lg font-bold text-gray-800 mb-4">Popular Destinations</h4>
                          <div className="space-y-3">
                            {(() => {
                              const parkCounts = {};
                              trips.forEach(trip => {
                                trip.parks?.forEach(park => {
                                  parkCounts[park.parkName] = (parkCounts[park.parkName] || 0) + 1;
                                });
                              });
                              
                              const topParks = Object.entries(parkCounts)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 5);
                              
                              if (topParks.length === 0) {
                                return (
                                  <div className="text-center py-4 text-gray-500">
                                    <p>No park visits planned yet</p>
                                  </div>
                                );
                              }
                              
                              const maxCount = Math.max(...topParks.map(([,count]) => count));
                              
                              return topParks.map(([parkName, count]) => (
                                <div key={parkName} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                      {parkName.length > 20 ? parkName.substring(0, 20) + '...' : parkName}
                                    </span>
                                    <span className="text-sm font-semibold">{count}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(count / maxCount) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                          <FaBrain className="text-purple-600" />
                          Smart Travel Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Average trip cost: ${Math.round((trips.reduce((sum, trip) => sum + (trip.estimatedCost || 0), 0)) / trips.length).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Average parks per trip: {Math.round((trips.reduce((sum, trip) => sum + (trip.parks?.length || 0), 0)) / trips.length * 10) / 10}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Most expensive trip: ${Math.max(...trips.map(t => t.estimatedCost || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-700">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>Longest trip: {Math.max(...trips.map(t => t.totalDistance || 0)).toLocaleString()} miles</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </FadeInWrapper>
            )}

            {/* Enhanced Suggestions Tab */}
            {currentTab === 'suggestions' && (
              <FadeInWrapper delay={0.2}>
                <div className="space-y-6 md:space-y-8">
                  {trips.length === 0 ? (
                    <div className="text-center py-12 md:py-20">
                      <div className="text-4xl md:text-6xl mb-4">🧠</div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Create Your First Trip</h3>
                      <p className="text-gray-600 mb-6">
                        Once you create a few trips, our AI will analyze your preferences and suggest personalized adventures.
                      </p>
                      <button
                        onClick={createNewTrip}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition"
                      >
                        Start Planning
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                        <div className="text-center mb-6 md:mb-8">
                          <div className="text-4xl md:text-6xl mb-4">🧠</div>
                          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Smart Recommendations</h3>
                          <p className="text-gray-600">
                            Based on your {trips.length} planned trip{trips.length !== 1 ? 's' : ''}, here are intelligent suggestions
                          </p>
                        </div>

                        {(() => {
                          const suggestions = generateEnhancedSmartSuggestions();
                          
                          if (suggestions.length === 0) {
                            return (
                              <div className="text-center py-12">
                                <div className="text-6xl mb-4">🤔</div>
                                <h4 className="text-xl font-semibold text-gray-600 mb-2">Analyzing Your Preferences</h4>
                                <p className="text-gray-500 mb-6">
                                  Plan a few more trips so our AI can better understand your travel style!
                                </p>
                                <button
                                  onClick={createNewTrip}
                                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition"
                                >
                                  Plan Another Trip
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {suggestions.map((suggestion, index) => (
                                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                  <div className="flex items-start justify-between mb-4">
                                    <span className="text-4xl">{suggestion.icon}</span>
                                    <div className="text-right">
                                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                        {suggestion.confidence}% Match
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1 capitalize">{suggestion.type.replace('_', ' ')}</div>
                                    </div>
                                  </div>
                                  
                                  <h4 className="text-xl font-bold text-gray-800 mb-2">{suggestion.title}</h4>
                                  <p className="text-gray-600 mb-4">{suggestion.description}</p>
                                  
                                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                      <div>
                                        <div className="font-bold text-gray-800">{suggestion.parks.length}</div>
                                        <div className="text-xs text-gray-500">Parks</div>
                                      </div>
                                      <div>
                                        <div className="font-bold text-gray-800">{suggestion.estimatedDays}</div>
                                        <div className="text-xs text-gray-500">Days</div>
                                      </div>
                                      <div>
                                        <div className="font-bold text-green-600">${suggestion.estimatedCost?.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">Budget</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <h5 className="font-semibold text-gray-700 mb-2">Suggested Parks:</h5>
                                    <div className="space-y-1">
                                      {suggestion.parks.map((park, idx) => (
                                        <div key={idx} className="text-sm text-gray-600">• {park}</div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
                                    <FaBrain />
                                    {suggestion.reason}
                                  </div>
                                  
                                  <button
                                    onClick={() => createTripFromSuggestion(suggestion)}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                                  >
                                    <span>✨</span> {suggestion.actionText}
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
                        <div className="text-center mb-6">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Quick Start Options</h3>
                          <p className="text-gray-600">Choose how you'd like to begin your next adventure</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            onClick={() => {
                              setCurrentTab('templates');
                              showToast('🌟 Browse our detailed templates with day-by-day itineraries!', 'info');
                            }}
                            className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all text-center group"
                          >
                            <span className="text-3xl md:text-4xl block mb-2 group-hover:scale-110 transition-transform">🌟</span>
                            <h4 className="font-semibold text-gray-800">Browse Templates</h4>
                            <p className="text-sm text-gray-600">Detailed guides with itineraries</p>
                          </button>
                          
                          <button
                            onClick={createNewTrip}
                            className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
                          >
                            <span className="text-3xl md:text-4xl block mb-2 group-hover:scale-110 transition-transform">🚀</span>
                            <h4 className="font-semibold text-gray-800">Create from Scratch</h4>
                            <p className="text-sm text-gray-600">Build your custom adventure</p>
                          </button>
                          
                          <button
                            onClick={() => {
                              setCurrentTab('analytics');
                              showToast('📊 Check out your detailed travel insights!', 'info');
                            }}
                            className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-center group"
                          >
                            <span className="text-3xl md:text-4xl block mb-2 group-hover:scale-110 transition-transform">📊</span>
                            <h4 className="font-semibold text-gray-800">View Analytics</h4>
                            <p className="text-sm text-gray-600">Understand your travel style</p>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </FadeInWrapper>
            )}
          </div>
        </div>
      </div>

      {/* Trip Viewer Modal */}
      {viewingTrip && (
        <TripViewer
          trip={viewingTrip}
          onClose={() => setViewingTrip(null)}
          onEdit={(trip) => {
            setActiveTrip(trip);
            setViewingTrip(null);
            setCurrentTab('my-trips');
          }}
        />
      )}
    </div>
  );
};

export default TripPlanner;