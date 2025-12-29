const mongoose = require('mongoose')
const Schema = mongoose.Schema

const baseOptions = {
  timestamps: true,
}

const lccFolderSchema = new Schema(
  {
    company: {type: Schema.Types.ObjectId, ref: 'LccCompany', required: true},
    name: {type: String, required: true, trim: true},
    createdBy: {type: Schema.Types.ObjectId, ref: 'Users', default: null},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'Users', default: null},
  },
  baseOptions
)

const lccFileSchema = new Schema(
  {
    folder: {type: Schema.Types.ObjectId, ref: 'LccFolder', required: true},
    name: {type: String, required: true, trim: true},
    link: {type: String, required: true, trim: true},
    enablePassword: {type: Boolean, default: false},
    password: {type: String, trim: true},
    createdBy: {type: Schema.Types.ObjectId, ref: 'Users', default: null},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'Users', default: null},
  },
  baseOptions
)

lccFileSchema.index({folder: 1, name: 1}, {unique: true})
lccFolderSchema.index({company: 1, name: 1}, {unique: true})

const LccFolder = mongoose.model('LccFolder', lccFolderSchema)
const LccFile = mongoose.model('LccFile', lccFileSchema)

module.exports = {LccFolder, LccFile}
