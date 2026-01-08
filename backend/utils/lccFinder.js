const fs = require('fs');
const path = require('path');

/**
 * Recursively find all .lcc files in a directory
 * @param {string} dir - Directory to search
 * @param {string} baseDir - Base directory for relative paths
 * @returns {Promise<string[]>} Array of relative paths to .lcc files
 */
async function findLccFiles(dir, baseDir = dir) {
  const lccFiles = [];
  
  async function walkDir(currentDir) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.lcc')) {
        // Store relative path from base directory
        const relativePath = path.relative(baseDir, fullPath);
        lccFiles.push(relativePath.replace(/\\/g, '/')); // Use forward slashes for consistency
      }
    }
  }
  
  await walkDir(dir);
  return lccFiles;
}

module.exports = { findLccFiles };
