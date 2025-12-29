const mongoose = require('mongoose')
const LccCompany = require('../models/company.models')
const {LccFolder, LccFile} = require('../models/lccFolder.models')

const ensureString = (value = '') => value.trim()
const isValidId = (value) => mongoose.Types.ObjectId.isValid(value)
const formatUserId = (value) => (value ? value.toString() : null)

const formatFile = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  link: doc.link,
  enablePassword: Boolean(doc.enablePassword),
  createdBy: formatUserId(doc.createdBy),
  updatedBy: formatUserId(doc.updatedBy),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
})

const formatFolder = (doc, files = [], companyIdOverride) => {
  const companyId =
    companyIdOverride ||
    (doc.company ? doc.company.toString() : null) ||
    (doc.companyId ? doc.companyId.toString() : null)

  return {
    id: doc._id.toString(),
    name: doc.name,
    companyId: companyId || '',
    files,
    createdBy: formatUserId(doc.createdBy),
    updatedBy: formatUserId(doc.updatedBy),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

const formatCompany = (doc, folders = []) => ({
  id: doc._id.toString(),
  name: doc.name,
  folders,
  createdBy: formatUserId(doc.createdBy),
  updatedBy: formatUserId(doc.updatedBy),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
})

const deleteFolderCascade = async (folderId) => {
  await LccFile.deleteMany({folder: folderId})
  await LccFolder.deleteOne({_id: folderId})
}

const deleteCompanyCascade = async (companyId) => {
  const folders = await LccFolder.find({company: companyId}).select('_id')
  const folderIds = folders.map((folder) => folder._id)

  if (folderIds.length) {
    await LccFile.deleteMany({folder: {$in: folderIds}})
    await LccFolder.deleteMany({company: companyId})
  }

  await LccCompany.deleteOne({_id: companyId})
}

const buildTree = async () => {
  // projects not used; keep only companies, folders, files to avoid undefined
  const [companies, folders, files] = await Promise.all([
    LccCompany.find().sort({createdAt: 1}).lean(),
    LccFolder.find().sort({createdAt: 1}).lean(),
    LccFile.find().sort({createdAt: 1}).lean(),
  ])

  const filesByFolder = files.reduce((acc, doc) => {
    const folderId = doc.folder.toString()
    if (!acc[folderId]) acc[folderId] = []
    acc[folderId].push(formatFile(doc))
    return acc
  }, {})

  const foldersByCompany = folders.reduce((acc, doc) => {
    const companyId =
      (doc.company && doc.company.toString()) ||
      null

    if (!companyId) {
      // skip orphaned folders; avoids crashing tree build
      return acc
    }

    if (!acc[companyId]) acc[companyId] = []
    acc[companyId].push(formatFolder(doc, filesByFolder[doc._id.toString()] || [], companyId))
    return acc
  }, {})

  return companies.map((company) => formatCompany(company, foldersByCompany[company._id.toString()] || []))
}

module.exports = {
  ensureString,
  isValidId,
  formatUserId,
  formatFile,
  formatFolder,
  formatCompany,
  deleteFolderCascade,
  deleteCompanyCascade,
  buildTree,
}
