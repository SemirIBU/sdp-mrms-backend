const Record = require('../models/Record');
const Patient = require('../models/Patient');
const path = require('path');
module.exports = {
  async create(req,res){
    try{
      const { patientId, title, description } = req.body;
      const patient = await Patient.findById(patientId);
      if(!patient) return res.status(404).json({ error: 'patient not found' });
      const files = (req.files||[]).map(f=>path.join('/uploads', path.basename(f.path)));
      const rec = new Record({ patient: patient._id, doctor: req.user.userId, title, description, files });
      await rec.save();
      patient.records.push(rec._id);
      await patient.save();
      res.status(201).json(rec);
    }catch(e){ res.status(500).json({ error: e.message }); }
  },
  async listByPatient(req,res){
    try{
      const rs = await Record.find({ patient: req.params.id }).populate('doctor','user');
      res.json(rs);
    }catch(e){ res.status(500).json({ error: e.message }); }
  },
  async get(req,res){
    try{
      const r = await Record.findById(req.params.id).populate('patient doctor');
      if(!r) return res.status(404).json({ error: 'not found' });
      res.json(r);
    }catch(e){ res.status(500).json({ error: e.message }); }
  }
};
