async function testTherapistRegistration() {
  try {
    console.log('Testing therapist registration endpoint...');
    
    const response = await fetch('http://localhost:5002/api/auth/register-therapist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Therapist 3',
        email: 'test3.therapist@example.com',
        password: 'TestPass123!',
        age: 40,
        license: 'LIC345678'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (data.success) {
      console.log('✅ Therapist registration test passed!');
    } else {
      console.log('❌ Therapist registration test failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error testing therapist registration:', error.message);
  }
}

testTherapistRegistration();