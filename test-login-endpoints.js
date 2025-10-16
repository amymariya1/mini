const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLogins() {
  console.log('Testing login endpoints...\n');
  
  // Test admin login
  console.log('1. Testing admin login:');
  try {
    const adminResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
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
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test user login
  console.log('2. Testing user login:');
  try {
    const userResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user1@gmail.com',
        password: 'Test1234!'  // This might be incorrect
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
  
  // Test therapist login
  console.log('3. Testing therapist login:');
  try {
    const therapistResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'therapist2@gmail.com',
        password: 'Test1234!'  // This might be incorrect
      }),
    });

    console.log('Therapist Status:', therapistResponse.status);
    console.log('Therapist Status Text:', therapistResponse.statusText);
    
    const therapistContentType = therapistResponse.headers.get('content-type');
    if (therapistContentType && therapistContentType.includes('application/json')) {
      const therapistData = await therapistResponse.json();
      console.log('Therapist Response Data:', JSON.stringify(therapistData, null, 2));
    } else {
      const therapistText = await therapistResponse.text();
      console.log('Therapist Response Text:', therapistText);
    }
  } catch (error) {
    console.error('Therapist Login Error:', error);
  }
}

testLogins();