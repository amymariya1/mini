const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPasswordResetFlow() {
  console.log('Testing password reset flow...\n');
  
  // Test password reset for existing user
  console.log('1. Requesting password reset for user1@gmail.com:');
  try {
    const resetResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user1@gmail.com'
      }),
    });

    console.log('Reset Request Status:', resetResponse.status);
    console.log('Reset Request Status Text:', resetResponse.statusText);
    
    const resetContentType = resetResponse.headers.get('content-type');
    if (resetContentType && resetContentType.includes('application/json')) {
      const resetData = await resetResponse.json();
      console.log('Reset Request Response Data:', JSON.stringify(resetData, null, 2));
    } else {
      const resetText = await resetResponse.text();
      console.log('Reset Request Response Text:', resetText);
    }
  } catch (error) {
    console.error('Password Reset Error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test password reset for existing admin
  console.log('2. Requesting password reset for amymariya4@gmail.com:');
  try {
    const adminResetResponse = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'amymariya4@gmail.com'
      }),
    });

    console.log('Admin Reset Request Status:', adminResetResponse.status);
    console.log('Admin Reset Request Status Text:', adminResetResponse.statusText);
    
    const adminResetContentType = adminResetResponse.headers.get('content-type');
    if (adminResetContentType && adminResetContentType.includes('application/json')) {
      const adminResetData = await adminResetResponse.json();
      console.log('Admin Reset Request Response Data:', JSON.stringify(adminResetData, null, 2));
    } else {
      const adminResetText = await adminResetResponse.text();
      console.log('Admin Reset Request Response Text:', adminResetText);
    }
  } catch (error) {
    console.error('Admin Password Reset Error:', error);
  }
}

testPasswordResetFlow();