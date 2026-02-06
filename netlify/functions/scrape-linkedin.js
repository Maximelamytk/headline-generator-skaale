// Netlify Function: Scrape LinkedIn Profile via Scrapin.io

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { linkedinUrl } = JSON.parse(event.body);

    if (!linkedinUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'LinkedIn URL is required' })
      };
    }

    // Validate LinkedIn URL format
    const urlPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    if (!urlPattern.test(linkedinUrl)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid LinkedIn URL format' })
      };
    }

    const SCRAPIN_API_KEY = process.env.SCRAPIN_API_KEY;

    if (!SCRAPIN_API_KEY) {
      console.error('SCRAPIN_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API not configured' })
      };
    }

    // Call Scrapin.io API (v1 endpoint with linkedInUrl parameter)
    const endpoint = `https://api.scrapin.io/v1/enrichment/profile?apikey=${SCRAPIN_API_KEY}&linkedInUrl=${encodeURIComponent(linkedinUrl)}`;

    console.log('Calling Scrapin API for:', linkedinUrl);

    const response = await fetch(endpoint);
    const responseText = await response.text();

    console.log('Scrapin response status:', response.status);
    console.log('Scrapin response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Scrapin response:', responseText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Invalid response from Scrapin API' })
      };
    }

    if (!response.ok) {
      console.error('Scrapin API error:', response.status, data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data.message || data.error || 'Failed to fetch profile',
          code: response.status
        })
      };
    }

    if (!data.success || !data.person) {
      console.error('Scrapin returned no person:', data);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Profile not found', details: data })
      };
    }

    // Return the profile data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Scrape function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
