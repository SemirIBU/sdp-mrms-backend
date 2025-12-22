const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { requireFields } = require('../utils/validate');
module.exports = {
  async create(req,res){
    try{
      const missing = requireFields(req.body, ['user']);
      if(missing.length) return res.status(400).json({ error:'missing', fields: missing });
      const u = await User.findById(req.body.user);
      if(!u) return res.status(404).json({ error: 'user not found' });
      const d = new Doctor(req.body);
      await d.save();
      res.status(201).json(d);
    }catch(e){ res.status(500).json({ error: e.message }); }
  },
  async list(req,res){
    try{
      const list = await Doctor.find().populate('user','email name');
      res.json(list);
    }catch(e){ res.status(500).json({ error: e.message }); }
  },
  async get(req,res){
    try{
      const d = await Doctor.findById(req.params.id).populate('user','email name');
      if(!d) return res.status(404).json({ error: 'not found' });
      res.json(d);
    }catch(e){ res.status(500).json({ error: e.message }); }
  }
};
