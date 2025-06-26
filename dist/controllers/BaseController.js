const {
  validationResult
} = require('express-validator');
const AWS = require('aws-sdk');
class BaseController {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  }
  validateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw {
        status: 400,
        message: 'Validation failed',
        errors: errors.array()
      };
    }
  }
  uploadFile(file) {
    if (!file) return null;
    return Promise.resolve(file.location);
  }
  async deleteFile(fileUrl) {
    if (!fileUrl) return;
    try {
      const key = fileUrl.split('/').pop();
      await this.s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      }).promise();
    } catch (error) {
      console.error('File deletion error:', error);
    }
  }
  handleError(error, res) {
    console.error('Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({
      success: false,
      message,
      errors: error.errors
    });
  }
  async handleSuccess(res, data = null, message = 'Success') {
    res.status(200).json({
      success: true,
      message,
      data
    });
  }
  successResponse(res, data = null, statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      data
    });
  }
  errorResponse(res, message = 'Internal server error', statusCode = 500, errors = null) {
    res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }
}
module.exports = BaseController;