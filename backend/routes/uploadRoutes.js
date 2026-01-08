const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const {validateUpload, isValidFileExtension} = require('../middleware/upload');
const {generateFolderName, sanitizeName} = require('../utils/folderGenerator');
const {extractZip} = require('../utils/zipExtractor');
const {findLccFiles} = require('../utils/lccFinder');

const router = express.Router();

const TMP_DIR = path.join(config.UPLOAD_BASE_PATH, '_tmp');
fs.mkdirSync(TMP_DIR, {recursive: true});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TMP_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}${config.TEMP_SUFFIX || ''}`);
  },
});

const upload = multer({
  storage,
  limits: {fileSize: config.MAX_FILE_SIZE},
  fileFilter: (_req, file, cb) => {
    if (!isValidFileExtension(file.originalname)) {
      return cb(new Error('Only .zip files are allowed'));
    }
    cb(null, true);
  },
});

router.post('/upload', validateUpload, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({success: false, error: 'No zip uploaded'});
    }

    let companyName = 'company_default';
    try {
      companyName = sanitizeName(req.body?.companyName || 'company_default');
    } catch (_err) {
      companyName = 'company_default';
    }

    let projectName = 'project_default';
    try {
      projectName = sanitizeName(req.body?.projectName || 'project_default');
    } catch (_err) {
      projectName = 'project_default';
    }

    const folderId = req.body?.folderId
      ? sanitizeName(req.body.folderId)
      : generateFolderName();
    const uploadPath = path.join(
      config.UPLOAD_BASE_PATH,
      companyName,
      projectName,
      folderId
    );
    const folderUrl = `/uploads/${companyName}/${projectName}/${folderId}`;

    await fs.promises.mkdir(uploadPath, {recursive: true});
    await extractZip(req.file.path, uploadPath);
    await fs.promises.unlink(req.file.path).catch(() => {});

    const lccFiles = await findLccFiles(uploadPath);

    return res.json({
      success: true,
      message: 'Zip uploaded successfully',
      company: {raw: req.body?.companyName || companyName, safe: companyName},
      project: {raw: req.body?.projectName || projectName, safe: projectName},
      folderId,
      folderPath: uploadPath,
      folderUrl,
      entryFile: lccFiles.length ? lccFiles[0] : null,
      files: lccFiles,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
