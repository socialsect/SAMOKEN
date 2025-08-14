// Analytics Service for Vercel Analytics Integration
// Uses a proxy API route to avoid CORS issues

const VERCEL_PROJECT_ID = import.meta.env.VITE_VERCEL_PROJECT_ID || '';
const VERCEL_ANALYTICS_TOKEN = import.meta.env.VITE_VERCEL_ANALYTICS_TOKEN || '';

class AnalyticsService {
  constructor() {
    this.projectId = VERCEL_PROJECT_ID;
    this.token = VERCEL_ANALYTICS_TOKEN;
    
    if (!this.projectId || !this.token) {
      console.warn('Vercel Analytics credentials not configured. Using mock data.');
      console.log('Project ID:', this.projectId ? 'Set' : 'Missing');
      console.log('Token:', this.token ? 'Set' : 'Missing');
    } else {
      console.log('Analytics Service initialized with credentials');
    }
  }

  // Helper method to make authenticated requests
  async makeRequest(endpoint, params = {}) {
    if (!this.projectId || !this.token) {
      console.log('Using mock data - credentials not configured');
      return null;
    }

    // Check if we're in production (deployed to Vercel)
    const isProduction = window.location.hostname !== 'localhost';
    
    if (!isProduction) {
      // In development, use mock data due to CORS
      console.log(`Would make request to: ${endpoint}`, params);
      console.log('Using mock data in development due to CORS restrictions');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return null; // This will trigger mock data fallback
    }

    // In production, use the proxy API
    try {
      const proxyUrl = new URL('/api/analytics', window.location.origin);
      proxyUrl.searchParams.append('endpoint', endpoint);
      proxyUrl.searchParams.append('projectId', this.projectId);
      
      // Add other params
      Object.keys(params).forEach(key => {
        if (key !== 'projectId') { // Don't duplicate projectId
          proxyUrl.searchParams.append(key, params[key]);
        }
      });

      console.log(`Making proxy request to: ${proxyUrl.toString()}`);

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Proxy Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Analytics proxy error: ${response.status} - ${errorText}`);
        throw new Error(`Analytics proxy error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Proxy Response data:`, data);
      return data;
    } catch (error) {
      console.error('Analytics proxy request failed:', error);
      return null;
    }
  }

  // Get page views data
  async getPageViews(timeframe = '7d') {
    const data = await this.makeRequest('/pageviews', {
      projectId: this.projectId,
      timeframe,
    });

    if (!data) {
      return this.getMockPageViews();
    }

    return {
      totalViews: data.total || 0,
      uniqueVisitors: data.unique || 0,
      todayViews: data.today || 0,
      growth: data.growth || 0,
      weeklyData: data.weekly || [],
      monthlyData: data.monthly || []
    };
  }

  // Get geographic data
  async getGeographicData(timeframe = '30d') {
    const data = await this.makeRequest('/geography', {
      projectId: this.projectId,
      timeframe,
    });

    if (!data) {
      return this.getMockGeographicData();
    }

    return {
      countries: data.countries || [],
      cities: data.cities || [],
      topLocation: data.topLocation || ''
    };
  }

  // Get top pages
  async getTopPages(timeframe = '30d') {
    const data = await this.makeRequest('/pages', {
      projectId: this.projectId,
      timeframe,
    });

    if (!data) {
      return this.getMockTopPages();
    }

    return data.pages || [];
  }

  // Get device and browser data
  async getTechnicalData(timeframe = '30d') {
    const [devices, browsers, os] = await Promise.all([
      this.makeRequest('/devices', { projectId: this.projectId, timeframe }),
      this.makeRequest('/browsers', { projectId: this.projectId, timeframe }),
      this.makeRequest('/os', { projectId: this.projectId, timeframe })
    ]);

    if (!devices && !browsers && !os) {
      return this.getMockTechnicalData();
    }

    return {
      devices: devices?.devices || {},
      browsers: browsers?.browsers || {},
      os: os?.os || {},
      screenResolutions: []
    };
  }

  // Get real-time data
  async getRealtimeData() {
    const data = await this.makeRequest('/realtime', {
      projectId: this.projectId,
    });

    if (!data) {
      return this.getMockRealtimeData();
    }

    return {
      currentVisitors: data.current || 0,
      activePages: data.pages || [],
      recentActivity: data.activity || []
    };
  }

  // Mock data fallbacks
  getMockPageViews() {
    return {
      totalViews: 15420,
      uniqueVisitors: 3247,
      todayViews: 156,
      growth: 12.5,
      weeklyData: [120, 145, 189, 234, 267, 298, 156],
      monthlyData: [2340, 2890, 3120, 3450, 3780, 4120, 4450, 4780, 5120, 5450, 5780, 15420]
    };
  }

  getMockGeographicData() {
    return {
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
    };
  }

  getMockTopPages() {
    return [
      { path: '/', views: 4567, percentage: 29.6 },
      { path: '/admin', views: 2341, percentage: 15.2 },
      { path: '/yt-panel', views: 1890, percentage: 12.3 },
      { path: '/about', views: 1234, percentage: 8.0 },
      { path: '/contact', views: 987, percentage: 6.4 }
    ];
  }

  getMockTechnicalData() {
    return {
      devices: {
        desktop: 67.3,
        mobile: 28.4,
        tablet: 4.3
      },
      browsers: {
        chrome: 58.7,
        safari: 23.4,
        firefox: 12.1,
        edge: 5.8
      },
      os: {
        windows: 45.2,
        macOS: 28.7,
        iOS: 18.9,
        android: 7.2
      },
      screenResolutions: [
        { resolution: '1920x1080', percentage: 23.4 },
        { resolution: '1366x768', percentage: 18.7 },
        { resolution: '1440x900', percentage: 15.2 },
        { resolution: '1536x864', percentage: 12.8 },
        { resolution: '2560x1440', percentage: 8.9 }
      ]
    };
  }

  getMockRealtimeData() {
    return {
      currentVisitors: 23,
      activePages: [
        { path: '/', visitors: 12 },
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
    };
  }

  // Get all analytics data
  async getAllAnalyticsData() {
    try {
      const [traffic, geography, topPages, technical, realtime] = await Promise.all([
        this.getPageViews(),
        this.getGeographicData(),
        this.getTopPages(),
        this.getTechnicalData(),
        this.getRealtimeData()
      ]);

      return {
        traffic,
        geography,
        behavior: {
          topPages,
          entryPages: topPages.slice(0, 5), // Using top pages as entry pages for now
          exitPages: topPages.slice(0, 5), // Using top pages as exit pages for now
          avgSessionDuration: 4.2
        },
        technical,
        realtime
      };
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      // Return mock data as fallback
      return {
        traffic: this.getMockPageViews(),
        geography: this.getMockGeographicData(),
        behavior: {
          topPages: this.getMockTopPages(),
          entryPages: this.getMockTopPages().slice(0, 5),
          exitPages: this.getMockTopPages().slice(0, 5),
          avgSessionDuration: 4.2
        },
        technical: this.getMockTechnicalData(),
        realtime: this.getMockRealtimeData()
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
