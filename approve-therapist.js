async function approveTherapist() {
  try {
    console.log('Logging in as admin...');
    
    // Login as admin
    const loginResponse = await fetch('http://localhost:5002/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@example.com', 
        password: 'admin123' 
      }),
    });

    if (loginResponse.status !== 200) {
      console.log('Admin login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Admin logged in successfully');
    
    // Get pending therapists
    console.log('Fetching pending therapists...');
    const pendingResponse = await fetch('http://localhost:5002/api/admin/therapists/pending', {
      method: 'GET',
      headers: { 
        'x-admin-token': token, 
        'Content-Type': 'application/json' 
      },
    });

    if (pendingResponse.status !== 200) {
      console.log('Failed to get pending therapists');
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log('Found', pendingData.therapists.length, 'pending therapists');
    
    if (!pendingData.therapists || pendingData.therapists.length === 0) {
      console.log('No pending therapists found');
      return;
    }
    
    // Approve the first therapist
    const therapistId = pendingData.therapists[0]._id;
    console.log('Approving therapist:', therapistId);
    
    const approveResponse = await fetch(`http://localhost:5002/api/admin/therapists/${therapistId}/approve`, {
      method: 'PATCH',
      headers: { 
        'x-admin-token': token, 
        'Content-Type': 'application/json' 
      },
    });

    if (approveResponse.status === 200) {
      const approveData = await approveResponse.json();
      console.log('✅ Success:', approveData.message);
    } else {
      const errorText = await approveResponse.text();
      console.log('❌ Error:', errorText);
      return;
    }
    
    console.log('✅ Therapist approved successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

approveTherapist();