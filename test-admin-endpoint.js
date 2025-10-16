const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAdminLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'  // Using the correct password
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response Data:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Response Text:', text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminLogin();