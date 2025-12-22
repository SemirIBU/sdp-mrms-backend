const Appointment = require("../models/Appointment");

module.exports = {
  async book(req, res) {
    try {
      const { doctorId, slot } = req.body;
      const Patient = require("../models/Patient");
      const patient = await Patient.findOne({ user: req.user.userId });
      if (!patient) return res.status(404).json({ error: "patient not found" });
      const ap = new Appointment({
        patient: patient._id,
        doctor: doctorId,
        slot: new Date(slot),
      });
      await ap.save();
      res.status(201).json(ap);
    } catch (e) {
      if (e.code === 11000)
        return res.status(409).json({ error: "slot already booked" });
      res.status(500).json({ error: e.message });
    }
  },

  async listMy(req, res) {
    try {
      const role = req.user.role;
      let query = {};
      if (role === "patient") {
        const Patient = require("../models/Patient");
        const patient = await Patient.findOne({ user: req.user.userId });
        if (patient) query.patient = patient._id;
      } else if (role === "doctor") {
        const Doctor = require("../models/Doctor");
        const doctor = await Doctor.findOne({ user: req.user.userId });
        if (doctor) query.doctor = doctor._id;
      }
      // admin sees all
      const list = await Appointment.find(query)
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name" },
        })
        .populate({
          path: "patient",
          populate: { path: "user", select: "name" },
        });
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  async cancel(req, res) {
    try {
      const ap = await Appointment.findById(req.params.id);
      if (!ap) return res.status(404).json({ error: "not found" });
      if (
        req.user.role !== "admin" &&
        String(ap.patient) !== String(req.user.userId)
      )
        return res.status(403).json({ error: "forbidden" });
      ap.status = "cancelled";
      await ap.save();
      res.json(ap);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  async available(req, res) {
    try {
      const { doctorId, date } = req.query;
      const start = new Date(date);
      start.setHours(9, 0, 0, 0);
      const end = new Date(date);
      end.setHours(17, 0, 0, 0);
      const booked = await Appointment.find({
        doctor: doctorId,
        slot: { $gte: start, $lt: end },
        status: { $ne: "cancelled" },
      }).select("slot");
      const bookedTimes = booked.map((b) => b.slot.getHours());
      const allTimes = [];
      for (let h = 9; h < 17; h++) allTimes.push(h);
      const available = allTimes.filter((h) => !bookedTimes.includes(h));
      res.json(available);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
