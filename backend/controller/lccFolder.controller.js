const {LccFolder, LccFile} = require('../models/lccFolder.models')
const LccCompany = require('../models/company.models')
const {
  ensureString,
  isValidId,
  formatUserId,
  formatFolder,
  formatFile,
  deleteFolderCascade,
} = require('./lcc.utils')

const checkPassword = async (req, res) => {
  try {
    const fileId = ensureString(req.body?.fileId || '')
    const passwordInput = ensureString(req.body?.password || '')

    if (!isValidId(fileId)) {
      return res.status(400).json({success: false, message: 'Invalid file id'})
    }

    const file = await LccFile.findById(fileId).select('+password')
    if (!file) {
      return res.status(404).json({success: false, message: 'File not found'})
    }

    if (!file.enablePassword) {
      return res.status(400).json({success: false, message: 'Password not enabled for this file'})
    }

    if (!passwordInput) {
      return res.status(400).json({success: false, message: 'Password is required'})
    }

    const ok = file.password && file.password === passwordInput
    if (!ok) {
      return res.status(401).json({success: false, message: 'Invalid password'})
    }

    return res.json({success: true, message: 'Password valid'})
  } catch (error) {
    console.error('Failed to check password', error)
    res.status(500).json({success: false, message: 'Unable to check password'})
  }
}

const getFileById = async (req, res) => {
  try {
    const {fileId} = req.params
    if (!isValidId(fileId)) {
      return res.status(400).json({message: 'Invalid file id'})
    }
    const file = await LccFile.findById(fileId).select('+password')
    if (!file) {
      return res.status(404).json({message: 'File not found'})
    }
    res.json(formatFile(file))
  } catch (error) {
    console.error('Failed to load LCC file', error)
    res.status(500).json({message: 'Unable to load file'})
  }
}

const createFolder = async (req, res) => {
  try {
    const {companyId} = req.params
    const name = ensureString(req.body?.name || '')
    const createdBy = ensureString(req.body?.createdBy || '')
    const updatedBy = ensureString(req.body?.updatedBy || '')
    const createdByValue = isValidId(createdBy) ? createdBy : undefined
    const updatedByValue = isValidId(updatedBy) ? updatedBy : createdByValue

    if (!isValidId(companyId)) {
      return res.status(400).json({message: 'Invalid company id'})
    }

    if (!name) {
      return res.status(400).json({message: 'LCC title name is required'})
    }

    const company = await LccCompany.findById(companyId)
    if (!company) {
      return res.status(404).json({message: 'Company not found'})
    }

    const existingFolder = await LccFolder.findOne({company: companyId, name})
    if (existingFolder) {
      return res.status(409).json({message: 'LCC title name already exists in this company'})
    }

    const folder = new LccFolder({
      name,
      company: companyId,
      createdBy: createdByValue,
      updatedBy: updatedByValue,
    })
    await folder.save()
    res.status(201).json(formatFolder(folder))
  } catch (error) {
    console.error('Failed to create LCC title', error)
    if (error?.code === 11000) {
      return res.status(409).json({message: 'LCC title name already exists in this company'})
    }
    res.status(500).json({message: 'Unable to create LCC title'})
  }
}

const createFile = async (req, res) => {
  try {
    const {folderId} = req.params
    const name = ensureString(req.body?.name || '')
    const link = ensureString(req.body?.link || '')
    const enablePassword = Boolean(req.body?.enablePassword)
    const password = ensureString(req.body?.password || '')
    const createdBy = ensureString(req.body?.createdBy || '')
    const updatedBy = ensureString(req.body?.updatedBy || '')
    const createdByValue = isValidId(createdBy) ? createdBy : undefined
    const updatedByValue = isValidId(updatedBy) ? updatedBy : createdByValue

    if (!isValidId(folderId)) {
      return res.status(400).json({message: 'Invalid folder id'})
    }

    if (!name) {
      return res.status(400).json({message: 'File name is required'})
    }

    if (!link) {
      return res.status(400).json({message: 'Link is required'})
    }

    const folder = await LccFolder.findById(folderId)
    if (!folder) {
      return res.status(404).json({message: 'Folder not found'})
    }

    const existingFile = await LccFile.findOne({folder: folderId, name})
    if (existingFile) {
      return res.status(409).json({message: 'LCC file name already exists in this title'})
    }

    const file = new LccFile({
      name,
      link,
      folder: folderId,
      enablePassword,
      password: enablePassword ? password : undefined,
      createdBy: createdByValue,
      updatedBy: updatedByValue,
    })
    await file.save()
    res.status(201).json(formatFile(file))
  } catch (error) {
    console.error('Failed to create LCC file', error)
    if (error?.code === 11000) {
      return res.status(409).json({message: 'LCC file name already exists in this title'})
    }
    res.status(500).json({message: 'Unable to create file'})
  }
}

const updateFile = async (req, res) => {
  try {
    const {fileId} = req.params
    if (!isValidId(fileId)) {
      return res.status(400).json({message: 'Invalid file id'})
    }

    const file = await LccFile.findById(fileId)
    if (!file) {
      return res.status(404).json({message: 'File not found'})
    }

    const name = ensureString(req.body?.name || '')
    const link = ensureString(req.body?.link || '')
    const hasEnablePassword = Object.prototype.hasOwnProperty.call(req.body, 'enablePassword')
    const enablePassword = hasEnablePassword ? Boolean(req.body.enablePassword) : file.enablePassword
    const password = ensureString(req.body?.password || '')
    const updatedBy = ensureString(req.body?.updatedBy || '')
    const updatedByValue = isValidId(updatedBy) ? updatedBy : undefined

    if (name && name !== file.name) {
      const existingFile = await LccFile.findOne({folder: file.folder, name})
      if (existingFile) {
        return res.status(409).json({message: 'LCC file name already exists in this title'})
      }
      file.name = name
    }
    if (link) file.link = link
    if (hasEnablePassword) {
      file.enablePassword = enablePassword
      if (!enablePassword) {
        file.password = undefined
      } else if (password) {
        file.password = password
      }
    } else if (password) {
      // if enablePassword not toggled but password provided, update it
      file.password = password
    }
    if (updatedByValue) {
      file.updatedBy = updatedByValue
    }

    await file.save()
    res.json(formatFile(file))
  } catch (error) {
    console.error('Failed to update LCC file', error)
    res.status(500).json({message: 'Unable to update file'})
  }
}

const deleteFile = async (req, res) => {
  try {
    const {fileId} = req.params
    if (!isValidId(fileId)) {
      return res.status(400).json({message: 'Invalid file id'})
    }

    const file = await LccFile.findById(fileId)
    if (!file) {
      return res.status(404).json({message: 'File not found'})
    }

    await LccFile.deleteOne({_id: fileId})
    res.json({message: 'File deleted'})
  } catch (error) {
    console.error('Failed to delete LCC file', error)
    res.status(500).json({message: 'Unable to delete file'})
  }
}

const getFolderDetails = async (req, res) => {
  try {
    const {folderId} = req.params
    if (!isValidId(folderId)) {
      return res.status(400).json({message: 'Invalid folder id'})
    }

    const folder = await LccFolder.findById(folderId)
      .populate({
        path: 'company',
        model: 'LccCompany',
      })
      .exec()

    if (!folder) {
      return res.status(404).json({message: 'LCC title not found'})
    }

    const files = await LccFile.find({folder: folderId}).sort({createdAt: 1})

    const payload = {
      folder: {
        id: folder._id.toString(),
        name: folder.name,
        createdBy: formatUserId(folder.createdBy),
        updatedBy: formatUserId(folder.updatedBy),
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
      company: folder.company
        ? {
            id: folder.company._id.toString(),
            name: folder.company.name,
            createdBy: formatUserId(folder.company.createdBy),
            updatedBy: formatUserId(folder.company.updatedBy),
          }
        : null,
      files: files.map(formatFile),
    }

    res.json(payload)
  } catch (error) {
    console.error('Failed to load folder', error)
    res.status(500).json({message: 'Unable to load folder'})
  }
}

const deleteFolder = async (req, res) => {
  try {
    const {folderId} = req.params
    if (!isValidId(folderId)) {
      return res.status(400).json({message: 'Invalid folder id'})
    }

    const folder = await LccFolder.findById(folderId)
    if (!folder) {
      return res.status(404).json({message: 'LCC title not found'})
    }

    await deleteFolderCascade(folderId)
    res.json({message: 'LCC title deleted'})
  } catch (error) {
    console.error('Failed to delete folder', error)
    res.status(500).json({message: 'Unable to delete folder'})
  }
}

const updateFolder = async (req, res) => {
  try {
    const {folderId} = req.params
    if (!isValidId(folderId)) {
      return res.status(400).json({message: 'Invalid folder id'})
    }

    const folder = await LccFolder.findById(folderId)
    if (!folder) {
      return res.status(404).json({message: 'LCC project not found'})
    }

    const name = ensureString(req.body?.name || '')
    const updatedBy = ensureString(req.body?.updatedBy || '')
    const updatedByValue = isValidId(updatedBy) ? updatedBy : undefined

    if (!name) {
      return res.status(400).json({message: 'LCC project name is required'})
    }

    if (name !== folder.name) {
      const existingFolder = await LccFolder.findOne({company: folder.company, name})
      if (existingFolder) {
        return res.status(409).json({message: 'LCC project name already exists in this company'})
      }
      folder.name = name
    }

    if (updatedByValue) {
      folder.updatedBy = updatedByValue
    }

    await folder.save()
    res.json(formatFolder(folder, [], folder.company?.toString()))
  } catch (error) {
    console.error('Failed to update LCC project', error)
    if (error?.code === 11000) {
      return res.status(409).json({message: 'LCC project name already exists in this company'})
    }
    res.status(500).json({message: 'Unable to update LCC project'})
  }
}

module.exports = {
  createFolder,
  getFolderDetails,
  deleteFolder,
  updateFolder,
  createFile,
  updateFile,
  deleteFile,
  getFileById,
  checkPassword,
}
