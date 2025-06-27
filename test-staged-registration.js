const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/drivers/staged';
let authToken = '';

// Test data
const testDriver = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe.test@example.com',
  password: 'securePassword123'
};

const stage1Data = {
  dateOfBirth: '1990-01-01',
  cellNumber: '+1234567890',
  streetNameNumber: '123 Main St',
  appUniteNumber: 'Apt 4B',
  city: 'Toronto',
  province: 'ON',
  postalCode: 'M5V 2H1'
};

const stage2Data = {
  vehicleType: 'Car',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  deliveryType: 'Meals',
  yearOfManufacture: 2020,
  vehicleColor: 'Silver',
  vehicleLicensePlate: 'ABC123',
  driversLicenseClass: 'G'
};

const stage3Data = {
  drivingAbstractDate: '2023-01-01',
  workEligibilityType: 'passport',
  sinNumber: '123-456-789'
};

const stage4Data = {
  bankingInfo: {
    accountNumber: '1234567890',
    accountHolderName: 'John Doe',
    bankName: 'Royal Bank of Canada'
  },
  transitNumber: '12345',
  institutionNumber: '003'
};

const stage5Data = {
  consentAndDeclarations: {
    backgroundCheck: true,
    termsOfService: true,
    privacyPolicy: true,
    dataCollection: true,
    additionalConsents: {
      marketing: false,
      thirdPartySharing: true
    }
  }
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
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

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
async function testRegistration() {
  console.log('\n=== Testing Driver Registration (Stage 1) ===');
  
  const result = await makeRequest('POST', '/register', testDriver);
  console.log('Registration successful:', result.message);
  console.log('Driver ID:', result.data.driver.id);
  console.log('Current Stage:', result.data.driver.registrationStage);
  console.log('Next Stage Info:', result.data.nextStage);
  
  authToken = result.data.token;
  return result.data.driver;
}

async function testLogin() {
  console.log('\n=== Testing Driver Login ===');
  
  const result = await makeRequest('POST', '/login', {
    email: testDriver.email,
    password: testDriver.password
  });
  
  console.log('Login successful:', result.message);
  console.log('Stage Message:', result.data.stageMessage);
  console.log('Current Stage:', result.data.driver.registrationStage);
  
  authToken = result.data.token;
  return result.data.driver;
}

async function testGetProfile() {
  console.log('\n=== Testing Get Profile ===');
  
  const result = await makeRequest('GET', '/profile');
  console.log('Profile retrieved successfully');
  console.log('Current Stage:', result.data.driver.registrationStage);
  console.log('Next Stage Info:', result.data.nextStage);
  
  return result.data.driver;
}

async function testGetDashboard() {
  console.log('\n=== Testing Get Dashboard ===');
  
  const result = await makeRequest('GET', '/dashboard');
  console.log('Dashboard retrieved successfully');
  console.log('Current Stage:', result.data.currentStage);
  console.log('Progress:', result.data.progress);
  console.log('Is Registration Complete:', result.data.isRegistrationComplete);
  
  return result.data;
}

async function testUpdateStage1() {
  console.log('\n=== Testing Update Stage 1 (Personal Details) ===');
  
  const result = await makeRequest('PUT', '/stage/1', stage1Data);
  console.log('Stage 1 updated successfully:', result.message);
  console.log('Next Stage Info:', result.data.nextStage);
  
  return result.data.driver;
}

async function testUpdateStage2() {
  console.log('\n=== Testing Update Stage 2 (Vehicle Information) ===');
  
  const result = await makeRequest('PUT', '/stage/2', stage2Data);
  console.log('Stage 2 updated successfully:', result.message);
  console.log('Next Stage Info:', result.data.nextStage);
  
  return result.data.driver;
}

async function testUpdateStage3() {
  console.log('\n=== Testing Update Stage 3 (Documents) ===');
  console.log('Note: This stage requires file uploads. Testing with mock data only.');
  
  // For testing purposes, we'll use the existing driver data
  // In a real scenario, you would upload actual files
  const result = await makeRequest('PUT', '/stage/3', stage3Data);
  console.log('Stage 3 updated successfully:', result.message);
  console.log('Next Stage Info:', result.data.nextStage);
  
  return result.data.driver;
}

async function testUpdateStage4() {
  console.log('\n=== Testing Update Stage 4 (Banking Information) ===');
  
  const result = await makeRequest('PUT', '/stage/4', stage4Data);
  console.log('Stage 4 updated successfully:', result.message);
  console.log('Next Stage Info:', result.data.nextStage);
  
  return result.data.driver;
}

async function testUpdateStage5() {
  console.log('\n=== Testing Update Stage 5 (Consent & Declarations) ===');
  
  const result = await makeRequest('PUT', '/stage/5', stage5Data);
  console.log('Stage 5 updated successfully:', result.message);
  console.log('Registration Complete:', result.data.isRegistrationComplete);
  
  return result.data.driver;
}

async function testGetStageData(stage) {
  console.log(`\n=== Testing Get Stage ${stage} Data ===`);
  
  const result = await makeRequest('GET', `/stage/${stage}`);
  console.log(`Stage ${stage} data retrieved successfully`);
  console.log('Stage Data:', result.data.data);
  console.log('Stage Info:', result.data.stageInfo);
  
  return result.data;
}

async function testGetStages() {
  console.log('\n=== Testing Get All Stages ===');
  
  const result = await makeRequest('GET', '/stages');
  console.log('All stages retrieved successfully');
  console.log('Available Stages:', Object.keys(result.data.stages));
  
  return result.data.stages;
}

// Main test function
async function runTests() {
  try {
    console.log('🚀 Starting Driver Staged Registration Tests\n');
    
    // Test registration
    await testRegistration();
    
    // Test login
    await testLogin();
    
    // Test get profile
    await testGetProfile();
    
    // Test get dashboard
    await testGetDashboard();
    
    // Test get all stages
    await testGetStages();
    
    // Test update stage 1
    await testUpdateStage1();
    
    // Test get stage 1 data
    await testGetStageData(1);
    
    // Test update stage 2
    await testUpdateStage2();
    
    // Test get stage 2 data
    await testGetStageData(2);
    
    // Test update stage 3 (mock)
    await testUpdateStage3();
    
    // Test get stage 3 data
    await testGetStageData(3);
    
    // Test update stage 4
    await testUpdateStage4();
    
    // Test get stage 4 data
    await testGetStageData(4);
    
    // Test update stage 5
    await testUpdateStage5();
    
    // Final dashboard check
    await testGetDashboard();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('🎉 Driver registration flow is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testRegistration,
  testLogin,
  testGetProfile,
  testGetDashboard,
  testUpdateStage1,
  testUpdateStage2,
  testUpdateStage3,
  testUpdateStage4,
  testUpdateStage5,
  testGetStageData,
  testGetStages,
  runTests
}; 