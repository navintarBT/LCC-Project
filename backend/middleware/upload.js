const path = require('path');
const config = require('../config/config');

/**
 * Validate upload request
 */
function validateUpload(req, res, next) {
  // Check content type
  const contentType = req.headers['content-type'] || '';
  
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({
      success: false,
      error: 'Content-Type must be multipart/form-data'
    });
  }
  
  // Check content length if provided
  const contentLength = parseInt(req.headers['content-length'], 10);
  
  if (contentLength && contentLength > config.MAX_FILE_SIZE) {
    return res.status(413).json({
      success: false,
      error: `File too large. Maximum size is ${config.MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`
    });
  }
  
  next();
}

/**
 * Validate file extension
 * @param {string} filename - The filename to validate
 * @returns {boolean} True if valid
 */
function isValidFileExtension(filename) {
  if (!filename) return false;
  const ext = path.extname(filename).toLowerCase();
  return config.ALLOWED_EXTENSIONS.includes(ext);
}

module.exports = {
  validateUpload,
  isValidFileExtension
};
