const mongoose = require('mongoose')
const Schema = mongoose.Schema

const baseOptions = {
  timestamps: true,
}

const lccCompanySchema = new Schema(
  {
    name: {type: String, required: true, trim: true},
    createdBy: {type: Schema.Types.ObjectId, ref: 'Users', default: null},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'Users', default: null},
  },
  baseOptions
)

// company names must be unique
lccCompanySchema.index({name: 1}, {unique: true})

const LccCompany = mongoose.model('LccCompany', lccCompanySchema)

module.exports = LccCompany
