const express = require('express')
const router = express.Router()

const {getLccTree, createCompany, deleteCompany, updateCompany} = require('../controller/company.controller')
const {createFolder} = require('../controller/lccFolder.controller')

router.get('/tree', getLccTree)
router.post('/companies', createCompany)
router.put('/companies/:companyId', updateCompany)
router.delete('/companies/:companyId', deleteCompany)
router.post('/companies/:companyId/folders', createFolder)

module.exports = router
