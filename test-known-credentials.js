const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testKnownCredentials() {
  console.log('Testing login with known credentials...\n');
  
  // Test the newly created user
  console.log('1. Testing newly created user:');
  try {
    const userResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@gmail.com',
        password: 'Test1234!'
      }),
    });

    console.log('User Status:', userResponse.status);
    console.log('User Status Text:', userResponse.statusText);
    
    const userContentType = userResponse.headers.get('content-type');
    if (userContentType && userContentType.includes('application/json')) {
      const userData = await userResponse.json();
      console.log('User Response Data:', JSON.stringify(userData, null, 2));
    } else {
      const userText = await userResponse.text();
      console.log('User Response Text:', userText);
    }
  } catch (error) {
    console.error('User Login Error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test admin with correct password
  console.log('2. Testing admin with correct password:');
  try {
    const adminResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@123'  // Correct password from createAdmin.js
      }),
    });

    console.log('Admin Status:', adminResponse.status);
    console.log('Admin Status Text:', adminResponse.statusText);
    
    const adminContentType = adminResponse.headers.get('content-type');
    if (adminContentType && adminContentType.includes('application/json')) {
      const adminData = await adminResponse.json();
      console.log('Admin Response Data:', JSON.stringify(adminData, null, 2));
    } else {
      const adminText = await adminResponse.text();
      console.log('Admin Response Text:', adminText);
    }
  } catch (error) {
    console.error('Admin Login Error:', error);
  }
}

testKnownCredentials();