
import { trackPageView } from './tracking';

// Helper function to get CORS headers
export function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

// Create an API endpoint handler for the tracking script
export const handleTrackingRequest = async (request: Request) => {
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  try {
    console.log('Received tracking request');
    
    // For debugging, log the headers
    console.log('Request method:', request.method);
    
    // Parse the request body
    let data;
    try {
      data = await request.json();
      console.log('Received tracking data:', data);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // Validate the data
    if (!data || !data.siteId || !data.url) {
      console.error('Invalid tracking data:', data);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // Track the page view
    const result = await trackPageView(data);
    console.log('Tracking result:', result);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('Error handling tracking request:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server error processing request',
      errorDetails: String(error)
    }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
};
