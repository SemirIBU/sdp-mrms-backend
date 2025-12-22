const mongoose = require('mongoose');
const { Schema } = mongoose;
const AppointmentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  slot: { type: Date, required: true },
  status: { type: String, enum: ['booked','cancelled','completed'], default: 'booked' },
  createdAt: { type: Date, default: Date.now }
});
AppointmentSchema.index({ doctor: 1, slot: 1 }, { unique: true });
module.exports = mongoose.model('Appointment', AppointmentSchema);
