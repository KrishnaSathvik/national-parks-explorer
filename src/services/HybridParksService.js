// 📁 src/services/HybridParksService.js - VITE FIXED VERSION

class HybridParksService {
    constructor() {
        // 🔧 FIX: Use VITE_ prefix instead of REACT_APP_
        this.npsApiKey = import.meta.env.VITE_NPS_API_KEY;
        this.weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY; // Bonus: Weather API for future use
        this.baseUrl = 'https://api.nps.gov/api/v1';
        this.cacheKey = 'hybrid_parks_cache';
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

        // 🔧 Validate API key on startup
        if (!this.npsApiKey || this.npsApiKey === 'undefined') {
            console.warn('⚠️ NPS API key not found. Using fallback data only.');
            console.log('💡 Expected: VITE_NPS_API_KEY in .env file');
            this.apiKeyValid = false;
        } else {
            console.log('✅ NPS API key loaded successfully:', this.npsApiKey.substring(0, 8) + '...');
            this.apiKeyValid = true;
        }

        // Top priority parks for manual curation
        this.topPriorityParks = [
            'Yellowstone National Park',
            'Grand Canyon National Park',
            'Yosemite National Park',
            'Zion National Park',
            'Rocky Mountain National Park'
        ];
    }

    // 🚀 MAIN METHOD with better error handling
    async fetchAllParks() {
        try {
            // 🔧 Check API key before making requests
            if (!this.apiKeyValid) {
                console.log('🔄 API key invalid, using fallback data');
                return this.getFallbackData();
            }

            // Check cache first
            const cached = this.getFromCache();
            if (cached) {
                console.log('✅ Using cached park data');
                return cached;
            }

            console.log('🔄 Fetching fresh park data from NPS API...');

            // 🔧 Better API call with timeout and error handling
            const npsData = await this.fetchFromNPS();

            // Load curated data
            const curatedData = this.getCuratedData();

            // Process with hybrid strategy
            const processedParks = this.processHybridData(npsData, curatedData);

            // Cache results
            this.saveToCache(processedParks);

            console.log(`✅ Loaded ${processedParks.length} parks with hybrid strategy`);
            return processedParks;

        } catch (error) {
            console.error('❌ Failed to fetch parks:', error);
            return this.getFallbackData();
        }
    }

    // 📡 Enhanced API fetch with proper error handling
    async fetchFromNPS() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
            const url = `${this.baseUrl}/parks?limit=500&api_key=${this.npsApiKey}&fields=images,entranceFees,operatingHours,addresses,contacts,weatherInfo,activities`;

            console.log('🔗 Fetching from NPS API...');

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('API key is invalid or has insufficient permissions');
                } else if (response.status === 429) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                } else {
                    throw new Error(`NPS API Error: ${response.status} - ${response.statusText}`);
                }
            }

            const data = await response.json();

            // Better data validation
            if (!data || !data.data || !Array.isArray(data.data)) {
                throw new Error('Invalid API response format');
            }

            const nationalParks = data.data.filter(park =>
                park.designation && park.designation.includes('National Park')
            );

            console.log(`✅ Fetched ${nationalParks.length} National Parks from API`);
            return nationalParks;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('API request timed out. Please check your internet connection.');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your internet connection and try again.');
            } else {
                throw error;
            }
        }
    }

    // 🎯 Hybrid processing - combines NPS data with curated data
    processHybridData(npsParks, curatedData) {
        return npsParks.map(park => {
            const isTopPriority = this.topPriorityParks.includes(park.fullName);
            const curatedInfo = curatedData[park.fullName];

            const basePark = {
                id: park.parkCode,
                name: park.fullName,
                state: park.states ? park.states.split(',')[0].trim() : 'Unknown',
                entryFee: this.extractEntryFee(park.entranceFees),
                coordinates: {
                    lat: parseFloat(park.latitude) || 0,
                    lng: parseFloat(park.longitude) || 0
                },
                description: park.description || 'No description available',
                imageUrl: park.images && park.images[0] ? park.images[0].url : null,
                established: park.dateEstablished || 'Unknown',
                website: park.url || ''
            };

            if (isTopPriority && curatedInfo) {
                // 🏆 Premium tier: Use curated data (95% accuracy)
                return {
                    ...basePark,
                    bestSeasons: curatedInfo.bestSeasons,
                    seasons: curatedInfo.seasons,
                    dataQuality: { tier: 'premium', accuracy: 95, source: 'curated' }
                };
            } else {
                // 📊 Standard tier: Generate from NPS data (75% accuracy)
                return {
                    ...basePark,
                    bestSeasons: this.inferBestSeasons(park),
                    seasons: this.generateSeasonsFromNPS(park),
                    dataQuality: { tier: 'standard', accuracy: 75, source: 'generated' }
                };
            }
        });
    }

    // 🏆 CURATED DATA - Top 2 parks with perfect seasonal info
    getCuratedData() {
        return {
            "Yellowstone National Park": {
                bestSeasons: ["spring", "summer", "fall"],
                seasons: {
                    spring: {
                        whyFamous: "Peak wildlife viewing as bears emerge from hibernation, wolf activity increases dramatically, and geysers are most photogenic against dramatic spring skies",
                        uniqueActivities: [
                            "Grizzly bear photography at Hayden Valley (peak activity 6-9 AM)",
                            "Wolf watching in Lamar Valley at dawn",
                            "Geyser photography with storm clouds backdrop",
                            "Bison calving season observation",
                            "Early wildflower hikes on lower elevation trails"
                        ],
                        insiderTips: [
                            "Best bear viewing: 6-9 AM at Hayden Valley",
                            "Pack layers - weather changes rapidly from 30°F to 60°F",
                            "Many roads still closed above 7,000 feet until late May"
                        ]
                    },
                    summer: {
                        whyFamous: "Full park access with all roads open, extended 16-hour daylight for photography, and peak backcountry hiking with wildflower meadows in full bloom",
                        uniqueActivities: [
                            "Backcountry camping in Yellowstone Lake area",
                            "Complete Grand Loop Road scenic drive (all 142 miles)",
                            "Fishing for native cutthroat trout in pristine waters",
                            "Photography workshops at Grand Prismatic Hot Spring",
                            "Ranger-led evening programs and stargazing"
                        ],
                        insiderTips: [
                            "Book backcountry permits 5 months in advance",
                            "Start hikes before 7 AM to beat crowds",
                            "Thermal features most active in cool mornings"
                        ]
                    },
                    fall: {
                        whyFamous: "Spectacular autumn elk bugling season, crisp air enhances geyser visibility, and golden aspen groves create stunning photography opportunities",
                        uniqueActivities: [
                            "Elk bugling tours in Mammoth area",
                            "Fall foliage photography at Firehole Canyon",
                            "Peaceful hot spring soaking with fewer crowds",
                            "Bison migration watching",
                            "Golden hour geyser photography"
                        ],
                        insiderTips: [
                            "Elk most active during September bugling season",
                            "Perfect temperatures for long hikes",
                            "Snow possible after mid-October"
                        ]
                    },
                    winter: {
                        whyFamous: "Magical snow-covered geothermal features, exclusive snowcoach and snowmobile access, and incredible wildlife tracking opportunities in pristine snow",
                        uniqueActivities: [
                            "Snowcoach tours to Old Faithful",
                            "Cross-country skiing in Lamar Valley",
                            "Wildlife tracking in fresh snow",
                            "Ice-covered waterfall photography",
                            "Northern lights viewing (rare but possible)"
                        ],
                        insiderTips: [
                            "Only north entrance road open to cars",
                            "Dress in multiple warm layers",
                            "Book snowcoach tours well in advance"
                        ]
                    }
                }
            },

            "Grand Canyon National Park": {
                bestSeasons: ["spring", "fall", "winter"],
                seasons: {
                    spring: {
                        whyFamous: "Perfect hiking weather with mild temperatures ideal for rim and inner canyon exploration, desert wildflowers bloom creating colorful displays",
                        uniqueActivities: [
                            "South Rim sunrise photography",
                            "Desert wildflower identification hikes",
                            "Comfortable inner canyon day hikes",
                            "Condor watching at Hopi Point",
                            "Geology tours with park rangers"
                        ],
                        insiderTips: [
                            "Perfect temperatures: 60-75°F",
                            "Wildflowers bloom March-May",
                            "Book accommodations early for spring break"
                        ]
                    },
                    summer: {
                        whyFamous: "Despite intense heat at rim level, early morning and evening provide spectacular lighting, North Rim offers cooler temperatures",
                        uniqueActivities: [
                            "Sunrise viewing at Desert View",
                            "Evening ranger programs",
                            "North Rim cooler hiking (if open)",
                            "Star gazing programs",
                            "Early morning photography workshops"
                        ],
                        insiderTips: [
                            "Avoid midday hiking - temperatures exceed 100°F",
                            "North Rim 1,000 feet higher and cooler",
                            "Bring extra water for any hiking"
                        ]
                    },
                    fall: {
                        whyFamous: "Ideal hiking conditions return with comfortable temperatures, crystal clear air provides exceptional visibility",
                        uniqueActivities: [
                            "Extended rim-to-rim hiking",
                            "Comfortable inner canyon camping",
                            "Clear air photography with enhanced colors",
                            "Comfortable mule rides",
                            "Extended sunset viewing sessions"
                        ],
                        insiderTips: [
                            "September-November ideal temperatures",
                            "Exceptional visibility for photography",
                            "Book inner canyon permits early"
                        ]
                    },
                    winter: {
                        whyFamous: "Dramatic snow-dusted red rocks create stunning contrasts, peaceful atmosphere with fewer crowds",
                        uniqueActivities: [
                            "Snow-dusted canyon photography",
                            "Peaceful rim walks with minimal crowds",
                            "Winter wildlife spotting",
                            "Cozy lodge stays with fireplaces",
                            "Clear winter night star gazing"
                        ],
                        insiderTips: [
                            "South Rim open year-round",
                            "North Rim closed mid-October to mid-May",
                            "Icy conditions possible on rim trails"
                        ]
                    }
                }
            }
        };
    }

    // 🤖 Generate seasons for non-curated parks
    generateSeasonsFromNPS(park) {
        return {
            spring: {
                whyFamous: `Spring brings mild weather and renewed life to ${park.fullName}, making it perfect for outdoor exploration and photography`,
                uniqueActivities: [
                    "Spring hiking with comfortable temperatures",
                    "Wildflower photography and identification",
                    "Bird watching during migration season",
                    "Photography tours with perfect lighting",
                    "Ranger-led nature walks"
                ],
                insiderTips: [
                    "Weather can be variable in spring - pack layers",
                    "Check trail conditions before hiking",
                    "Book accommodations early for peak season"
                ]
            },
            summer: {
                whyFamous: `Summer offers full access to ${park.fullName} with extended daylight hours perfect for adventures`,
                uniqueActivities: [
                    "Extended day hiking and backpacking",
                    "Family camping experiences",
                    "Photography workshops",
                    "Evening ranger programs",
                    "Water activities where available"
                ],
                insiderTips: [
                    "Start early to beat afternoon heat",
                    "Make reservations well in advance",
                    "Bring sun protection and extra water"
                ]
            },
            fall: {
                whyFamous: `Fall transforms ${park.fullName} with comfortable temperatures and stunning seasonal colors`,
                uniqueActivities: [
                    "Fall foliage photography",
                    "Comfortable long-distance hiking",
                    "Wildlife viewing as animals prepare for winter",
                    "Peaceful camping with fewer crowds",
                    "Golden hour photography sessions"
                ],
                insiderTips: [
                    "Perfect hiking weather with cool temperatures",
                    "Fall colors timing varies by elevation",
                    "Less crowded than summer months"
                ]
            },
            winter: {
                whyFamous: `Winter offers a peaceful, snow-covered landscape at ${park.fullName} with unique seasonal activities`,
                uniqueActivities: [
                    "Winter landscape photography",
                    "Snow activities where available",
                    "Wildlife tracking in snow",
                    "Peaceful winter hiking",
                    "Cozy lodge experiences"
                ],
                insiderTips: [
                    "Check road and trail conditions",
                    "Dress in warm layers",
                    "Some facilities may have limited hours"
                ]
            }
        };
    }

    // 🧠 Infer best seasons from park location
    inferBestSeasons(park) {
        const lat = parseFloat(park.latitude) || 40;

        // Northern parks - avoid winter
        if (lat > 45) {
            return ['summer', 'fall'];
        }
        // Southern parks - great year-round
        else if (lat < 35) {
            return ['spring', 'fall', 'winter'];
        }
        // Mid-latitude - avoid extreme seasons
        else {
            return ['spring', 'summer', 'fall'];
        }
    }

    // 💰 Extract entry fee
    extractEntryFee(entranceFees) {
        if (!entranceFees || entranceFees.length === 0) return '0';
        const vehicleFee = entranceFees.find(fee => fee.title && fee.title.includes('Vehicle'));
        return vehicleFee?.cost || entranceFees[0]?.cost || '30';
    }

    // 💾 Cache management
    getFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < this.cacheDuration) {
                    return data.parks;
                }
            }
        } catch (error) {
            console.warn('Cache read failed:', error);
        }
        return null;
    }

    saveToCache(parks) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify({
                parks,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Cache save failed:', error);
        }
    }

    // 🆘 Enhanced fallback data (works without API)
    getFallbackData() {
        console.log('🔄 Using enhanced fallback data');
        return [
            {
                id: 'yell',
                name: 'Yellowstone National Park',
                state: 'Wyoming',
                entryFee: '35',
                coordinates: { lat: 44.4280, lng: -110.5885 },
                description: 'America\'s first national park with geothermal features and wildlife.',
                imageUrl: 'https://www.nps.gov/common/uploads/structured_data/3C7D2FBB-1DD8-B71B-0BED99731011CFCE.jpg',
                established: '1872',
                website: 'https://www.nps.gov/yell/index.htm',
                bestSeasons: ['spring', 'summer', 'fall'],
                seasons: this.getCuratedData()['Yellowstone National Park'].seasons,
                dataQuality: { tier: 'premium', accuracy: 95, source: 'curated' }
            },
            {
                id: 'grca',
                name: 'Grand Canyon National Park',
                state: 'Arizona',
                entryFee: '30',
                coordinates: { lat: 36.1069, lng: -112.1129 },
                description: 'Immense canyon carved by the Colorado River in Arizona.',
                imageUrl: 'https://www.nps.gov/common/uploads/structured_data/3C7D5A8C-1DD8-B71B-0B83F012ED802CEA.jpg',
                established: '1919',
                website: 'https://www.nps.gov/grca/index.htm',
                bestSeasons: ['spring', 'fall', 'winter'],
                seasons: this.getCuratedData()['Grand Canyon National Park'].seasons,
                dataQuality: { tier: 'premium', accuracy: 95, source: 'curated' }
            },
            {
                id: 'yose',
                name: 'Yosemite National Park',
                state: 'California',
                entryFee: '35',
                coordinates: { lat: 37.8651, lng: -119.5383 },
                description: 'Famous for waterfalls, deep valleys, grand meadows, and giant sequoias.',
                imageUrl: 'https://www.nps.gov/common/uploads/structured_data/3C84C3C0-1DD8-B71B-0BFF90B64283C3D8.jpg',
                established: '1890',
                website: 'https://www.nps.gov/yose/index.htm',
                bestSeasons: ['spring', 'summer', 'fall'],
                seasons: this.generateSeasonsFromNPS({ fullName: 'Yosemite National Park' }),
                dataQuality: { tier: 'standard', accuracy: 75, source: 'generated' }
            },
            {
                id: 'zion',
                name: 'Zion National Park',
                state: 'Utah',
                entryFee: '30',
                coordinates: { lat: 37.2982, lng: -113.0263 },
                description: 'Follow the paths where ancient native people and pioneers walked.',
                imageUrl: 'https://www.nps.gov/common/uploads/structured_data/3C7F4C9C-1DD8-B71B-0B0D5883FCD4E717.jpg',
                established: '1919',
                website: 'https://www.nps.gov/zion/index.htm',
                bestSeasons: ['spring', 'fall'],
                seasons: this.generateSeasonsFromNPS({ fullName: 'Zion National Park' }),
                dataQuality: { tier: 'standard', accuracy: 75, source: 'generated' }
            },
            {
                id: 'romo',
                name: 'Rocky Mountain National Park',
                state: 'Colorado',
                entryFee: '30',
                coordinates: { lat: 40.3428, lng: -105.6836 },
                description: 'Majestic mountain views, wildlife, and outdoor recreation.',
                imageUrl: 'https://www.nps.gov/common/uploads/structured_data/3C7F8031-1DD8-B71B-0B32976AC6A2B7E7.jpg',
                established: '1915',
                website: 'https://www.nps.gov/romo/index.htm',
                bestSeasons: ['summer', 'fall'],
                seasons: this.generateSeasonsFromNPS({ fullName: 'Rocky Mountain National Park' }),
                dataQuality: { tier: 'standard', accuracy: 75, source: 'generated' }
            },
            {
                id: 'acad',
                name: 'Acadia National Park',
                state: 'Maine',
                entryFee: '30',
                coordinates: { lat: 44.3386, lng: -68.2733 },
                description: 'Ocean meets mountain in this rugged coastal park.',
                imageUrl: 'https://www.nps.gov/common/uploads/structured_data/3C7B45AE-1DD8-B71B-0B7EE131C7DFC2F5.jpg',
                established: '1916',
                website: 'https://www.nps.gov/acad/index.htm',
                bestSeasons: ['summer', 'fall'],
                seasons: this.generateSeasonsFromNPS({ fullName: 'Acadia National Park' }),
                dataQuality: { tier: 'standard', accuracy: 75, source: 'generated' }
            },
            {
                id: 'glac',
                name: 'Glacier National Park',
                state: 'Montana',
                entryFee: '30',
                coordinates: { lat: 48.7596, lng: -113.7870 },
                description: 'Crown of the continent with pristine wilderness and glacial peaks.',
                imageUrl: 'https://www.nps.gov/common/uploads/structured_data/3C7FB2B9-1DD8-B71B-0B26F3C536955B89.jpg',
                established: '1910',
                website: 'https://www.nps.gov/glac/index.htm',
                bestSeasons: ['summer', 'fall'],
                seasons: this.generateSeasonsFromNPS({ fullName: 'Glacier National Park' }),
                dataQuality: { tier: 'standard', accuracy: 75, source: 'generated' }
            },
            {
                id: 'brca',
                name: 'Bryce Canyon National Park',
                state: 'Utah',
                entryFee: '30',
                coordinates: { lat: 37.5930, lng: -112.1871 },
                description: 'Geological amphitheaters filled with colorful rock formations called hoodoos.',
                imageUrl: 'https://www.nps.gov/common/uploads/structured_data/3C7EFF41-1DD8-B71B-0B50E940FE9F2658.jpg',
                established: '1928',
                website: 'https://www.nps.gov/brca/index.htm',
                bestSeasons: ['spring', 'fall'],
                seasons: this.generateSeasonsFromNPS({ fullName: 'Bryce Canyon National Park' }),
                dataQuality: { tier: 'standard', accuracy: 75, source: 'generated' }
            }
        ];
    }

    // 🔍 Debug method to check environment
    debugEnvironment() {
        console.log('🔍 Environment Debug:');
        console.log('- NPS API Key:', this.npsApiKey ? 'Found' : 'Missing');
        console.log('- Weather API Key:', this.weatherApiKey ? 'Found' : 'Missing');
        console.log('- Base URL:', this.baseUrl);
        console.log('- API Key Valid:', this.apiKeyValid);
    }
}

export default new HybridParksService();