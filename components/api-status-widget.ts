'use client';

import { useEffect, useState } from 'react';

interface APIStatus {
  name: string;
  enabled: boolean;
  available: boolean;
  requestsUsed: string;
  failures: number;
  circuitBreaker: 'OPEN' | 'CLOSED';
  capabilities: string[];
}

export function APIStatusWidget() {
  const [status, setStatus] = useState<Record<string, APIStatus> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/api-status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.apis);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch API status:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="text-2xl">🔌</span> API Status
      </h3>
      
      <div className="space-y-2">
        {Object.entries(status).map(([key, api]) => (
          <div key={key} className="bg-gray-700 rounded p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-white">{api.name}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  api.available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {api.available ? '✓ Available' : '✗ Unavailable'}
                </span>
                {api.circuitBreaker === 'OPEN' && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-600 text-white">
                    🔒 Breaker Open
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Requests:</span>
                <span className="font-mono">{api.requestsUsed}</span>
              </div>
              {api.failures > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Failures:</span>
                  <span className="font-mono">{api.failures}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {api.capabilities.map(cap => (
                  <span key={cap} className="px-2 py-1 bg-gray-600 rounded text-xs">
                    {cap.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
