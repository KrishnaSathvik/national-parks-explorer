import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

const AppIntegration = () => {
  const [integrations, setIntegrations] = useState({
    database: { status: 'disconnected', lastSync: null },
    api: { status: 'disconnected', lastSync: null },
    notifications: { status: 'disconnected', lastSync: null },
    analytics: { status: 'disconnected', lastSync: null }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Simulate integration status checks
  useEffect(() => {
    checkIntegrationStatus();
    const interval = setInterval(checkIntegrationStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), { message, type, timestamp }]);
  };

  const checkIntegrationStatus = async () => {
    setIsLoading(true);
    addLog('Checking integration status...', 'info');
    
    // Simulate API calls to check each integration
    const services = ['database', 'api', 'notifications', 'analytics'];
    
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      
      const isConnected = Math.random() > 0.2; // 80% chance of success
      const status = isConnected ? 'connected' : 'error';
      
      setIntegrations(prev => ({
        ...prev,
        [service]: {
          status,
          lastSync: isConnected ? new Date() : prev[service].lastSync
        }
      }));
      
      const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
      const logMessage = `${serviceName} ${isConnected ? 'connected' : 'connection failed'}`;
      const logType = isConnected ? 'success' : 'error';
      addLog(logMessage, logType);
    }
    
    setIsLoading(false);
    addLog('Integration status check completed', 'info');
  };

  const reconnectService = async (serviceName) => {
    setIsLoading(true);
    addLog(`Attempting to reconnect ${serviceName}...`, 'info');
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate reconnection time
    
    const success = Math.random() > 0.3; // 70% chance of success
    
    setIntegrations(prev => ({
      ...prev,
      [serviceName]: {
        status: success ? 'connected' : 'error',
        lastSync: success ? new Date() : prev[serviceName].lastSync
      }
    }));
    
    addLog(`${serviceName} ${success ? 'reconnected successfully' : 'reconnection failed'}`, 
           success ? 'success' : 'error');
    setIsLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatLastSync = (lastSync) => {
    if (!lastSync) return 'Never';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSync.getTime()) / 1000 / 60);
    return `${diffInMinutes} min ago`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">App Integrations</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your application integrations</p>
        </div>
        <button
          onClick={checkIntegrationStatus}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(integrations).map(([name, integration]) => (
          <div
            key={name}
            className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(integration.status)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 capitalize">{name}</h3>
              {getStatusIcon(integration.status)}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize font-medium">{integration.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Sync:</span>
                <span>{formatLastSync(integration.lastSync)}</span>
              </div>
            </div>
            
            {integration.status === 'error' && (
              <button
                onClick={() => reconnectService(name)}
                disabled={isLoading}
                className="w-full mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Reconnect
              </button>
            )}
          </div>
        ))}
      </div>

      {/* System Health Overview */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(integrations).filter(i => i.status === 'connected').length}
            </div>
            <div className="text-sm text-gray-600">Connected Services</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(integrations).filter(i => i.status === 'error').length}
            </div>
            <div className="text-sm text-gray-600">Failed Services</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((Object.values(integrations).filter(i => i.status === 'connected').length / 4) * 100)}%
            </div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
        </div>

        {/* Activity Logs */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm ${
                      log.type === 'error' ? 'text-red-600' :
                      log.type === 'success' ? 'text-green-600' :
                      'text-gray-600'
                    }`}
                  >
                    <span className="text-xs text-gray-400 font-mono">
                      {log.timestamp}
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integration Configuration */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium">Configure Database</span>
          </button>
          
          <button className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium">API Settings</span>
          </button>
          
          <button className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium">Notification Rules</span>
          </button>
          
          <button className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium">Analytics Setup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppIntegration;