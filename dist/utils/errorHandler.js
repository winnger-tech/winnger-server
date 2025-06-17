// Wrapper for async route handlers to catch errors
const handleAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  });
};
module.exports = {
  handleAsync
};