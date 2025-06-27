const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/restaurant-staged';
let authToken = '';

const testRestaurant = {
  ownerName: 'John Doe',
  email: 'john.doe@restaurant.com',
  password: 'SecurePassword123!',
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
  bankingInfo: {
    transitNumber: '12345',
    institutionNumber: '123',
    accountNumber: '1234567890'
  },
  HSTNumber: '123456789RT0001',
  drivingLicenseUrl: 'https://example.com/documents/driving-license.pdf',
  voidChequeUrl: 'https://example.com/documents/void-cheque.pdf',
  HSTdocumentUrl: 'https://example.com/documents/hst-document.pdf',
  foodHandlingCertificateUrl: 'https://example.com/documents/food-handling.pdf',
  articleofIncorporation: 'https://example.com/documents/incorporation.pdf'
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

const testStagedRegistration = async () => {
  console.log('=== Restaurant Staged Registration Test ===\n');
  
  try {
    // Step 1: Register
    console.log('1. Registering...');
    const registerResponse = await makeRequest('POST', '/register', {
      ownerName: testRestaurant.ownerName,
      email: testRestaurant.email,
      password: testRestaurant.password
    });
    console.log('✅ Registered, stage:', registerResponse.restaurant.registrationStage);
    authToken = registerResponse.token;
    
    // Step 2: Complete Stage 1
    console.log('\n2. Completing Stage 1...');
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
    
    const stage1Response = await makeRequest('PUT', '/update-stage', stage1Data);
    console.log('✅ Stage 1 complete, current stage:', stage1Response.restaurant.registrationStage);
    
    // Step 3: Complete Stage 2
    console.log('\n3. Completing Stage 2...');
    const stage2Data = {
      bankingInfo: testRestaurant.bankingInfo,
      HSTNumber: testRestaurant.HSTNumber
    };
    
    const stage2Response = await makeRequest('PUT', '/update-stage', stage2Data);
    console.log('✅ Stage 2 complete, current stage:', stage2Response.restaurant.registrationStage);
    
    // Step 4: Complete Stage 3
    console.log('\n4. Completing Stage 3...');
    const stage3Data = {
      drivingLicenseUrl: testRestaurant.drivingLicenseUrl,
      voidChequeUrl: testRestaurant.voidChequeUrl,
      HSTdocumentUrl: testRestaurant.HSTdocumentUrl,
      foodHandlingCertificateUrl: testRestaurant.foodHandlingCertificateUrl,
      articleofIncorporation: testRestaurant.articleofIncorporation
    };
    
    const stage3Response = await makeRequest('PUT', '/update-stage', stage3Data);
    console.log('✅ Stage 3 complete, registration complete:', stage3Response.restaurant.isRegistrationComplete);
    
    // Step 5: Get Dashboard
    console.log('\n5. Getting dashboard...');
    const dashboardResponse = await makeRequest('GET', '/dashboard');
    console.log('✅ Dashboard retrieved, progress:', `${dashboardResponse.progress.percentage}%`);
    
    console.log('\n🎉 All stages completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

if (require.main === module) {
  testStagedRegistration();
}

module.exports = { testStagedRegistration }; 