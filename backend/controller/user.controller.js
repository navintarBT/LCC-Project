const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const {Users} = require('../models/User.models')

const ensureString = (value = '') => value.toString().trim()
const isValidId = (value) => mongoose.Types.ObjectId.isValid(value)

const createUser = async (req, res) => {
  const {
    username,
    first_name,
    last_name,
    email,
    password,
    role,
    color,
  } = req.body
  const createdBy = ensureString(req.body?.createdBy || '')
  const updatedBy = ensureString(req.body?.updatedBy || '')
  const createdByValue = isValidId(createdBy) ? createdBy : undefined
  const updatedByValue = isValidId(updatedBy) ? updatedBy : createdByValue

  const newUser = new Users({
    username,
    first_name,
    last_name,
    email,
    password,
    role,
    color,
    createdBy: createdByValue,
    updatedBy: updatedByValue,
  })

  if (req.file) {
    newUser.img = req.file.filename
  }

  try {
    const user = await newUser.save()
    return res.json(user)
  } catch (error) {
    return res.status(500).json({error: error.message})
  }
}

const getUsers = async (req, res) => {
  try {
    const doc = await Users.find()
    res.json(doc)
  } catch (err) {
    console.log(err)
  }
}


const getUsersPaginated = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.item_per_page) || 11
  const startIndex = (page - 1) * limit
  const userName = req.query.search

  const query = userName
    ? {
        username: {$regex: userName, $options: 'i'},
      }
    : {}

  const totalItems = await Users.countDocuments(query)
  const items = await Users.find(query).skip(startIndex).limit(limit)

  const totalPages = Math.ceil(totalItems / limit)

  const generateLinks = (currentPage, totalPages) => {
    const links = []

    links.push({
      url: currentPage > 1 ? `/?page=${currentPage - 1}` : null,
      label: '&laquo; Previous',
      active: false,
      page: currentPage > 1 ? currentPage - 1 : null,
    })

    for (let i = 1; i <= totalPages; i++) {
      links.push({
        url: `/?page=${i}`,
        label: `${i}`,
        active: i === currentPage,
        page: i,
      })
    }

    links.push({
      url: currentPage < totalPages ? `/?page=${currentPage + 1}&item_per_page=${limit}` : null,
      label: 'Next &raquo;',
      active: false,
      page: currentPage < totalPages ? currentPage + 1 : null,
    })

    return links
  }

  const links = generateLinks(page, totalPages)

  res.json({
    data: items,
    payload: {
      pagination: {
        links,
        from: startIndex + 1,
        to: startIndex + items.length,
        item_per_page: limit.toString(),
        page,
        total: totalItems,
        next_page_url: page < totalPages ? `/?page=${page + 1}` : null,
        prev_page_url: page > 1 ? `/?page=${page - 1}` : null,
        first_page_url: '/?page=1',
        last_page_url: `/?page=${totalPages}`,
        last_page: totalPages,
        totalPages,
      },
      totalItems,
      totalPages,
      currentPage: page,
    },
  })
}

const loginInitialValues = async (req, res) => {
  const {email, password} = req.query
  const query = {email, password}
  try {
    const initialValues = await Users.find(query)

    if (initialValues.length === 0) {
      res.json('User not found')
    } else {
      res.json(initialValues)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Server error'})
  }
}

const getUserById = async (req, res) => {
  const {id} = req.query
  try {
    const user = await Users.findOne({_id: id})

    if (!user) {
      res.json('User not found')
    } else {
      res.json(user)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Server error'})
  }
}

const editUser = async (req, res) => {
  try {
    const doc = await Users.findOne({_id: req.params.id})
    res.json(doc)
  } catch (err) {
    console.log(err)
  }
}

const updateUser = async (req, res) => {
  const {
    username,
    first_name,
    last_name,
    email,
    password,
    role,
    color,
  } = req.body
  const updatedBy = ensureString(req.body?.updatedBy || '')
  const updatedByValue = isValidId(updatedBy) ? updatedBy : undefined

  const data = {
    username,
    first_name,
    last_name,
    email,
    password,
    role,
    color,
  }
  if (updatedByValue) {
    data.updatedBy = updatedByValue
  }

  if (req.file) {
    data.img = req.file.filename
  }

  const update_id = req.params.id
  const updated = await Users.findByIdAndUpdate(update_id, data)
  res.json(updated)
}

const updateUserPassword = async (req, res) => {
  const updatedBy = ensureString(req.body?.updatedBy || '')
  const updatedByValue = isValidId(updatedBy) ? updatedBy : undefined
  const data = {
    password: req.body.password,
  }
  if (updatedByValue) {
    data.updatedBy = updatedByValue
  }

  const update_id = req.params.id
  const updated = await Users.findByIdAndUpdate(update_id, data)
  res.json(updated)
}

const deleteUser = async (req, res) => {
  const id = req.params.id

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const deleteUser = await Users.findByIdAndDelete(id).session(session)

    if (deleteUser?.img) {
      const imgPath = path.join('./public/images/users/', deleteUser.img)
      fs.unlink(imgPath, (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log('Remove successfully')
        }
      })
    }

    if (!deleteUser) {
      await session.abortTransaction()
      return res.status(404).json({message: 'User not found'})
    }

    await session.commitTransaction()

    return res.json({message: 'User deleted successfully'})
  } catch (error) {
    console.error('Error deleting User:', error)
    await session.abortTransaction()
    return res.status(500).json({message: 'Internal Server Error'})
  }
}

module.exports = {
  createUser,
  getUsers,
  getUsersPaginated,
  loginInitialValues,
  getUserById,
  editUser,
  updateUser,
  updateUserPassword,
  deleteUser,
}
