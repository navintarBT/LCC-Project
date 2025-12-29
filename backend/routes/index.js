const express = require('express')
const router = express.Router()

// domain routes
router.use('/users', require('./user.route'))
router.use('/lcc', require('./company.routes'))
router.use('/lcc', require('./lccFolder.routes'))

module.exports = router
