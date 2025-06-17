const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 instance
const s3 = new AWS.S3();

// S3 bucket name
const bucketName = process.env.AWS_S3_BUCKET;

module.exports = {
  s3,
  bucketName
};
