const path = require('path');

module.exports = {
  // Base path for uploads
  UPLOAD_BASE_PATH: path.join(__dirname, '..', 'uploads'),
  
  // Maximum file size (10GB in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024 * 1024,
  
  // Allowed file extensions
  ALLOWED_EXTENSIONS: ['.zip'],
  
  // Server port
  PORT: process.env.PORT || 9000,
  
  // Temporary file suffix
  TEMP_SUFFIX: '.tmp',
  
  // Chunk size for processing (5MB)
  CHUNK_SIZE: 5 * 1024 * 1024
};
