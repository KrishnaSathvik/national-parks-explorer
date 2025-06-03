import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FadeInWrapper from "../components/FadeInWrapper";
import { 
  FaDatabase, 
  FaCloud, 
  FaBell, 
  FaChartBar, 
  FaCheck, 
  FaExclamationTriangle,
  FaSync,
  FaCogs,
  FaHome
} from "react-icons/fa";

const AppIntegration = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [integrations, setIntegrations] = useState({
    database: { 
      name: "Database", 
      status: "connected", 
      lastSync: "2 min ago",
      icon: <FaDatabase className="text-2xl" />
    },
    api: { 
      name: "API Services", 
      status: "connected", 
      lastSync: "Just now",
      icon: <FaCloud className="text-2xl" />
    },
    notifications: { 
      name: "Push Notifications", 
      status: "error", 
      lastSync: "Failed",
      icon: <FaBell className="text-2xl" />
    },
    analytics: { 
      name: "Analytics", 
      status: "connected", 
      lastSync: "5 min ago",
      icon: <FaChartBar className="text-2xl" />
    }
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    showToast("🔄 Refreshing integration status...", "info");
    
    setTimeout(() => {
      const newIntegrations = { ...integrations };
      Object.keys(newIntegrations).forEach(key => {
        const isConnected = Math.random() > 0.25;
        newIntegrations[key] = {
          ...newIntegrations[key],
          status: isConnected ? "connected" : "error",
          lastSync: isConnected ? "Just now" : "Failed"
        };
      });
      
      setIntegrations(newIntegrations);
      setIsLoading(false);
      showToast("✅ Integration status updated", "success");
    }, 1500);
  };

  const handleReconnect = (serviceName) => {
    showToast(`🔄 Reconnecting ${integrations[serviceName].name}...`, "info");
    
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [serviceName]: {
          ...prev[serviceName],
          status: "connected",
          lastSync: "Just now"
        }
      }));
      showToast(`✅ ${integrations[serviceName].name} reconnected!`, "success");
    }, 1000);
  };

  const connectedCount = Object.values(integrations).filter(i => i.status === "connected").length;
  const errorCount = Object.values(integrations).filter(i => i.status === "error").length;
  const uptime = Math.round((connectedCount / 4) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      <div className="bg-white/90 backdrop-blur-md px-4 py-6 rounded-2xl shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-600 flex items-center gap-2 text-center sm:text-left">
            <FaCogs className="text-pink-600" />
            App Integrations
          </h1>
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 text-sm font-medium">
            <Link
              to="/"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white text-gray-800 border hover:bg-pink-50 hover:text-pink-600 transition"
            >
              <FaHome /> Back to Home
            </Link>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition disabled:opacity-50"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <FadeInWrapper delay={0.1}>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{connectedCount}</div>
                <div className="text-sm text-green-700 font-medium">Connected Services</div>
              </div>
            </div>
          </FadeInWrapper>

          <FadeInWrapper delay={0.2}>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{errorCount}</div>
                <div className="text-sm text-red-700 font-medium">Failed Services</div>
              </div>
            </div>
          </FadeInWrapper>

          <FadeInWrapper delay={0.3}>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{uptime}%</div>
                <div className="text-sm text-blue-700 font-medium">System Uptime</div>
              </div>
            </div>
          </FadeInWrapper>
        </div>

        {/* Integration Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {Object.entries(integrations).map(([key, integration], idx) => (
            <FadeInWrapper key={key} delay={idx * 0.1}>
              <div className={`p-6 rounded-2xl shadow-sm border-2 transition-all duration-200 ${
                integration.status === "connected" 
                  ? "bg-gradient-to-br from-green-50 to-white border-green-200 hover:shadow-md" 
                  : "bg-gradient-to-br from-red-50 to-white border-red-200 hover:shadow-md"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    integration.status === "connected" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}>
                    {integration.icon}
                  </div>
                  <div className={`p-1 rounded-full ${
                    integration.status === "connected" ? "bg-green-500" : "bg-red-500"
                  }`}>
                    {integration.status === "connected" ? (
                      <FaCheck className="text-white text-xs" />
                    ) : (
                      <FaExclamationTriangle className="text-white text-xs" />
                    )}
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{integration.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`capitalize font-medium ${
                      integration.status === "connected" ? "text-green-600" : "text-red-600"
                    }`}>
                      {integration.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Sync:</span>
                    <span className="font-medium">{integration.lastSync}</span>
                  </div>
                </div>
                
                {integration.status === "error" && (
                  <button
                    onClick={() => handleReconnect(key)}
                    className="w-full mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Reconnect Service
                  </button>
                )}
              </div>
            </FadeInWrapper>
          ))}
        </div>

        {/* Quick Actions */}
        <FadeInWrapper delay={0.5}>
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCogs className="text-pink-600" />
              Quick Configuration
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: "Database Settings", icon: <FaDatabase /> },
                { name: "API Configuration", icon: <FaCloud /> },
                { name: "Notification Rules", icon: <FaBell /> },
                { name: "Analytics Setup", icon: <FaChartBar /> }
              ].map((action, idx) => (
                <button
                  key={action.name}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  {action.icon}
                  <span className="text-sm font-medium">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        </FadeInWrapper>

        {/* Status Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()} • 
            {currentUser ? ` Logged in as ${currentUser.email}` : " Not logged in"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppIntegration;