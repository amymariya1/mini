async function testTherapistRegistration() {
  try {
    // Register a therapist
    const registerResponse = await fetch('http://localhost:5000/api/auth/register-therapist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Therapist',
        email: 'test@example.com',
        password: 'Test123!',
        age: 30,
        license: 'LIC123456'
      }),
    });

    console.log('Register response status:', registerResponse.status);
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    // Try to login (should fail because not approved)
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!',
      }),
    });

    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
  } catch (error) {
    console.error('Error:', error);
  }
}

testTherapistRegistration();