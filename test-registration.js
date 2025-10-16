const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRegistration() {
  try {
    console.log('Testing user registration...');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@gmail.com',
        password: 'Test1234!',
        age: 25
      }),
    });

    console.log('Registration Status:', response.status);
    console.log('Registration Status Text:', response.statusText);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Registration Response Data:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Registration Response Text:', text);
    }
    
    // Now test login with the same credentials
    console.log('\nTesting login with newly registered user...');
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@gmail.com',
        password: 'Test1234!'
      }),
    });

    console.log('Login Status:', loginResponse.status);
    console.log('Login Status Text:', loginResponse.statusText);
    
    const loginContentType = loginResponse.headers.get('content-type');
    if (loginContentType && loginContentType.includes('application/json')) {
      const loginData = await loginResponse.json();
      console.log('Login Response Data:', JSON.stringify(loginData, null, 2));
    } else {
      const loginText = await loginResponse.text();
      console.log('Login Response Text:', loginText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration();