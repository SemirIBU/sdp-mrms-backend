const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    fileUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", RecordSchema);
