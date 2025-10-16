// Test script to check if the server endpoint is accessible
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function testServerEndpoint() {
  try {
    console.log('=== Testing Server Endpoint Accessibility ===');
    console.log(`Base URL: ${baseURL}`);
    
    const url = `${baseURL}/auth/forgot-password-auto`;
    console.log(`Testing endpoint: ${url}`);
    
    // Test OPTIONS request (preflight)
    console.log('\n1. Testing OPTIONS request (preflight)...');
    const optionsResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`OPTIONS response status: ${optionsResponse.status}`);
    console.log(`OPTIONS response headers:`, [...optionsResponse.headers.entries()]);
    
    // Test POST request
    console.log('\n2. Testing POST request...');
    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    console.log(`POST response status: ${postResponse.status}`);
    console.log(`POST response status text: ${postResponse.statusText}`);
    
    const contentType = postResponse.headers.get('content-type');
    const isJSON = contentType && contentType.includes('application/json');
    console.log(`POST response content type: ${contentType}`);
    console.log(`POST response is JSON: ${isJSON}`);
    
    if (isJSON) {
      const data = await postResponse.json();
      console.log(`POST response data:`, data);
    } else {
      const text = await postResponse.text();
      console.log(`POST response text:`, text);
    }
    
  } catch (error) {
    console.error('Failed to test server endpoint:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  }
}

testServerEndpoint();