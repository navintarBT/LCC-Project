const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

/**
 * Extract ZIP file to target directory, skipping the main folder
 * @param {string} zipPath - Path to the ZIP file
 * @param {string} targetDir - Directory to extract files to
 * @returns {Promise<void>}
 */
async function extractZip(zipPath, targetDir) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`[zipExtractor] Extracting "${zipPath}" to "${targetDir}"`);
      // Ensure target directory exists
      await fs.promises.mkdir(targetDir, { recursive: true });
      
      // Read the ZIP file
      const directory = await unzipper.Open.file(zipPath);
      
      // Determine if there's a common root folder to skip
      const entries = directory.files;
      let rootFolder = null;
      
      if (entries.length > 0) {
        // Get the first path component of the first entry
        const firstPath = entries[0].path;
        const firstComponent = firstPath.split('/')[0];
        
        // Check if all entries start with this component
        const allHaveSameRoot = entries.every(entry => {
          const components = entry.path.split('/');
          return components[0] === firstComponent && components.length > 1;
        });
        
        if (allHaveSameRoot) {
          rootFolder = firstComponent;
        }
      }
      
      let extractedCount = 0;
      let skippedCount = 0;
      let processedCount = 0;

      // Extract files
      for (const entry of entries) {
        if (entry.type === 'Directory') {
          skippedCount += 1;
          processedCount += 1;
          if (processedCount % 50 === 0) {
            console.log(`[zipExtractor] Processed ${processedCount}/${entries.length} items...`);
          }
          continue;
        }

        let relativePath = entry.path;

        // Skip the root folder if it exists
        if (rootFolder && relativePath.startsWith(rootFolder + '/')) {
          relativePath = relativePath.substring(rootFolder.length + 1);
        }

        // Skip if the path is empty after removing root
        if (!relativePath) {
          skippedCount += 1;
          processedCount += 1;
          if (processedCount % 50 === 0) {
            console.log(`[zipExtractor] Processed ${processedCount}/${entries.length} items...`);
          }
          continue;
        }

        // Sanitize path to prevent directory traversal
        const sanitizedPath = relativePath
          .split('/')
          .filter(part => part && part !== '..' && part !== '.')
          .join(path.sep);

        if (!sanitizedPath) {
          skippedCount += 1;
          processedCount += 1;
          if (processedCount % 50 === 0) {
            console.log(`[zipExtractor] Processed ${processedCount}/${entries.length} items...`);
          }
          continue;
        }

        const fullPath = path.join(targetDir, sanitizedPath);

        // Ensure the path is within target directory
        if (!fullPath.startsWith(targetDir)) {
          console.warn(`Skipping potentially dangerous path: ${entry.path}`);
          skippedCount += 1;
          processedCount += 1;
          if (processedCount % 50 === 0) {
            console.log(`[zipExtractor] Processed ${processedCount}/${entries.length} items...`);
          }
          continue;
        }

        // Create directory for the file
        const fileDir = path.dirname(fullPath);
        await fs.promises.mkdir(fileDir, { recursive: true });

        // Extract file
        console.log(`[zipExtractor] Writing: ${entry.path}`);
        await new Promise((res, rej) => {
          entry.stream()
            .pipe(fs.createWriteStream(fullPath))
            .on('finish', res)
            .on('error', (err) => {
              console.error(`[zipExtractor] Failed to write "${entry.path}":`, err);
              rej(err);
            });
        });
        extractedCount += 1;
        processedCount += 1;
        if (processedCount % 50 === 0) {
          console.log(`[zipExtractor] Processed ${processedCount}/${entries.length} items...`);
        }
      }
      console.log(
        `[zipExtractor] Completed. Extracted ${extractedCount} file(s), skipped ${skippedCount} item(s).`
      );
      resolve();
    } catch (error) {
      console.error('[zipExtractor] Extraction failed:', error);
      reject(error);
    }
  });
}

module.exports = { extractZip };
