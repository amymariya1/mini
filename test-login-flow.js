const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLoginFlow() {
  console.log('Testing login flow for existing users and admins...\n');
  
  // Test existing user login (we don't know the password, so this will likely fail)
  console.log('1. Testing existing user login (user1@gmail.com):');
  try {
    const userResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user1@gmail.com',
        password: 'unknownpassword'
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
  
  // Test existing admin login (we don't know the password, so this will likely fail)
  console.log('2. Testing existing admin login (amymariya4@gmail.com):');
  try {
    const adminResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'amymariya4@gmail.com',
        password: 'unknownpassword'
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
  
  // Test with the known admin user
  console.log('3. Testing known admin login (admin@example.com):');
  try {
    const knownAdminResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@123'
      }),
    });

    console.log('Known Admin Status:', knownAdminResponse.status);
    console.log('Known Admin Status Text:', knownAdminResponse.statusText);
    
    const knownAdminContentType = knownAdminResponse.headers.get('content-type');
    if (knownAdminContentType && knownAdminContentType.includes('application/json')) {
      const knownAdminData = await knownAdminResponse.json();
      console.log('Known Admin Response Data:', JSON.stringify(knownAdminData, null, 2));
    } else {
      const knownAdminText = await knownAdminResponse.text();
      console.log('Known Admin Response Text:', knownAdminText);
    }
  } catch (error) {
    console.error('Known Admin Login Error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Let's also try to create a new user and test with known credentials
  console.log('4. Creating and testing a new user:');
  try {
    // First register a new user
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser456@gmail.com',
        password: 'TestPass123!',
        age: 25
      }),
    });

    console.log('Registration Status:', registerResponse.status);
    console.log('Registration Status Text:', registerResponse.statusText);
    
    const registerContentType = registerResponse.headers.get('content-type');
    if (registerContentType && registerContentType.includes('application/json')) {
      const registerData = await registerResponse.json();
      console.log('Registration Response Data:', JSON.stringify(registerData, null, 2));
    } else {
      const registerText = await registerResponse.text();
      console.log('Registration Response Text:', registerText);
    }
    
    // Now try to login with the same credentials
    if (registerResponse.status === 200 || registerResponse.status === 201) {
      console.log('\nTrying to login with newly created user...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser456@gmail.com',
          password: 'TestPass123!'
        }),
      });

      console.log('New User Login Status:', loginResponse.status);
      console.log('New User Login Status Text:', loginResponse.statusText);
      
      const loginContentType = loginResponse.headers.get('content-type');
      if (loginContentType && loginContentType.includes('application/json')) {
        const loginData = await loginResponse.json();
        console.log('New User Login Response Data:', JSON.stringify(loginData, null, 2));
      } else {
        const loginText = await loginResponse.text();
        console.log('New User Login Response Text:', loginText);
      }
    }
  } catch (error) {
    console.error('New User Flow Error:', error);
  }
}

testLoginFlow();