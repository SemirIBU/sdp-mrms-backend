const mongoose = require('mongoose');
const { Schema } = mongoose;
const PatientSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uniqueCitizenIdentifier: { type: String, required: true, unique: true },
  dob: Date,
  gender: String,
  contact: String,
  address: String,
  records: [{ type: Schema.Types.ObjectId, ref: 'Record' }],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Patient', PatientSchema);
