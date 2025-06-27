const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/restaurant-staged';
let authToken = '';

// Test data
const testRestaurant = {
  // Stage 1: Initial registration
  ownerName: 'John Doe',
  email: 'john.doe@restaurant.com',
  password: 'SecurePassword123!',
  
  // Stage 1: Complete basic information
  phone: '+1234567890',
  identificationType: 'licence',
  ownerAddress: '123 Main St, Toronto, ON',
  businessType: 'solo',
  restaurantName: "John's Delicious Food",
  businessEmail: 'info@johnsdelicious.com',
  businessPhone: '+1234567891',
  restaurantAddress: '456 Restaurant Ave, Toronto, ON',
  city: 'Toronto',
  province: 'ON',
  postalCode: 'M5V 3A8',
  
  // Stage 2: Banking information
  bankingInfo: {
    transitNumber: '12345',
    institutionNumber: '123',
    accountNumber: '1234567890'
  },
  HSTNumber: '123456789RT0001',
  
  // Stage 3: Document URLs
  drivingLicenseUrl: 'https://example.com/documents/driving-license.pdf',
  voidChequeUrl: 'https://example.com/documents/void-cheque.pdf',
  HSTdocumentUrl: 'https://example.com/documents/hst-document.pdf',
  foodHandlingCertificateUrl: 'https://example.com/documents/food-handling.pdf',
  articleofIncorporation: 'https://example.com/documents/incorporation.pdf',
  articleofIncorporationExpiryDate: '2025-12-31',
  foodSafetyCertificateExpiryDate: '2025-06-30'
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testRegistration = async () => {
  console.log('\n=== Testing Restaurant Staged Registration ===\n');
  
  try {
    // Step 1: Initial Registration
    console.log('1. Initial Registration...');
    const registerData = {
      ownerName: testRestaurant.ownerName,
      email: testRestaurant.email,
      password: testRestaurant.password
    };
    
    const registerResponse = await makeAuthenticatedRequest('POST', '/register', registerData);
    console.log('✅ Registration successful:', registerResponse.message);
    console.log('Stage:', registerResponse.restaurant.registrationStage);
    console.log('Token received:', !!registerResponse.token);
    
    authToken = registerResponse.token;
    
    // Step 2: Complete Stage 1 - Basic Information
    console.log('\n2. Completing Stage 1 - Basic Information...');
    const stage1Data = {
      phone: testRestaurant.phone,
      identificationType: testRestaurant.identificationType,
      ownerAddress: testRestaurant.ownerAddress,
      businessType: testRestaurant.businessType,
      restaurantName: testRestaurant.restaurantName,
      businessEmail: testRestaurant.businessEmail,
      businessPhone: testRestaurant.businessPhone,
      restaurantAddress: testRestaurant.restaurantAddress,
      city: testRestaurant.city,
      province: testRestaurant.province,
      postalCode: testRestaurant.postalCode
    };
    
    const stage1Response = await makeAuthenticatedRequest('PUT', '/update-stage', stage1Data);
    console.log('✅ Stage 1 completed:', stage1Response.message);
    console.log('Current stage:', stage1Response.restaurant.registrationStage);
    console.log('Next stage info:', stage1Response.nextStage?.title);
    
    // Step 3: Complete Stage 2 - Banking Information
    console.log('\n3. Completing Stage 2 - Banking Information...');
    const stage2Data = {
      bankingInfo: testRestaurant.bankingInfo,
      HSTNumber: testRestaurant.HSTNumber
    };
    
    const stage2Response = await makeAuthenticatedRequest('PUT', '/update-stage', stage2Data);
    console.log('✅ Stage 2 completed:', stage2Response.message);
    console.log('Current stage:', stage2Response.restaurant.registrationStage);
    console.log('Next stage info:', stage2Response.nextStage?.title);
    
    // Step 4: Complete Stage 3 - Document Uploads
    console.log('\n4. Completing Stage 3 - Document Uploads...');
    const stage3Data = {
      drivingLicenseUrl: testRestaurant.drivingLicenseUrl,
      voidChequeUrl: testRestaurant.voidChequeUrl,
      HSTdocumentUrl: testRestaurant.HSTdocumentUrl,
      foodHandlingCertificateUrl: testRestaurant.foodHandlingCertificateUrl,
      articleofIncorporation: testRestaurant.articleofIncorporation,
      articleofIncorporationExpiryDate: testRestaurant.articleofIncorporationExpiryDate,
      foodSafetyCertificateExpiryDate: testRestaurant.foodSafetyCertificateExpiryDate
    };
    
    const stage3Response = await makeAuthenticatedRequest('PUT', '/update-stage', stage3Data);
    console.log('✅ Stage 3 completed:', stage3Response.message);
    console.log('Registration complete:', stage3Response.restaurant.isRegistrationComplete);
    
    // Step 5: Get Dashboard Information
    console.log('\n5. Getting Dashboard Information...');
    const dashboardResponse = await makeAuthenticatedRequest('GET', '/dashboard');
    console.log('✅ Dashboard retrieved');
    console.log('Current stage:', dashboardResponse.currentStage);
    console.log('Progress:', `${dashboardResponse.progress.percentage}%`);
    console.log('Total stages:', dashboardResponse.progress.totalStages);
    console.log('Completed stages:', dashboardResponse.progress.completedStages);
    
    // Step 6: Get Profile Information
    console.log('\n6. Getting Profile Information...');
    const profileResponse = await makeAuthenticatedRequest('GET', '/profile');
    console.log('✅ Profile retrieved');
    console.log('Restaurant name:', profileResponse.restaurant.restaurantName);
    console.log('Business email:', profileResponse.restaurant.businessEmail);
    console.log('City:', profileResponse.restaurant.city);
    console.log('Province:', profileResponse.restaurant.province);
    
    // Step 7: Get Registration Stages Info
    console.log('\n7. Getting Registration Stages Info...');
    const stagesResponse = await makeAuthenticatedRequest('GET', '/stages');
    console.log('✅ Stages info retrieved');
    console.log('Available stages:', Object.keys(stagesResponse.stages).length);
    
    Object.entries(stagesResponse.stages).forEach(([stage, info]) => {
      console.log(`Stage ${stage}: ${info.title} - ${info.description}`);
    });
    
    // Step 8: Get Specific Stage Data
    console.log('\n8. Getting Stage 2 Data...');
    const stage2DataResponse = await makeAuthenticatedRequest('GET', '/stage/2');
    console.log('✅ Stage 2 data retrieved');
    console.log('Banking info present:', !!stage2DataResponse.data.bankingInfo);
    console.log('HST number present:', !!stage2DataResponse.data.HSTNumber);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('Restaurant registration is complete and ready for admin review.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
};

// Test login functionality
const testLogin = async () => {
  console.log('\n=== Testing Login Functionality ===\n');
  
  try {
    const loginData = {
      email: testRestaurant.email,
      password: testRestaurant.password
    };
    
    const loginResponse = await makeAuthenticatedRequest('POST', '/login', loginData);
    console.log('✅ Login successful:', loginResponse.message);
    console.log('Stage message:', loginResponse.stageMessage);
    console.log('Registration complete:', loginResponse.restaurant.isRegistrationComplete);
    
    authToken = loginResponse.token;
    
    // Get dashboard after login
    const dashboardResponse = await makeAuthenticatedRequest('GET', '/dashboard');
    console.log('✅ Dashboard after login retrieved');
    console.log('Current stage:', dashboardResponse.currentStage);
    console.log('Progress:', `${dashboardResponse.progress.percentage}%`);
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
};

// Test error handling
const testErrorHandling = async () => {
  console.log('\n=== Testing Error Handling ===\n');
  
  try {
    // Test missing required fields
    console.log('1. Testing missing required fields...');
    const incompleteData = {
      phone: testRestaurant.phone,
      // Missing other required fields
    };
    
    await makeAuthenticatedRequest('PUT', '/update-stage', incompleteData);
  } catch (error) {
    console.log('✅ Expected error caught for missing fields:', error.response?.data?.message);
  }
  
  try {
    // Test invalid data format
    console.log('\n2. Testing invalid data format...');
    const invalidData = {
      phone: 'invalid-phone',
      businessEmail: 'invalid-email',
      postalCode: 'invalid-postal'
    };
    
    await makeAuthenticatedRequest('PUT', '/update-stage', invalidData);
  } catch (error) {
    console.log('✅ Expected error caught for invalid format:', error.response?.data?.errors?.length, 'validation errors');
  }
  
  try {
    // Test invalid banking info
    console.log('\n3. Testing invalid banking info...');
    const invalidBankingData = {
      bankingInfo: {
        transitNumber: '123', // Should be 5 digits
        institutionNumber: '12', // Should be 3 digits
        accountNumber: '123' // Should be 7-12 digits
      },
      HSTNumber: '123456789RT0001'
    };
    
    await makeAuthenticatedRequest('PUT', '/update-stage', invalidBankingData);
  } catch (error) {
    console.log('✅ Expected error caught for invalid banking info:', error.response?.data?.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting Restaurant Staged Registration Tests\n');
  
  await testRegistration();
  await testLogin();
  await testErrorHandling();
  
  console.log('\n✨ All tests completed!');
};

// Run the tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testRegistration,
  testLogin,
  testErrorHandling,
  runTests
}; 