const Patient = require('../models/Patient');
const User = require('../models/User');
const { requireFields } = require('../utils/validate');
module.exports = {
  async create(req,res){
    try{
      const missing = requireFields(req.body, ['user','uniqueCitizenIdentifier','dob']);
      if(missing.length) return res.status(400).json({ error:'missing', fields: missing });
      const u = await User.findById(req.body.user);
      if(!u) return res.status(404).json({ error: 'user not found' });
      const p = new Patient(req.body);
      await p.save();
      res.status(201).json(p);
    }catch(e){ res.status(500).json({ error: e.message }); }
  },
  async list(req,res){
    try{
      const list = await Patient.find().populate('user','email name');
      res.json(list);
    }catch(e){ res.status(500).json({ error: e.message }); }
  },
  async get(req,res){
    try{
      const p = await Patient.findById(req.params.id).populate('user','email name');
      if(!p) return res.status(404).json({ error: 'not found' });
      res.json(p);
    }catch(e){ res.status(500).json({ error: e.message }); }
  }
};
