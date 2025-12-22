const mongoose = require('mongoose');
const { Schema } = mongoose;
const DoctorSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: String,
  contact: String,
  availableSlots: [Date],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Doctor', DoctorSchema);
