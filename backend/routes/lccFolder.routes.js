const express = require('express')
const router = express.Router()

const {
  getFolderDetails,
  deleteFolder,
  updateFolder,
  createFile,
  updateFile,
  deleteFile,
  getFileById,
  checkPassword,
} = require('../controller/lccFolder.controller')

router.get('/folders/:folderId', getFolderDetails)
router.get('/lccData/:fileId', getFileById)
router.post('/lccData/checkPassword', checkPassword)
router.put('/folders/:folderId', updateFolder)
router.delete('/folders/:folderId', deleteFolder)
router.post('/folders/:folderId/files', createFile)
router.put('/files/:fileId', updateFile)
router.delete('/files/:fileId', deleteFile)

module.exports = router
