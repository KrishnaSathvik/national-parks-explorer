import React, { useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const AppIntegration = () => {
  const [integrations, setIntegrations] = useState({
    database: { status: 'connected', lastSync: 'Just now' },
    api: { status: 'connected', lastSync: '2 min ago' },
    notifications: { status: 'error', lastSync: 'Never' },
    analytics: { status: 'connected', lastSync: '5 min ago' }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIntegrations(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            status: Math.random() > 0.3 ? 'connected' : 'error',
            lastSync: Math.random() > 0.3 ? 'Just now' : 'Failed'
          };
        });
        return updated;
      });
      setIsLoading(false);
    }, 1000);
  };

  const reconnectService = (serviceName) => {
    setIntegrations(prev => ({
      ...prev,
      [serviceName]: {
        status: 'connected',
        lastSync: 'Just now'
      }
    }));
  };

  const getStatusIcon = (status) => {
    if (status === 'connected') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (status) => {
    if (status === 'connected') {
      return 'bg-green-50 border-green-200';
    }
    return 'bg-red-50 border-red-200';
  };

  const connectedCount = Object.values(integrations).filter(i => i.status === 'connected').length;
  const errorCount = Object.values(integrations).filter(i => i.status === 'error').length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">App Integrations</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your application integrations</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

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
                <span>{integration.lastSync}</span>
              </div>
            </div>
            
            {integration.status === 'error' && (
              <button
                onClick={() => reconnectService(name)}
                className="w-full mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Reconnect
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
            <div className="text-sm text-gray-600">Connected Services</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-gray-600">Failed Services</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((connectedCount / 4) * 100)}%
            </div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
        </div>

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