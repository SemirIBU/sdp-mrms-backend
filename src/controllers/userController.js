const User = require('../models/User');
const { requireFields } = require('../utils/validate');

module.exports = {
  async list(req, res) {
    try {
      const users = await User.find({}, '-passwordHash -resetToken -resetExpires');
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  async get(req, res) {
    try {
      const user = await User.findById(req.params.id, '-passwordHash -resetToken -resetExpires');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  async update(req, res) {
    try {
      const { name, email, role, active } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role, active },
        { new: true, runValidators: true }
      ).select('-passwordHash -resetToken -resetExpires');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  async toggleActive(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.active = !user.active;
      await user.save();
      res.json({ active: user.active });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};