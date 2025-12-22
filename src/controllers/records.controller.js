const Record = require("../models/Record.js");

module.exports = {
  async getRecords(req, res) {
    const role = req.user.role;
    const userId = req.user.userId;

    let filter = {};
    if (role === "doctor") {
      const Doctor = require("../models/Doctor.js");
      const doctor = await Doctor.findOne({ user: userId });
      if (doctor) filter.doctor = doctor._id;
    }
    if (role === "patient") {
      const Patient = require("../models/Patient.js");
      const patient = await Patient.findOne({ user: userId });
      if (patient) filter.patient = patient._id;
    }

    const records = await Record.find(filter)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(records);
  },
  async createRecord(req, res) {
    const { patient, title, description } = req.body;

    let doctorId = null;
    if (req.user.role === "doctor") {
      const Doctor = require("../models/Doctor.js");
      const doctor = await Doctor.findOne({ user: req.user.userId });
      if (doctor) doctorId = doctor._id;
    }

    const record = await Record.create({
      patient,
      doctor: doctorId,
      title,
      description,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json(record);
  },
};
