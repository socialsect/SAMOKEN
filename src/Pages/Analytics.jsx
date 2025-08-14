import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiMapPin, 
  FiGlobe, 
  FiMonitor, 
  FiTrendingUp,
  FiEye,
  FiArrowLeft,
  FiRefreshCw
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import '../Styles/Analytics.css';
import { analyticsService } from '../utils/analyticsService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Analytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState({
    traffic: {
      totalViews: 0,
      uniqueVisitors: 0,
      todayViews: 0,
      growth: 0,
      weeklyData: [],
      monthlyData: []
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await analyticsService.getAllAnalyticsData();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Fallback to mock data if real data fails
        const mockData = await analyticsService.getAllAnalyticsData();
        setAnalyticsData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshKey]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  // Chart configurations
  const weeklyTrafficData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Page Views',
        data: analyticsData.traffic.weeklyData,
        borderColor: '#e7222a',
        backgroundColor: 'rgba(231, 34, 42, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#e7222a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const monthlyTrafficData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Views',
        data: analyticsData.traffic.monthlyData,
        backgroundColor: 'rgba(0, 204, 255, 0.8)',
        borderColor: '#00ccff',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const deviceData = {
    labels: Object.keys(analyticsData.technical.devices).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [
      {
        data: Object.values(analyticsData.technical.devices),
        backgroundColor: [
          '#e7222a',
          '#00ccff',
          '#ffd700'
        ],
        borderColor: [
          '#ba1e1e',
          '#0099cc',
          '#e6c200'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const browserData = {
    labels: Object.keys(analyticsData.technical.browsers).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [
      {
        label: 'Browser Usage (%)',
        data: Object.values(analyticsData.technical.browsers),
        backgroundColor: [
          '#e7222a',
          '#00ccff',
          '#ffd700',
          '#00ff88'
        ],
        borderColor: [
          '#ba1e1e',
          '#0099cc',
          '#e6c200',
          '#00cc6a'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: '600',
            family: 'Avenir, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 31, 31, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e7222a',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: 'GoodTimes, sans-serif',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Avenir, sans-serif',
          size: 12
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
          font: {
            size: 11,
            family: 'Avenir, sans-serif'
          }
        },
        grid: {
          color: 'rgba(231, 34, 42, 0.2)'
        }
      },
      y: {
        ticks: {
          color: '#ffffff',
          font: {
            size: 11,
            family: 'Avenir, sans-serif'
          }
        },
        grid: {
          color: 'rgba(231, 34, 42, 0.2)'
        }
      }
    }
  };

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
    <div className="analytics-page">
      {/* Header */}
      <motion.div 
        className="analytics-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-left">
          <button onClick={handleBackToAdmin} className="btn-back">
            <FiArrowLeft /> Back to Admin
          </button>
          <h1>Analytics Dashboard</h1>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="btn-refresh">
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="metrics-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
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
          <div className="metric-card">
            <div className="metric-icon">
              <FiTrendingUp />
            </div>
            <div className="metric-content">
              <h3>Avg Session</h3>
              <p className="metric-value">{analyticsData.behavior.avgSessionDuration}m</p>
              <span className="metric-growth positive">+5.1%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="charts-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="charts-grid">
          {/* Weekly Traffic Chart */}
          <div className="chart-card">
            <h3>Weekly Traffic</h3>
            <div className="chart-container">
              <Line data={weeklyTrafficData} options={chartOptions} />
            </div>
          </div>

          {/* Monthly Traffic Chart */}
          <div className="chart-card">
            <h3>Monthly Growth</h3>
            <div className="chart-container">
              <Bar data={monthlyTrafficData} options={chartOptions} />
            </div>
          </div>

          {/* Device Distribution */}
          <div className="chart-card">
            <h3>Device Distribution</h3>
            <div className="chart-container">
              <Doughnut 
                data={deviceData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#ffffff',
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          family: 'Avenir, sans-serif',
                          size: 12,
                          weight: '600'
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Browser Usage */}
          <div className="chart-card">
            <h3>Browser Usage</h3>
            <div className="chart-container">
              <Bar data={browserData} options={chartOptions} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Tables Section */}
      <motion.div 
        className="tables-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="tables-grid">
          {/* Top Pages */}
          <div className="table-card">
            <h3>Top Pages</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Views</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.behavior.topPages.map((page, index) => (
                    <tr key={index}>
                      <td className="page-path">{page.path}</td>
                      <td>{page.views.toLocaleString()}</td>
                      <td className="percentage">{page.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Geographic Data */}
          <div className="table-card">
            <h3>Top Countries</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Visitors</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.geography.countries.map((country, index) => (
                    <tr key={index}>
                      <td>{country.name}</td>
                      <td>{country.visitors.toLocaleString()}</td>
                      <td className="percentage">{country.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Section */}
      <motion.div 
        className="realtime-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
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
