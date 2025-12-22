const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require('@sendgrid/mail');
const User = require("../models/User");
const { JWT_SECRET, SENDGRID_API_KEY, EMAIL_FROM } = require("../config");
const { requireFields } = require("../utils/validate");

sgMail.setApiKey(SENDGRID_API_KEY);
module.exports = {
  async register(req, res) {
    try {
      const missing = requireFields(req.body, ["email", "password", "role"]);
      if (missing.length)
        return res
          .status(400)
          .json({ error: "missing fields", fields: missing });
      const { email, password, role, name } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: "User exists" });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({ email, passwordHash, role, name });
      await user.save();
      res.status(201).json({ message: "created", id: user._id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  async login(req, res) {
    try {
      const missing = requireFields(req.body, ["email", "password"]);
      if (missing.length)
        return res
          .status(400)
          .json({ error: "missing fields", fields: missing });
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: "invalid credentials" });
      if (!user.active) return res.status(401).json({ error: "account deactivated" });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "invalid credentials" });
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "8h" }
      );
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.json({ message: "If email exists, reset link sent" });
      const token = crypto.randomBytes(32).toString('hex');
      user.resetToken = token;
      user.resetExpires = Date.now() + 3600000; // 1 hour
      await user.save();
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      const msg = {
        to: email,
        from: EMAIL_FROM,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset for your MRMS account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };
      await sgMail.send(msg);
      res.json({ message: "If email exists, reset link sent" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  },
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now() } });
      if (!user) return res.status(400).json({ error: "Invalid or expired token" });
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      user.resetToken = undefined;
      user.resetExpires = undefined;
      await user.save();
      res.json({ message: "Password reset successfully" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
