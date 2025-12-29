const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')

const {
  createUser,
  getUsers,
  getUsersPaginated,
  loginInitialValues,
  getUserById,
  editUser,
  updateUser,
  updateUserPassword,
  deleteUser,
} = require('../controller/user.controller')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/users') // position to give the file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // change file name
  },
})

const upload = multer({storage})

router.post('/create-user', upload.single('file'), createUser)
router.route('/').get(getUsers)
router.route('/get-user-by').get(getUsersPaginated)
router.route('/api').post(loginInitialValues)
router.route('/id').post(getUserById)
router.route('/edit-user/:id').get(editUser)
router.put('/update-user/:id', upload.single('file'), updateUser)
router.put('/update-user-password/:id', upload.single('file'), updateUserPassword)
router.route('/delete-user/:id').delete(deleteUser)

module.exports = router
