const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique folder name using UUID
 * @returns {string} Unique folder name
 */
function generateFolderName() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const shortUuid = uuidv4().split('-')[0];
  return `${timestamp}_${shortUuid}`;
}

/**
 * Sanitize folder/file names to prevent path traversal
 * @param {string} name - The name to sanitize
 * @returns {string} Sanitized name
 */
function sanitizeName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid name provided');
  }
  
  // Remove any path separators and dangerous characters
  return name
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .trim();
}

module.exports = {
  generateFolderName,
  sanitizeName
};
