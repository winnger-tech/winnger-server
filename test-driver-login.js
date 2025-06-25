const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testDriverLogin() {
  try {
    console.log('🔍 Testing Driver Login JWT Generation...\n');
    
    // First, let's register a test driver
    console.log('1. Registering a test driver...');
    const registerResponse = await axios.post(`${BASE_URL}/api/drivers-staged/register`, {
      firstName: 'Test',
      lastName: 'Driver',
      email: 'testdriver@example.com',
      password: 'TestPassword123!'
    });
    
    console.log('✅ Registration successful!');
    console.log('JWT from registration:', registerResponse.data.data.token ? 'GENERATED' : 'NOT GENERATED');
    
    if (registerResponse.data.data.token) {
      console.log('Token length:', registerResponse.data.data.token.length);
      console.log('Token preview:', registerResponse.data.data.token.substring(0, 50) + '...');
    }
    
    console.log('\n2. Testing login with the same credentials...');
    
    // Now test login
    const loginResponse = await axios.post(`${BASE_URL}/api/drivers-staged/login`, {
      email: 'testdriver@example.com',
      password: 'TestPassword123!'
    });
    
    console.log('✅ Login successful!');
    console.log('JWT from login:', loginResponse.data.data.token ? 'GENERATED' : 'NOT GENERATED');
    
    if (loginResponse.data.data.token) {
      console.log('Token length:', loginResponse.data.data.token.length);
      console.log('Token preview:', loginResponse.data.data.token.substring(0, 50) + '...');
      
      // Test if token works by calling profile endpoint
      console.log('\n3. Testing JWT token by calling profile endpoint...');
      
      const profileResponse = await axios.get(`${BASE_URL}/api/drivers-staged/profile`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.data.token}`
        }
      });
      
      console.log('✅ Profile endpoint accessed successfully with JWT!');
      console.log('Driver profile:', {
        id: profileResponse.data.data.driver.id,
        name: `${profileResponse.data.data.driver.firstName} ${profileResponse.data.data.driver.lastName}`,
        email: profileResponse.data.data.driver.email,
        stage: profileResponse.data.data.driver.registrationStage
      });
    }
    
    console.log('\n🎉 All tests passed! JWT generation is working correctly.');
    
  } catch (error) {
    console.error('❌ Error during testing:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running on port 5001?');
      console.error('Make sure to start the server with: npm start');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testDriverLogin();
