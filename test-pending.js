async function testPendingTherapists() {
  try {
    console.log('Testing admin login...');
    
    // Login as admin to get a valid token
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });

    console.log('Admin login response status:', loginResponse.status);
    if (loginResponse.status !== 200) {
      const errorText = await loginResponse.text();
      console.log('Login error response:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Admin login successful');
    
    if (!loginData.token) {
      console.log('Failed to get admin token');
      return;
    }
    
    const token = loginData.token;
    console.log('Using token:', token);
    
    // Get pending therapists with the valid token
    const pendingResponse = await fetch('http://localhost:5000/api/admin/therapists/pending', {
      method: 'GET',
      headers: {
        'x-admin-token': token,
        'Content-Type': 'application/json',
      },
    });

    console.log('Pending therapists response status:', pendingResponse.status);
    if (pendingResponse.status !== 200) {
      const errorText = await pendingResponse.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log('Pending therapists response:', pendingData);
  } catch (error) {
    console.error('Error:', error);
  }
}

testPendingTherapists();