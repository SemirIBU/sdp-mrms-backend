const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','doctor','patient'], required: true },
  name: { type: String },
  active: { type: Boolean, default: true },
  resetToken: { type: String },
  resetExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
