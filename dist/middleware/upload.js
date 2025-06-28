// server/src/middleware/upload.js

const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create a reusable S3 storage configuration
const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  //acl: 'public-read',
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname
    });
  },
  key: (req, file, cb) => {
    // Dynamically set the folder based on the route's base path
    const folder = req.baseUrl.includes('driver') ? 'drivers' : 'restaurants';
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}-${file.originalname}`;
    cb(null, fileName);
  }
});

// --- Driver Upload Configuration (Remains the same) ---
const driverDocumentFields = [{
  name: 'profilePhoto',
  maxCount: 1
}, {
  name: 'driversLicenseFront',
  maxCount: 1
}, {
  name: 'driversLicenseBack',
  maxCount: 1
}, {
  name: 'vehicleRegistration',
  maxCount: 1
}, {
  name: 'vehicleInsurance',
  maxCount: 1
}, {
  name: 'drivingAbstract',
  maxCount: 1
}, {
  name: 'workEligibility',
  maxCount: 1
}, {
  name: 'sinCard',
  maxCount: 1
}, {
  name: 'criminalBackgroundCheck',
  maxCount: 1
}];
const driverUpload = multer({
  storage: s3Storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  } // 5MB limit
}).fields(driverDocumentFields);

// --- ‼️ UPDATED Restaurant Upload Configuration ‼️ ---
// Using the correct field names from your restaurantRoutes.js file
const restaurantDocumentFields = [{
  name: 'businessDocument',
  maxCount: 1
},
// For Bank Statement/Card
{
  name: 'voidCheque',
  maxCount: 1
},
// For the mandatory void cheque
{
  name: 'businessLicense',
  maxCount: 1
}
//{ name: 'fssaiCertificate', maxCount: 1 },
//{ name: 'gstCertificate', maxCount: 1 },
//{ name: 'panCard', maxCount: 1 },
//{ name: 'voidCheque', maxCount: 1 },
//{ name: 'menuImages', maxCount: 10 }
];
const restaurantUpload = multer({
  storage: s3Storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  } // 5MB limit
}).fields(restaurantDocumentFields);

// Export all configured middleware
module.exports = {
  driverUpload,
  restaurantUpload
};