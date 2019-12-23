const mongoose = require("mongoose")

// 定义一个表
module.exports = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  email: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
})