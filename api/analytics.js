// Vercel serverless function to proxy analytics API requests
// This will work when deployed to Vercel

const VERCEL_ANALYTICS_API_BASE = 'https://vercel.com/api/v1/web/analytics';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, projectId, timeframe = '30d' } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!endpoint || !projectId || !token) {
    return res.status(400).json({ 
      error: 'Missing required parameters: endpoint, projectId, or token' 
    });
  }

  try {
    const url = new URL(`${VERCEL_ANALYTICS_API_BASE}${endpoint}`);
    url.searchParams.append('projectId', projectId);
    if (timeframe) {
      url.searchParams.append('timeframe', timeframe);
    }

    console.log(`Proxying request to: ${url.toString()}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vercel API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `Vercel API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log(`Successfully fetched data for ${endpoint}`);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Analytics proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
