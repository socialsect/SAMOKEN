import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiMapPin, 
  FiGlobe, 
  FiMonitor, 
  FiSmartphone, 
  FiChrome,
  FiTrendingUp,
  FiEye
} from 'react-icons/fi';

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    traffic: {
      totalViews: 0,
      uniqueVisitors: 0,
      todayViews: 0,
      growth: 0
    },
    geography: {
      countries: [],
      cities: [],
      topLocation: ''
    },
    behavior: {
      topPages: [],
      entryPages: [],
      exitPages: [],
      avgSessionDuration: 0
    },
    technical: {
      devices: {},
      browsers: {},
      os: {},
      screenResolutions: []
    },
    realtime: {
      currentVisitors: 0,
      activePages: [],
      recentActivity: []
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      // In a real implementation, this would fetch from Vercel Analytics API
      // For now, we'll simulate the data structure
      
      setTimeout(() => {
        setAnalyticsData({
          traffic: {
            totalViews: 12450,
            uniqueVisitors: 2890,
            todayViews: 134,
            growth: 15.8
          },
          geography: {
            countries: [
              { name: 'France', visitors: 1890, percentage: 58.2 },
              { name: 'Belgium', visitors: 234, percentage: 7.2 },
              { name: 'Switzerland', visitors: 189, percentage: 5.8 },
              { name: 'Germany', visitors: 167, percentage: 5.1 },
              { name: 'United Kingdom', visitors: 145, percentage: 4.5 }
            ],
            cities: [
              { name: 'Paris', visitors: 890, percentage: 27.4 },
              { name: 'Lyon', visitors: 234, percentage: 7.2 },
              { name: 'Marseille', visitors: 189, percentage: 5.8 },
              { name: 'Toulouse', visitors: 145, percentage: 4.5 },
              { name: 'Nice', visitors: 123, percentage: 3.8 }
            ],
            topLocation: 'France'
          },
          behavior: {
            topPages: [
              { path: '/', views: 3890, percentage: 31.2 },
              { path: '/admin', views: 1980, percentage: 15.9 },
              { path: '/yt-panel', views: 1560, percentage: 12.5 },
              { path: '/about', views: 1120, percentage: 9.0 },
              { path: '/contact', views: 890, percentage: 7.1 }
            ],
            entryPages: [
              { path: '/', entries: 1980, percentage: 68.5 },
              { path: '/admin', entries: 420, percentage: 14.5 },
              { path: '/about', entries: 210, percentage: 7.3 },
              { path: '/contact', entries: 180, percentage: 6.2 },
              { path: '/yt-panel', entries: 100, percentage: 3.5 }
            ],
            exitPages: [
              { path: '/contact', exits: 420, percentage: 14.5 },
              { path: '/about', exits: 210, percentage: 7.3 },
              { path: '/yt-panel', exits: 180, percentage: 6.2 },
              { path: '/admin', exits: 110, percentage: 3.8 },
              { path: '/', exits: 90, percentage: 3.1 }
            ],
            avgSessionDuration: 4.2
          },
          technical: {
            devices: {
              desktop: 58.7,
              mobile: 36.8,
              tablet: 4.5
            },
            browsers: {
              chrome: 52.3,
              safari: 28.7,
              firefox: 15.2,
              edge: 3.8
            },
            os: {
              windows: 38.9,
              macOS: 32.4,
              iOS: 22.1,
              android: 6.6
            },
            screenResolutions: [
              { resolution: '1920x1080', percentage: 23.4 },
              { resolution: '1366x768', percentage: 18.7 },
              { resolution: '1440x900', percentage: 15.2 },
              { resolution: '1536x864', percentage: 12.8 },
              { resolution: '2560x1440', percentage: 8.9 }
            ]
          },
          realtime: {
            currentVisitors: 18,
            activePages: [
              { path: '/', visitors: 7 },
              { path: '/admin', visitors: 5 },
              { path: '/yt-panel', visitors: 3 },
              { path: '/about', visitors: 2 },
              { path: '/contact', visitors: 1 }
            ],
            recentActivity: [
              { time: '2 min ago', action: 'User visited /admin', location: 'Paris' },
              { time: '3 min ago', action: 'User visited /yt-panel', location: 'Lyon' },
              { time: '4 min ago', action: 'User visited /', location: 'Marseille' },
              { time: '5 min ago', action: 'User visited /about', location: 'Toulouse' },
              { time: '6 min ago', action: 'User visited /contact', location: 'Nice' }
            ]
          }
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <motion.div 
        className="analytics-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Analytics Dashboard</h1>
        <p>Real-time insights into your application's performance and user behavior</p>
      </motion.div>

      {/* Traffic Overview */}
      <motion.div 
        className="analytics-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2><FiTrendingUp /> Traffic Overview</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <FiEye />
            </div>
            <div className="metric-content">
              <h3>Total Views</h3>
              <p className="metric-value">{analyticsData.traffic.totalViews.toLocaleString()}</p>
              <span className="metric-growth positive">+{analyticsData.traffic.growth}%</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <FiUsers />
            </div>
            <div className="metric-content">
              <h3>Unique Visitors</h3>
              <p className="metric-value">{analyticsData.traffic.uniqueVisitors.toLocaleString()}</p>
              <span className="metric-growth positive">+8.2%</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <FiGlobe />
            </div>
            <div className="metric-content">
              <h3>Today's Views</h3>
              <p className="metric-value">{analyticsData.traffic.todayViews}</p>
              <span className="metric-growth positive">+15.3%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Geographic Data */}
      <motion.div 
        className="analytics-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2><FiMapPin /> Geographic Distribution</h2>
        <div className="geography-grid">
          <div className="geography-card">
            <h3>Top Countries</h3>
            <div className="country-list">
              {analyticsData.geography.countries.map((country, index) => (
                <div key={index} className="country-item">
                  <span className="country-name">{country.name}</span>
                  <span className="country-visitors">{country.visitors.toLocaleString()}</span>
                  <span className="country-percentage">{country.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="geography-card">
            <h3>Top Cities</h3>
            <div className="city-list">
              {analyticsData.geography.cities.map((city, index) => (
                <div key={index} className="city-item">
                  <span className="city-name">{city.name}</span>
                  <span className="city-visitors">{city.visitors.toLocaleString()}</span>
                  <span className="city-percentage">{city.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Behavior */}
      <motion.div 
        className="analytics-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2><FiUsers /> User Behavior</h2>
        <div className="behavior-grid">
          <div className="behavior-card">
            <h3>Top Pages</h3>
            <div className="page-list">
              {analyticsData.behavior.topPages.map((page, index) => (
                <div key={index} className="page-item">
                  <span className="page-path">{page.path}</span>
                  <span className="page-views">{page.views.toLocaleString()}</span>
                  <span className="page-percentage">{page.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="behavior-card">
            <h3>Entry Pages</h3>
            <div className="page-list">
              {analyticsData.behavior.entryPages.map((page, index) => (
                <div key={index} className="page-item">
                  <span className="page-path">{page.path}</span>
                  <span className="page-entries">{page.entries.toLocaleString()}</span>
                  <span className="page-percentage">{page.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Technical Insights */}
      <motion.div 
        className="analytics-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2><FiMonitor /> Technical Insights</h2>
        <div className="technical-grid">
          <div className="technical-card">
            <h3>Device Distribution</h3>
            <div className="device-chart">
              <div className="device-item">
                <span className="device-name">Desktop</span>
                <div className="device-bar">
                  <div className="device-fill" style={{ width: `${analyticsData.technical.devices.desktop}%` }}></div>
                </div>
                <span className="device-percentage">{analyticsData.technical.devices.desktop}%</span>
              </div>
              <div className="device-item">
                <span className="device-name">Mobile</span>
                <div className="device-bar">
                  <div className="device-fill" style={{ width: `${analyticsData.technical.devices.mobile}%` }}></div>
                </div>
                <span className="device-percentage">{analyticsData.technical.devices.mobile}%</span>
              </div>
              <div className="device-item">
                <span className="device-name">Tablet</span>
                <div className="device-bar">
                  <div className="device-fill" style={{ width: `${analyticsData.technical.devices.tablet}%` }}></div>
                </div>
                <span className="device-percentage">{analyticsData.technical.devices.tablet}%</span>
              </div>
            </div>
          </div>
          <div className="technical-card">
            <h3>Browser Usage</h3>
            <div className="browser-list">
              {Object.entries(analyticsData.technical.browsers).map(([browser, percentage]) => (
                <div key={browser} className="browser-item">
                  <span className="browser-name">{browser}</span>
                  <div className="browser-bar">
                    <div className="browser-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="browser-percentage">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Data */}
      <motion.div 
        className="analytics-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2><FiGlobe /> Real-time Activity</h2>
        <div className="realtime-grid">
          <div className="realtime-card">
            <h3>Current Visitors</h3>
            <div className="current-visitors">
              <span className="visitor-count">{analyticsData.realtime.currentVisitors}</span>
              <span className="visitor-label">active now</span>
            </div>
            <div className="active-pages">
              <h4>Active Pages</h4>
              {analyticsData.realtime.activePages.map((page, index) => (
                <div key={index} className="active-page-item">
                  <span className="page-path">{page.path}</span>
                  <span className="page-visitors">{page.visitors} visitors</span>
                </div>
              ))}
            </div>
          </div>
          <div className="realtime-card">
            <h3>Recent Activity</h3>
            <div className="recent-activity">
              {analyticsData.realtime.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-time">{activity.time}</span>
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-location">{activity.location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
