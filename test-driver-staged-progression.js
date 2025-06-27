const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/driver-staged';
let authToken = '';

const testDriver = {
  // Stage 1: Initial registration
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@driver.com',
  password: 'SecurePassword123!',
  
  // Stage 1: Personal Details
  middleName: 'Michael',
  dateOfBirth: '1990-05-15',
  cellNumber: '+1-234-567-8900',
  streetNameNumber: '123 Main Street',
  appUniteNumber: 'Apt 4B',
  city: 'Toronto',
  province: 'ON',
  postalCode: 'M5V 3A8',
  profilePhotoUrl: 'https://example.com/photos/profile.jpg',
  
  // Stage 2: Vehicle Information
  vehicleType: 'Car',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  deliveryType: 'Meals',
  yearOfManufacture: '2020',
  vehicleColor: 'Silver',
  vehicleLicensePlate: 'ABC123',
  driversLicenseClass: 'G',
  vehicleInsuranceUrl: 'https://example.com/documents/insurance.pdf',
  vehicleRegistrationUrl: 'https://example.com/documents/registration.pdf',
  
  // Stage 3: Documents
  driversLicenseFrontUrl: 'https://example.com/documents/license-front.jpg',
  driversLicenseBackUrl: 'https://example.com/documents/license-back.jpg',
  drivingAbstractUrl: 'https://example.com/documents/abstract.pdf',
  drivingAbstractDate: '2024-01-15',
  workEligibilityUrl: 'https://example.com/documents/work-permit.pdf',
  workEligibilityType: 'work_permit',
  sinCardUrl: 'https://example.com/documents/sin-card.jpg',
  sinCardNumber: '123-456-789',
  
  // Stage 4: Banking Information
  bankingInfo: {
    accountNumber: '1234567890',
    accountHolderName: 'John Doe',
    bankName: 'Royal Bank of Canada'
  },
  transitNumber: '12345',
  institutionNumber: '003',
  
  // Stage 5: Consent and Declarations
  consentAndDeclarations: {
    backgroundCheck: true,
    termsOfService: true,
    privacyPolicy: true,
    dataCollection: true
  }
};

const makeRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  if (data) config.data = data;
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

const testStageProgression = async () => {
  console.log('=== Testing Driver Staged Registration Progression ===\n');
  
  try {
    // Step 1: Register
    console.log('1. Initial Registration...');
    const registerResponse = await makeRequest('POST', '/register', {
      firstName: testDriver.firstName,
      lastName: testDriver.lastName,
      email: testDriver.email,
      password: testDriver.password
    });
    console.log('✅ Registered, stage:', registerResponse.driver.registrationStage);
    console.log('Next stage info:', registerResponse.nextStage?.title);
    authToken = registerResponse.token;
    
    // Step 2: Complete Stage 1 (Personal Details)
    console.log('\n2. Completing Stage 1 (Personal Details)...');
    const stage1Data = {
      firstName: testDriver.firstName,
      lastName: testDriver.lastName,
      middleName: testDriver.middleName,
      email: testDriver.email,
      dateOfBirth: testDriver.dateOfBirth,
      cellNumber: testDriver.cellNumber,
      streetNameNumber: testDriver.streetNameNumber,
      appUniteNumber: testDriver.appUniteNumber,
      city: testDriver.city,
      province: testDriver.province,
      postalCode: testDriver.postalCode,
      profilePhotoUrl: testDriver.profilePhotoUrl
    };
    
    const stage1Response = await makeRequest('PUT', '/stage/1', stage1Data);
    console.log('✅ Stage 1 complete, current stage:', stage1Response.driver.registrationStage);
    console.log('Next stage info:', stage1Response.nextStage?.title);
    console.log('Expected stage: 2, Actual stage:', stage1Response.driver.registrationStage);
    
    // Step 3: Complete Stage 2 (Vehicle Information)
    console.log('\n3. Completing Stage 2 (Vehicle Information)...');
    const stage2Data = {
      vehicleType: testDriver.vehicleType,
      vehicleMake: testDriver.vehicleMake,
      vehicleModel: testDriver.vehicleModel,
      deliveryType: testDriver.deliveryType,
      yearOfManufacture: testDriver.yearOfManufacture,
      vehicleColor: testDriver.vehicleColor,
      vehicleLicensePlate: testDriver.vehicleLicensePlate,
      driversLicenseClass: testDriver.driversLicenseClass,
      vehicleInsuranceUrl: testDriver.vehicleInsuranceUrl,
      vehicleRegistrationUrl: testDriver.vehicleRegistrationUrl
    };
    
    const stage2Response = await makeRequest('PUT', '/stage/2', stage2Data);
    console.log('✅ Stage 2 complete, current stage:', stage2Response.driver.registrationStage);
    console.log('Next stage info:', stage2Response.nextStage?.title);
    console.log('Expected stage: 3, Actual stage:', stage2Response.driver.registrationStage);
    
    // Step 4: Complete Stage 3 (Documents)
    console.log('\n4. Completing Stage 3 (Documents)...');
    const stage3Data = {
      driversLicenseFrontUrl: testDriver.driversLicenseFrontUrl,
      driversLicenseBackUrl: testDriver.driversLicenseBackUrl,
      driversLicenseClass: testDriver.driversLicenseClass,
      vehicleRegistrationUrl: testDriver.vehicleRegistrationUrl,
      vehicleInsuranceUrl: testDriver.vehicleInsuranceUrl,
      drivingAbstractUrl: testDriver.drivingAbstractUrl,
      drivingAbstractDate: testDriver.drivingAbstractDate,
      workEligibilityUrl: testDriver.workEligibilityUrl,
      workEligibilityType: testDriver.workEligibilityType,
      sinCardUrl: testDriver.sinCardUrl,
      sinCardNumber: testDriver.sinCardNumber
    };
    
    const stage3Response = await makeRequest('PUT', '/stage/3', stage3Data);
    console.log('✅ Stage 3 complete, current stage:', stage3Response.driver.registrationStage);
    console.log('Next stage info:', stage3Response.nextStage?.title);
    console.log('Expected stage: 4, Actual stage:', stage3Response.driver.registrationStage);
    
    // Step 5: Complete Stage 4 (Banking Information)
    console.log('\n5. Completing Stage 4 (Banking Information)...');
    const stage4Data = {
      bankingInfo: testDriver.bankingInfo,
      transitNumber: testDriver.transitNumber,
      institutionNumber: testDriver.institutionNumber
    };
    
    const stage4Response = await makeRequest('PUT', '/stage/4', stage4Data);
    console.log('✅ Stage 4 complete, current stage:', stage4Response.driver.registrationStage);
    console.log('Next stage info:', stage4Response.nextStage?.title);
    console.log('Expected stage: 5, Actual stage:', stage4Response.driver.registrationStage);
    
    // Step 6: Complete Stage 5 (Consent and Declarations)
    console.log('\n6. Completing Stage 5 (Consent and Declarations)...');
    const stage5Data = {
      consentAndDeclarations: testDriver.consentAndDeclarations
    };
    
    const stage5Response = await makeRequest('PUT', '/stage/5', stage5Data);
    console.log('✅ Stage 5 complete, current stage:', stage5Response.driver.registrationStage);
    console.log('Registration complete:', stage5Response.isRegistrationComplete);
    console.log('Expected stage: 5, Actual stage:', stage5Response.driver.registrationStage);
    
    // Step 7: Get Dashboard
    console.log('\n7. Getting dashboard...');
    const dashboardResponse = await makeRequest('GET', '/dashboard');
    console.log('✅ Dashboard retrieved, progress:', `${dashboardResponse.progress.percentage}%`);
    console.log('Total stages:', dashboardResponse.progress.totalStages);
    console.log('Completed stages:', dashboardResponse.progress.completedStages);
    console.log('Current stage:', dashboardResponse.currentStage);
    
    // Step 8: Get Profile
    console.log('\n8. Getting profile...');
    const profileResponse = await makeRequest('GET', '/profile');
    console.log('✅ Profile retrieved, registration stage:', profileResponse.driver.registrationStage);
    console.log('Registration complete:', profileResponse.driver.isRegistrationComplete);
    
    console.log('\n🎉 All stages completed successfully!');
    console.log('Final registration stage:', stage5Response.driver.registrationStage);
    console.log('Registration complete:', stage5Response.isRegistrationComplete);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
};

// Test the legacy updateStage method to see if it causes conflicts
const testLegacyUpdateStage = async () => {
  console.log('\n=== Testing Legacy updateStage Method ===\n');
  
  try {
    // Test legacy method for stage 2
    console.log('Testing legacy updateStage for stage 2...');
    const legacyStage2Data = {
      vehicleType: testDriver.vehicleType,
      vehicleMake: testDriver.vehicleMake,
      vehicleModel: testDriver.vehicleModel,
      deliveryType: testDriver.deliveryType,
      yearOfManufacture: testDriver.yearOfManufacture,
      vehicleColor: testDriver.vehicleColor,
      vehicleLicensePlate: testDriver.vehicleLicensePlate,
      driversLicenseClass: testDriver.driversLicenseClass
    };
    
    const legacyResponse = await makeRequest('PUT', '/update-stage', legacyStage2Data);
    console.log('✅ Legacy method response, stage:', legacyResponse.driver.registrationStage);
    console.log('Next stage info:', legacyResponse.nextStage?.title);
    
  } catch (error) {
    console.error('❌ Legacy test failed:', error.message);
  }
};

if (require.main === module) {
  testStageProgression()
    .then(() => testLegacyUpdateStage())
    .catch(console.error);
}

module.exports = { testStageProgression, testLegacyUpdateStage }; 