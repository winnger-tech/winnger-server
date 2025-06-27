const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/drivers';

const testDriver = {
  // Basic Information
  email: 'john.doe@driver.com',
  password: 'SecurePassword123!',
  firstName: 'John',
  middleName: 'Michael',
  lastName: 'Doe',
  
  // Personal Details
  dateOfBirth: '1990-05-15',
  cellNumber: '+1-234-567-8900',
  streetNameNumber: '123 Main Street',
  appUniteNumber: 'Apt 4B',
  city: 'Toronto',
  province: 'ON',
  postalCode: 'M5V 3A8',
  
  // Vehicle Information
  vehicleType: 'Car',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  deliveryType: 'Meals',
  yearOfManufacture: 2020,
  vehicleColor: 'Silver',
  vehicleLicensePlate: 'ABC123',
  driversLicenseClass: 'G',
  
  // Document URLs (from frontend uploads)
  profilePhotoUrl: 'https://example.com/photos/profile.jpg',
  driversLicenseFrontUrl: 'https://example.com/documents/license-front.jpg',
  driversLicenseBackUrl: 'https://example.com/documents/license-back.jpg',
  vehicleRegistrationUrl: 'https://example.com/documents/registration.pdf',
  vehicleInsuranceUrl: 'https://example.com/documents/insurance.pdf',
  drivingAbstractUrl: 'https://example.com/documents/abstract.pdf',
  drivingAbstractDate: '2024-01-15',
  workEligibilityUrl: 'https://example.com/documents/work-permit.pdf',
  workEligibilityType: 'work_permit',
  sinCardUrl: 'https://example.com/documents/sin-card.jpg',
  sinNumber: '123-456-789',
  criminalBackgroundCheckUrl: 'https://example.com/documents/background-check.pdf',
  criminalBackgroundCheckDate: '2024-01-20',
  
  // Banking Information
  bankingInfo: {
    accountNumber: '1234567890',
    accountHolderName: 'John Doe',
    bankName: 'Royal Bank of Canada'
  },
  
  // Consent and Declarations
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
      'Content-Type': 'application/json'
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

const testDriverRegistration = async () => {
  console.log('=== Testing Driver Registration ===\n');
  
  try {
    // Step 1: Register Driver
    console.log('1. Registering driver...');
    const registerResponse = await makeRequest('POST', '/register', testDriver);
    console.log('✅ Driver registered successfully');
    console.log('Driver ID:', registerResponse.data.driverId);
    console.log('Email:', registerResponse.data.email);
    console.log('Registration Stage:', registerResponse.data.registrationStage);
    console.log('Is Complete:', registerResponse.data.isRegistrationComplete);
    console.log('Payment Status:', registerResponse.data.paymentStatus);
    console.log('Status:', registerResponse.data.status);
    
    const driverId = registerResponse.data.driverId;
    
    // Step 2: Check Registration Status
    console.log('\n2. Checking registration status...');
    const statusResponse = await makeRequest('GET', `/${driverId}/status`);
    console.log('✅ Status retrieved');
    console.log('Is Complete:', statusResponse.data.isComplete);
    console.log('Payment Status:', statusResponse.data.paymentStatus);
    console.log('Background Check Status:', statusResponse.data.backgroundCheckStatus);
    console.log('Admin Approval Status:', statusResponse.data.adminApprovalStatus);
    console.log('Missing Requirements:', statusResponse.data.missingRequirements);
    
    // Step 3: Get Driver Details
    console.log('\n3. Getting driver details...');
    const driverResponse = await makeRequest('GET', `/${driverId}`);
    console.log('✅ Driver details retrieved');
    console.log('Name:', `${driverResponse.data.firstName} ${driverResponse.data.lastName}`);
    console.log('Email:', driverResponse.data.email);
    console.log('City:', driverResponse.data.city);
    console.log('Province:', driverResponse.data.province);
    console.log('Vehicle:', `${driverResponse.data.vehicleMake} ${driverResponse.data.vehicleModel}`);
    console.log('Vehicle Type:', driverResponse.data.vehicleType);
    console.log('License Class:', driverResponse.data.driversLicenseClass);
    
    // Step 4: Test Payment Confirmation (mock)
    console.log('\n4. Testing payment confirmation...');
    const paymentData = {
      driverId: driverId,
      paymentIntentId: 'pi_test_1234567890'
    };
    
    const paymentResponse = await makeRequest('POST', '/confirm-payment', paymentData);
    console.log('✅ Payment confirmed');
    console.log('Payment Status:', paymentResponse.paymentStatus);
    
    // Step 5: Check Status After Payment
    console.log('\n5. Checking status after payment...');
    const finalStatusResponse = await makeRequest('GET', `/${driverId}/status`);
    console.log('✅ Final status retrieved');
    console.log('Is Complete:', finalStatusResponse.data.isComplete);
    console.log('Payment Status:', finalStatusResponse.data.paymentStatus);
    console.log('Missing Requirements:', finalStatusResponse.data.missingRequirements);
    
    console.log('\n🎉 Driver registration test completed successfully!');
    console.log('Driver ID:', driverId);
    console.log('Registration is ready for admin review.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
};

// Test with minimal data (no validation)
const testMinimalRegistration = async () => {
  console.log('\n=== Testing Minimal Registration ===\n');
  
  try {
    const minimalData = {
      email: 'minimal@example.com',
      password: 'password',
      firstName: 'Minimal',
      lastName: 'User',
      // Only required database fields
      dateOfBirth: '1990-01-01',
      cellNumber: '1234567890',
      streetNameNumber: '123 Street',
      city: 'City',
      province: 'ON',
      postalCode: 'A1A1A1',
      vehicleType: 'Car',
      vehicleMake: 'Make',
      vehicleModel: 'Model',
      yearOfManufacture: 2020,
      vehicleColor: 'Color',
      vehicleLicensePlate: 'ABC123',
      driversLicenseClass: 'G',
      workEligibilityType: 'passport',
      sinNumber: '123-456-789',
      // Document URLs
      profilePhotoUrl: 'https://example.com/photo.jpg',
      driversLicenseFrontUrl: 'https://example.com/license.jpg',
      driversLicenseBackUrl: 'https://example.com/license-back.jpg',
      vehicleRegistrationUrl: 'https://example.com/registration.pdf',
      vehicleInsuranceUrl: 'https://example.com/insurance.pdf',
      drivingAbstractUrl: 'https://example.com/abstract.pdf',
      workEligibilityUrl: 'https://example.com/eligibility.pdf',
      sinCardUrl: 'https://example.com/sin.jpg',
      // Banking and consent
      bankingInfo: { accountNumber: '123', accountHolderName: 'Name' },
      consentAndDeclarations: { backgroundCheck: true, termsOfService: true, privacyPolicy: true, dataCollection: true }
    };
    
    const response = await makeRequest('POST', '/register', minimalData);
    console.log('✅ Minimal registration successful');
    console.log('Driver ID:', response.data.driverId);
    
  } catch (error) {
    console.error('❌ Minimal registration failed:', error.message);
  }
};

// Test with string JSON fields
const testStringJsonFields = async () => {
  console.log('\n=== Testing String JSON Fields ===\n');
  
  try {
    const stringJsonData = {
      ...testDriver,
      email: 'string.json@example.com',
      bankingInfo: JSON.stringify(testDriver.bankingInfo),
      consentAndDeclarations: JSON.stringify(testDriver.consentAndDeclarations)
    };
    
    const response = await makeRequest('POST', '/register', stringJsonData);
    console.log('✅ String JSON fields test successful');
    console.log('Driver ID:', response.data.driverId);
    
  } catch (error) {
    console.error('❌ String JSON fields test failed:', error.message);
  }
};

// Test duplicate email error
const testDuplicateEmail = async () => {
  console.log('\n=== Testing Duplicate Email ===\n');
  
  try {
    // Try to register with the same email again
    await makeRequest('POST', '/register', testDriver);
  } catch (error) {
    console.log('✅ Expected error caught for duplicate email:', error.response?.data?.message);
  }
};

if (require.main === module) {
  testDriverRegistration()
    .then(() => testMinimalRegistration())
    .then(() => testStringJsonFields())
    .then(() => testDuplicateEmail())
    .catch(console.error);
}

module.exports = { 
  testDriverRegistration, 
  testMinimalRegistration, 
  testStringJsonFields,
  testDuplicateEmail
}; 