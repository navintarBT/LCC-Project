const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    img: {type: String, default: null},
    username: String,
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    role: {type: String, default: null},
    createdBy: {type: Schema.Types.ObjectId, ref: 'Users', default: null},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'Users', default: null},
  },
  {timestamps: true}
);
const Users = mongoose.model('Users', userSchema);
module.exports = {Users}
