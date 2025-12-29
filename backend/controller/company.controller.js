const LccCompany = require('../models/company.models')
const {
  ensureString,
  isValidId,
  formatCompany,
  buildTree,
  deleteCompanyCascade,
} = require('./lcc.utils')

const getLccTree = async (req, res) => {
  try {
    const tree = await buildTree()
    res.json(tree)
  } catch (error) {
    console.error('Failed to load LCC tree', error)
    res.status(500).json({message: 'Unable to load hierarchy'})
  }
}

const createCompany = async (req, res) => {
  try {
    const name = ensureString(req.body?.name || '')
    const createdBy = ensureString(req.body?.createdBy || '')
    const updatedBy = ensureString(req.body?.updatedBy || '')
    const createdByValue = isValidId(createdBy) ? createdBy : undefined
    const updatedByValue = isValidId(updatedBy) ? updatedBy : createdByValue

    if (!name) {
      return res.status(400).json({message: 'Company name is required'})
    }

    const existing = await LccCompany.findOne({name})
    if (existing) {
      return res.status(409).json({message: 'Company name already exists'})
    }

    const company = new LccCompany({
      name,
      createdBy: createdByValue,
      updatedBy: updatedByValue,
    })
    await company.save()
    res.status(201).json(formatCompany(company))
  } catch (error) {
    console.error('Failed to create company', error)
    if (error?.code === 11000) {
      return res.status(409).json({message: 'Company name already exists'})
    }
    res.status(500).json({message: 'Unable to create company'})
  }
}

const deleteCompany = async (req, res) => {
  try {
    const {companyId} = req.params
    if (!isValidId(companyId)) {
      return res.status(400).json({message: 'Invalid company id'})
    }

    const company = await LccCompany.findById(companyId)
    if (!company) {
      return res.status(404).json({message: 'Company not found'})
    }

    await deleteCompanyCascade(companyId)
    res.json({message: 'Company deleted'})
  } catch (error) {
    console.error('Failed to delete company', error)
    res.status(500).json({message: 'Unable to delete company'})
  }
}

const updateCompany = async (req, res) => {
  try {
    const {companyId} = req.params
    if (!isValidId(companyId)) {
      return res.status(400).json({message: 'Invalid company id'})
    }

    const name = ensureString(req.body?.name || '')
    const updatedBy = ensureString(req.body?.updatedBy || '')
    const updatedByValue = isValidId(updatedBy) ? updatedBy : undefined

    if (!name) {
      return res.status(400).json({message: 'Company name is required'})
    }

    const company = await LccCompany.findById(companyId)
    if (!company) {
      return res.status(404).json({message: 'Company not found'})
    }

    if (name !== company.name) {
      const existing = await LccCompany.findOne({_id: {$ne: companyId}, name})
      if (existing) {
        return res.status(409).json({message: 'Company name already exists'})
      }
      company.name = name
    }

    if (updatedByValue) {
      company.updatedBy = updatedByValue
    }

    await company.save()
    res.json(formatCompany(company))
  } catch (error) {
    console.error('Failed to update company', error)
    if (error?.code === 11000) {
      return res.status(409).json({message: 'Company name already exists'})
    }
    res.status(500).json({message: 'Unable to update company'})
  }
}

module.exports = {
  getLccTree,
  createCompany,
  deleteCompany,
  updateCompany,
}
