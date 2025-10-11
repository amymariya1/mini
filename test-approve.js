async function testApproveTherapist() {
  try {
    // Login as admin
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
    });

    if (loginResponse.status !== 200) {
      console.log('Login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Get pending therapists
    const pendingResponse = await fetch('http://localhost:5000/api/admin/therapists/pending', {
      method: 'GET',
      headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
    });

    if (pendingResponse.status !== 200) {
      console.log('Failed to get pending therapists');
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log('Initial pending therapists:', pendingData.therapists.length);
    
    if (!pendingData.therapists || pendingData.therapists.length === 0) {
      console.log('No pending therapists found');
      return;
    }
    
    const therapistId = pendingData.therapists[0]._id;
    console.log('Approving therapist:', therapistId);
    
    // Approve the therapist
    const approveResponse = await fetch(`http://localhost:5000/api/admin/therapists/${therapistId}/approve`, {
      method: 'PATCH',
      headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
    });

    console.log('Approve response status:', approveResponse.status);
    if (approveResponse.status === 200) {
      const approveData = await approveResponse.json();
      console.log('Success:', approveData.message);
    } else {
      const errorText = await approveResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    // Verify the therapist is no longer in pending list
    console.log('Verifying approval...');
    const verifyResponse = await fetch('http://localhost:5000/api/admin/therapists/pending', {
      method: 'GET',
      headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
    });

    if (verifyResponse.status === 200) {
      const verifyData = await verifyResponse.json();
      const approvedTherapist = verifyData.therapists.find(t => t._id === therapistId);
      if (approvedTherapist) {
        console.log('Therapist still appears in pending list (unexpected)');
      } else {
        console.log('Therapist successfully removed from pending list');
      }
      console.log('Remaining pending therapists:', verifyData.therapists.length);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testApproveTherapist();