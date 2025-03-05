
// Store mock data in localStorage to ensure it persists between refreshes
const MOCK_DATA_KEY = 'claro_mock_analytics_data';

// Get mock data from localStorage or generate if not exists
export function getMockData() {
  try {
    const storedData = localStorage.getItem(MOCK_DATA_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (e) {
    console.error('Error parsing stored mock data:', e);
  }
  
  // Generate initial mock data if none exists
  const initialData = generateInitialMockData();
  localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(initialData));
  return initialData;
}

// Generate initial mock data for first time use
function generateInitialMockData() {
  const count = 5; // Start with a small fixed number of entries
  const mockData = [];
  
  const paths = ['/home', '/about', '/pricing', '/blog', '/contact'];
  const referrers = ['https://google.com', 'https://twitter.com', 'direct', ''];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  ];
  
  // Generate entries for the last 30 days with consistent dates
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(i * 3) % 30; // Spread them out over 30 days
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    mockData.push({
      id: `mock-${i}`,
      site_id: 'demo-site',
      url: paths[i % paths.length],
      referrer: referrers[i % referrers.length],
      user_agent: userAgents[i % userAgents.length],
      screen_width: [1920, 1440, 1366, 375, 414][i % 5],
      screen_height: [1080, 900, 768, 812, 896][i % 5],
      timestamp: date.toISOString(),
      created_at: date.toISOString(),
      event_type: 'page_view'
    });
  }
  
  return mockData;
}

// Check for duplicate tracking
export function isDuplicate(data: any): boolean {
  // If this is an explicit ping, never consider it a duplicate
  if (data.isPing || data.eventType === 'session_ping') {
    return false;
  }
  
  // Don't check for duplicates in development mode
  const isMissingCredentials = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (isMissingCredentials) {
    return false;
  }
  
  // Check the last few records to see if this is a duplicate
  const mockData = getMockData();
  const lastFewRecords = mockData.slice(-5);
  
  // Look for matching URL and timestamps within 60 seconds
  const now = new Date(data.timestamp || new Date().toISOString());
  const duplicates = lastFewRecords.filter(record => {
    const recordTime = new Date(record.timestamp || record.created_at);
    const timeDiff = Math.abs(now.getTime() - recordTime.getTime());
    
    // If URL matches and time difference is less than 60 seconds
    const sameUrl = record.url === data.url;
    const withinTimeWindow = timeDiff < 60000; // 60 seconds
    
    return sameUrl && withinTimeWindow;
  });
  
  return duplicates.length > 0;
}
