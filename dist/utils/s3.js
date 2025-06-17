const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

/**
 * Upload a file to S3
 * @param {Object} file - The file object from multer
 * @returns {Promise<Object>} - S3 upload result
 */
exports.uploadFile = async file => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };
    const result = await s3.upload(params).promise();
    return {
      Location: result.Location,
      Key: result.Key
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Delete a file from S3
 * @param {string} key - The file key in S3
 * @returns {Promise<void>}
 */
exports.deleteFile = async key => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file');
  }
};