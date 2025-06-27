// src/components/TripViewer/components/ShareOptions.jsx
import React, { useState } from 'react';
import { FaShare, FaCopy, FaDownload, FaEnvelope, FaTimes, FaCheck, FaTwitter, FaFacebook } from 'react-icons/fa';
import { shareTrip, exportTripToJSON } from '../../../utils/tripPlanner/tripHelpers';

const ShareOptions = ({ trip, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    // Generate shareable trip summary
    const generateShareText = () => {
        const parks = trip.parks?.map(p => p.parkName).join(', ') || 'amazing national parks';
        const duration = trip.totalDuration || 1;
        const cost = trip.estimatedCost ? `$${Math.round(trip.estimatedCost).toLocaleString()}` : 'budget-friendly';

        return `🏞️ ${trip.title || 'My National Parks Adventure'}\n\n` +
            `${duration} day${duration > 1 ? 's' : ''} exploring ${parks}!\n` +
            `Estimated cost: ${cost}\n` +
            `Transportation: ${trip.transportationMode === 'flying' ? 'Flight + Car' : 'Road Trip'}\n\n` +
            `Plan your own adventure at: ${window.location.origin}`;
    };

    // Copy to clipboard
    const handleCopyToClipboard = async () => {
        try {
            const shareText = generateShareText();
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    // Native share
    const handleNativeShare = async () => {
        setIsSharing(true);
        try {
            const result = await shareTrip(trip);
            if (result.success && result.method === 'native') {
                onClose();
            }
        } catch (error) {
            console.error('Share failed:', error);
        } finally {
            setIsSharing(false);
        }
    };

    // Download trip as JSON
    const handleDownloadTrip = () => {
        try {
            const tripData = exportTripToJSON(trip);
            const blob = new Blob([tripData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${trip.title || 'trip'}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    // Social media sharing
    const handleSocialShare = (platform) => {
        const shareText = generateShareText();
        const encodedText = encodeURIComponent(shareText);
        const url = encodeURIComponent(window.location.href);

        let shareUrl = '';

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(trip.title || 'My National Parks Trip')}&body=${encodedText}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaShare className="text-blue-500" />
                        Share Your Trip
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Trip Preview */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <h4 className="font-semibold text-gray-800 mb-2">{trip.title || 'Untitled Trip'}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <div>📍 {trip.parks?.length || 0} parks • {trip.totalDuration || 1} days</div>
                        <div>💰 ~${Math.round(trip.estimatedCost || 0).toLocaleString()}</div>
                        <div>🚗 {trip.transportationMode === 'flying' ? 'Flight + Car' : 'Road Trip'}</div>
                    </div>
                </div>

                {/* Share Options */}
                <div className="p-6 space-y-4">
                    {/* Native Share */}
                    {navigator.share && (
                        <button
                            onClick={handleNativeShare}
                            disabled={isSharing}
                            className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors disabled:opacity-50"
                        >
                            <div className="p-2 bg-blue-500 text-white rounded-lg">
                                <FaShare />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-gray-800">Share with System</div>
                                <div className="text-xs text-gray-600">Use your device's native sharing</div>
                            </div>
                        </button>
                    )}

                    {/* Copy to Clipboard */}
                    <button
                        onClick={handleCopyToClipboard}
                        className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors"
                    >
                        <div className="p-2 bg-green-500 text-white rounded-lg">
                            {copied ? <FaCheck /> : <FaCopy />}
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-gray-800">
                                {copied ? 'Copied!' : 'Copy Trip Details'}
                            </div>
                            <div className="text-xs text-gray-600">
                                {copied ? 'Trip details copied to clipboard' : 'Copy shareable trip summary'}
                            </div>
                        </div>
                    </button>

                    {/* Download JSON */}
                    <button
                        onClick={handleDownloadTrip}
                        className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors"
                    >
                        <div className="p-2 bg-purple-500 text-white rounded-lg">
                            <FaDownload />
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-gray-800">Download Trip Data</div>
                            <div className="text-xs text-gray-600">Export as JSON file for backup</div>
                        </div>
                    </button>

                    {/* Social Media */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 mb-3">Share on Social Media</div>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleSocialShare('twitter')}
                                className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                            >
                                <FaTwitter className="text-blue-500 text-lg" />
                                <span className="text-xs text-gray-600">Twitter</span>
                            </button>

                            <button
                                onClick={() => handleSocialShare('facebook')}
                                className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                            >
                                <FaFacebook className="text-blue-600 text-lg" />
                                <span className="text-xs text-gray-600">Facebook</span>
                            </button>

                            <button
                                onClick={() => handleSocialShare('email')}
                                className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
                            >
                                <FaEnvelope className="text-gray-600 text-lg" />
                                <span className="text-xs text-gray-600">Email</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 rounded-b-2xl">
                    <p className="text-xs text-gray-500 text-center">
                        Sharing helps others discover amazing national parks adventures!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareOptions;