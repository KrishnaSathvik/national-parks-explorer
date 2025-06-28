// src/components/TripViewer/components/EquipmentList.jsx
import React, { useState, useMemo } from 'react';
import {
    FaCheck,
    FaBackpack,
    FaCamera,
    FaTshirt,
    FaFirstAid,
    FaUtensils,
    FaBed,
    FaMapMarkerAlt,
    FaSun,
    FaSnowflake,
    FaCloudRain,
    FaLeaf,
    FaPlus,
    FaTrash,
    FaDownload,
    FaPrint,
    FaCar,
    FaPlane
} from 'react-icons/fa';

/**
 * Smart equipment and packing list generator for national parks trips
 * Provides context-aware suggestions based on trip details
 */

const EquipmentList = ({ trip, className = "" }) => {
    const [checkedItems, setCheckedItems] = useState(new Set());
    const [customItems, setCustomItems] = useState([]);
    const [newItemText, setNewItemText] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    // Base equipment categories
    const equipmentCategories = {
        clothing: {
            name: 'Clothing & Apparel',
            icon: FaTshirt,
            color: 'blue',
            items: []
        },
        gear: {
            name: 'Outdoor Gear',
            icon: FaBackpack,
            color: 'green',
            items: []
        },
        electronics: {
            name: 'Electronics',
            icon: FaCamera,
            color: 'purple',
            items: []
        },
        safety: {
            name: 'Safety & First Aid',
            icon: FaFirstAid,
            color: 'red',
            items: []
        },
        food: {
            name: 'Food & Kitchen',
            icon: FaUtensils,
            color: 'orange',
            items: []
        },
        camping: {
            name: 'Camping & Sleep',
            icon: FaBed,
            color: 'indigo',
            items: []
        }
    };

    // Helper function to determine season from date
    const getSeasonFromDate = (dateString) => {
        if (!dateString) return 'summer';

        const date = new Date(dateString);
        const month = date.getMonth();

        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    };

    // Generate smart packing suggestions based on trip data
    const packingList = useMemo(() => {
        if (!trip) return equipmentCategories;

        const suggestions = { ...equipmentCategories };
        const duration = trip.totalDuration || 1;
        const season = getSeasonFromDate(trip.startDate);
        const parks = trip.parks || [];
        const transportMode = trip.transportationMode || 'driving';
        const activities = trip.preferences?.activities || [];

        // Base clothing items
        suggestions.clothing.items = [
            { name: 'Comfortable hiking shoes', priority: 'essential', reason: 'Park exploration' },
            { name: 'Moisture-wicking t-shirts', priority: 'essential', quantity: Math.min(duration, 4) },
            { name: 'Quick-dry hiking pants', priority: 'essential' },
            { name: 'Underwear', priority: 'essential', quantity: duration + 1 },
            { name: 'Socks (moisture-wicking)', priority: 'essential', quantity: duration + 1 }
        ];

        // Season-specific clothing
        if (season === 'winter') {
            suggestions.clothing.items.push(
                { name: 'Insulated winter jacket', priority: 'essential', reason: 'Cold weather protection' },
                { name: 'Thermal base layers', priority: 'essential' },
                { name: 'Warm hat and gloves', priority: 'essential' },
                { name: 'Waterproof boots', priority: 'important' }
            );
        } else if (season === 'summer') {
            suggestions.clothing.items.push(
                { name: 'Sun hat with brim', priority: 'important', reason: 'Sun protection' },
                { name: 'Lightweight long sleeves', priority: 'important', reason: 'Sun/insect protection' },
                { name: 'Sunglasses', priority: 'essential' },
                { name: 'Sandals or water shoes', priority: 'nice-to-have' }
            );
        }

        if (season === 'spring' || season === 'fall') {
            suggestions.clothing.items.push(
                { name: 'Layered clothing system', priority: 'important', reason: 'Variable temperatures' },
                { name: 'Light rain jacket', priority: 'important' }
            );
        }

        // Base outdoor gear
        suggestions.gear.items = [
            { name: 'Day backpack (20-30L)', priority: 'essential', reason: 'Daily hikes and exploration' },
            { name: 'Water bottles (2-3L total)', priority: 'essential', reason: 'Hydration in parks' },
            { name: 'Park maps and guidebooks', priority: 'important' },
            { name: 'Headlamp or flashlight', priority: 'essential', reason: 'Early/late activities' },
            { name: 'Multi-tool or knife', priority: 'nice-to-have' }
        ];

        // Activity-specific gear
        if (activities.includes('hiking') || activities.includes('backpacking')) {
            suggestions.gear.items.push(
                { name: 'Trekking poles', priority: 'important', reason: 'Hiking activities' },
                { name: 'Gaiters', priority: 'nice-to-have', reason: 'Trail protection' }
            );
        }

        if (activities.includes('photography')) {
            suggestions.electronics.items.push(
                { name: 'Extra camera batteries', priority: 'important', reason: 'Photography activities' },
                { name: 'Memory cards', priority: 'important' },
                { name: 'Camera cleaning kit', priority: 'nice-to-have' },
                { name: 'Tripod', priority: 'nice-to-have', reason: 'Landscape photography' }
            );
        }

        // Transportation-specific items
        if (transportMode === 'flying') {
            suggestions.gear.items.push(
                { name: 'TSA-compliant toiletries', priority: 'essential', reason: 'Air travel requirements' },
                { name: 'Carry-on essentials bag', priority: 'important' }
            );
        } else {
            suggestions.gear.items.push(
                { name: 'Cooler for road trip snacks', priority: 'nice-to-have', reason: 'Road trip convenience' },
                { name: 'Car phone charger', priority: 'important' }
            );
        }

        // Electronics
        suggestions.electronics.items = [
            { name: 'Smartphone with offline maps', priority: 'essential', reason: 'Navigation and communication' },
            { name: 'Portable phone charger/power bank', priority: 'essential' },
            { name: 'Camera', priority: 'important', reason: 'Capture memories' },
            { name: 'Car charger', priority: 'important' },
            { name: 'Headphones', priority: 'nice-to-have' }
        ];

        // Safety & First Aid
        suggestions.safety.items = [
            { name: 'Basic first aid kit', priority: 'essential', reason: 'Emergency preparedness' },
            { name: 'Sunscreen (SPF 30+)', priority: 'essential', reason: 'UV protection at altitude' },
            { name: 'Insect repellent', priority: 'important', reason: 'Bug protection' },
            { name: 'Personal medications', priority: 'essential' },
            { name: 'Emergency whistle', priority: 'important', reason: 'Safety signaling' },
            { name: 'Hand sanitizer', priority: 'important' }
        ];

        // Food & Kitchen (for longer trips)
        if (duration > 2) {
            suggestions.food.items = [
                { name: 'Non-perishable snacks', priority: 'important', reason: 'Energy for activities' },
                { name: 'Reusable water filtration', priority: 'nice-to-have', reason: 'Backcountry water safety' },
                { name: 'Lunch supplies', priority: 'important' },
                { name: 'Coffee/tea supplies', priority: 'nice-to-have' }
            ];
        }

        // Camping gear (if camping activities detected)
        if (activities.includes('camping') || duration > 4) {
            suggestions.camping.items = [
                { name: 'Tent or shelter', priority: 'essential', reason: 'Overnight accommodation' },
                { name: 'Sleeping bag', priority: 'essential' },
                { name: 'Sleeping pad', priority: 'essential' },
                { name: 'Camp stove and fuel', priority: 'important' },
                { name: 'Cookware and utensils', priority: 'important' },
                { name: 'Lantern or camp lighting', priority: 'important' }
            ];
        }

        return suggestions;
    }, [trip]);

    // Get all items for display
    const allItems = useMemo(() => {
        const items = [];

        Object.entries(packingList).forEach(([categoryKey, category]) => {
            category.items.forEach(item => {
                items.push({
                    ...item,
                    category: categoryKey,
                    categoryName: category.name,
                    id: `${categoryKey}-${item.name.replace(/\s+/g, '-').toLowerCase()}`
                });
            });
        });

        // Add custom items
        customItems.forEach((item, index) => {
            items.push({
                ...item,
                category: 'custom',
                categoryName: 'Custom Items',
                id: `custom-${index}`,
                isCustom: true
            });
        });

        return items;
    }, [packingList, customItems]);

    // Filter items by category
    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') return allItems;
        return allItems.filter(item => item.category === activeCategory);
    }, [allItems, activeCategory]);

    // Toggle item checked state
    const toggleItem = (itemId) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Add custom item
    const addCustomItem = () => {
        if (!newItemText.trim()) return;

        setCustomItems(prev => [...prev, {
            name: newItemText.trim(),
            priority: 'custom',
            reason: 'Added by user'
        }]);
        setNewItemText('');
    };

    // Remove custom item
    const removeCustomItem = (index) => {
        setCustomItems(prev => prev.filter((_, i) => i !== index));
    };

    // Export list as text
    const exportList = () => {
        const text = allItems.map(item => {
            const checked = checkedItems.has(item.id) ? '✓' : '☐';
            return `${checked} ${item.name}${item.quantity ? ` (${item.quantity})` : ''}`;
        }).join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${trip?.title || 'trip'}-packing-list.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Print list
    const printList = () => {
        const printContent = `
      <h1>${trip?.title || 'Trip'} - Packing List</h1>
      ${Object.entries(packingList).map(([key, category]) => `
        <h2>${category.name}</h2>
        <ul>
          ${category.items.map(item => `
            <li>☐ ${item.name}${item.quantity ? ` (${item.quantity})` : ''}</li>
          `).join('')}
        </ul>
      `).join('')}
      ${customItems.length > 0 ? `
        <h2>Custom Items</h2>
        <ul>
          ${customItems.map(item => `<li>☐ ${item.name}</li>`).join('')}
        </ul>
      ` : ''}
    `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head><title>Packing List</title></head>
        <body style="font-family: Arial, sans-serif; margin: 20px;">
          ${printContent}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    // Get category stats
    const getCategoryStats = (categoryKey) => {
        const categoryItems = allItems.filter(item => item.category === categoryKey);
        const checkedCount = categoryItems.filter(item => checkedItems.has(item.id)).length;
        return { total: categoryItems.length, checked: checkedCount };
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'essential': return 'text-red-600 bg-red-100';
            case 'important': return 'text-orange-600 bg-orange-100';
            case 'nice-to-have': return 'text-blue-600 bg-blue-100';
            case 'custom': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (!trip) {
        return (
            <div className="text-center py-8 text-gray-500">
                <FaBackpack className="mx-auto text-4xl mb-2 opacity-50" />
                <p>No trip data available for packing suggestions</p>
            </div>
        );
    }

    const season = getSeasonFromDate(trip.startDate);
    const seasonIcons = {
        spring: FaLeaf,
        summer: FaSun,
        fall: FaLeaf,
        winter: FaSnowflake
    };
    const SeasonIcon = seasonIcons[season] || FaSun;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                        <FaBackpack className="text-green-600" />
                        Smart Packing List
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={exportList}
                            className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                            <FaDownload className="text-xs" />
                            Export
                        </button>
                        <button
                            onClick={printList}
                            className="text-sm bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1"
                        >
                            <FaPrint className="text-xs" />
                            Print
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-green-700">
                    <div className="flex items-center gap-1">
                        <SeasonIcon />
                        <span className="capitalize">{season} trip</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaMapMarkerAlt />
                        <span>{trip.parks?.length || 0} parks</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>{trip.totalDuration || 1} days</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {trip.transportationMode === 'flying' ? <FaPlane /> : <FaCar />}
                        <span className="capitalize">{trip.transportationMode || 'driving'}</span>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === 'all'
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    All Items ({allItems.length})
                </button>

                {Object.entries(packingList).map(([key, category]) => {
                    if (category.items.length === 0) return null;
                    const stats = getCategoryStats(key);
                    const IconComponent = category.icon;

                    return (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                                activeCategory === key
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <IconComponent className="text-xs" />
                            {category.name} ({stats.checked}/{stats.total})
                        </button>
                    );
                })}

                {customItems.length > 0 && (
                    <button
                        onClick={() => setActiveCategory('custom')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            activeCategory === 'custom'
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Custom ({customItems.length})
                    </button>
                )}
            </div>

            {/* Progress Summary */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Packing Progress</span>
                    <span className="text-sm text-gray-500">
            {checkedItems.size} of {allItems.length} items
          </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${allItems.length > 0 ? (checkedItems.size / allItems.length) * 100 : 0}%` }}
                    />
                </div>
            </div>

            {/* Add Custom Item */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Add Custom Item</h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                        placeholder="Enter custom item..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <button
                        onClick={addCustomItem}
                        disabled={!newItemText.trim()}
                        className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <FaPlus className="text-xs" />
                        Add
                    </button>
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FaBackpack className="mx-auto text-3xl mb-2 opacity-50" />
                        <p>No items in this category</p>
                    </div>
                ) : (
                    <>
                        {/* Group by priority for better organization */}
                        {['essential', 'important', 'nice-to-have', 'custom'].map(priority => {
                            const priorityItems = filteredItems.filter(item => item.priority === priority);
                            if (priorityItems.length === 0) return null;

                            return (
                                <div key={priority} className="space-y-2">
                                    <h4 className="font-medium text-gray-700 text-sm uppercase tracking-wide">
                                        {priority === 'nice-to-have' ? 'Nice to Have' : priority}
                                        ({priorityItems.length})
                                    </h4>

                                    {priorityItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={`bg-white rounded-lg border border-gray-200 p-3 transition-all duration-200 ${
                                                checkedItems.has(item.id) ? 'bg-green-50 border-green-200' : 'hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={() => toggleItem(item.id)}
                                                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                                        checkedItems.has(item.id)
                                                            ? 'bg-green-500 border-green-500 text-white'
                                                            : 'border-gray-300 hover:border-green-500'
                                                    }`}
                                                >
                                                    {checkedItems.has(item.id) && <FaCheck className="text-xs" />}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className={`font-medium ${
                                                                checkedItems.has(item.id) ? 'text-green-700 line-through' : 'text-gray-800'
                                                            }`}>
                                                                {item.name}
                                                                {item.quantity && (
                                                                    <span className="text-sm text-gray-500 ml-1">
                                    ({item.quantity})
                                  </span>
                                                                )}
                                                            </div>

                                                            {item.reason && (
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {item.reason}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 ml-3">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(item.priority)}`}>
                                {item.priority === 'nice-to-have' ? 'Optional' : item.priority}
                              </span>

                                                            {item.isCustom && (
                                                                <button
                                                                    onClick={() => removeCustomItem(customItems.findIndex(ci => ci.name === item.name))}
                                                                    className="text-red-500 hover:text-red-700 p-1"
                                                                >
                                                                    <FaTrash className="text-xs" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Packing Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Pack essentials in your carry-on if flying</li>
                    <li>• Check weather forecasts before departure</li>
                    <li>• Verify park-specific gear requirements</li>
                    <li>• Leave extra space for souvenirs</li>
                    {trip.transportationMode === 'driving' && (
                        <li>• Keep emergency supplies in your vehicle</li>
                    )}
                    {(trip.totalDuration || 1) > 3 && (
                        <li>• Consider doing laundry mid-trip for longer journeys</li>
                    )}
                </ul>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {allItems.filter(item => item.priority === 'essential').length}
                    </div>
                    <div className="text-xs text-gray-500">Essential Items</div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {allItems.filter(item => item.priority === 'important').length}
                    </div>
                    <div className="text-xs text-gray-500">Important Items</div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {allItems.filter(item => item.priority === 'nice-to-have').length}
                    </div>
                    <div className="text-xs text-gray-500">Optional Items</div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {Math.round(allItems.length > 0 ? (checkedItems.size / allItems.length) * 100 : 0)}%
                    </div>
                    <div className="text-xs text-gray-500">Complete</div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentList;