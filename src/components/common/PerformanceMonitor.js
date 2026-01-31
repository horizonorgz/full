import React, { useState, useEffect, useRef } from 'react';
import { Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

const PerformanceMonitor = ({ queryExecutionTime, memoryUsage, isVisible = false }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    queryTimes: [],
    memoryUsage: [],
    averageQueryTime: 0,
    slowQueries: 0,
    totalQueries: 0
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const metricsRef = useRef(null);

  // Track query performance
  useEffect(() => {
    if (queryExecutionTime) {
      setPerformanceMetrics(prev => {
        const newQueryTimes = [...prev.queryTimes, queryExecutionTime];
        const averageTime = newQueryTimes.reduce((a, b) => a + b, 0) / newQueryTimes.length;
        const slowQueries = newQueryTimes.filter(time => time > 5000).length; // Queries > 5s
        
        return {
          queryTimes: newQueryTimes.slice(-10), // Keep last 10 queries
          memoryUsage: [...prev.memoryUsage, memoryUsage || 0].slice(-10),
          averageQueryTime: averageTime,
          slowQueries,
          totalQueries: newQueryTimes.length
        };
      });
    }
  }, [queryExecutionTime, memoryUsage]);

  // Get performance status
  const getPerformanceStatus = () => {
    const avgTime = performanceMetrics.averageQueryTime;
    if (avgTime < 1000) return { status: 'excellent', color: 'text-green-500', icon: TrendingUp };
    if (avgTime < 3000) return { status: 'good', color: 'text-yellow-500', icon: Clock };
    return { status: 'needs_attention', color: 'text-red-500', icon: AlertTriangle };
  };

  const performanceStatus = getPerformanceStatus();
  const StatusIcon = performanceStatus.icon;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed View */}
      <div 
        className={`bg-gray-900 border border-gray-700 rounded-lg shadow-lg transition-all duration-300 ${
          isExpanded ? 'w-80 h-96' : 'w-16 h-16'
        }`}
      >
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full h-full flex items-center justify-center text-logocolor hover:bg-gray-800 transition-colors rounded-lg"
            title="Performance Monitor"
          >
            <Activity className="h-6 w-6" />
          </button>
        ) : (
          <div className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-logocolor" />
                <h3 className="text-sm font-jersey text-white">Performance Monitor</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Performance Status */}
            <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-800 rounded-lg">
              <StatusIcon className={`h-4 w-4 ${performanceStatus.color}`} />
              <span className="text-xs text-white font-normaltext">
                {performanceStatus.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Metrics */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {/* Average Query Time */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-normaltext">Avg Query Time</span>
                  <Clock className="h-3 w-3 text-gray-400" />
                </div>
                <div className="text-lg font-jersey text-white">
                  {performanceMetrics.averageQueryTime.toFixed(0)}ms
                </div>
              </div>

              {/* Total Queries */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-normaltext">Total Queries</span>
                  <TrendingUp className="h-3 w-3 text-gray-400" />
                </div>
                <div className="text-lg font-jersey text-white">
                  {performanceMetrics.totalQueries}
                </div>
              </div>

              {/* Slow Queries */}
              {performanceMetrics.slowQueries > 0 && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-normaltext">Slow Queries</span>
                    <AlertTriangle className="h-3 w-3 text-red-400" />
                  </div>
                  <div className="text-lg font-jersey text-red-400">
                    {performanceMetrics.slowQueries}
                  </div>
                </div>
              )}

              {/* Recent Query Times */}
              {performanceMetrics.queryTimes.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-normaltext">Recent Times</span>
                  </div>
                  <div className="space-y-1">
                    {performanceMetrics.queryTimes.slice(-5).map((time, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-400">Query {performanceMetrics.totalQueries - 4 + index}</span>
                        <span className={`font-normaltext ${
                          time > 5000 ? 'text-red-400' : time > 2000 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {time.toFixed(0)}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 text-center">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
