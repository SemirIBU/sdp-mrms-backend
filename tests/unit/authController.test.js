const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const authController = require('../../src/controllers/authController');
const sgMail = require('@sendgrid/mail');

// Mock SendGrid
jest.mock('@sendgrid/mail');

describe('Auth Controller Unit Tests', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          role: 'patient',
          name: 'Test User'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.message).toBe('created');
      expect(jsonCall.id).toBeTruthy();

      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('patient');
    });

    it('should return error for missing fields', async () => {
      const req = {
        body: {
          email: 'test@example.com'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'missing fields'
        })
      );
    });

    it('should return error if user already exists', async () => {
      // Create existing user
      await User.create({
        email: 'existing@example.com',
        passwordHash: await bcrypt.hash('password', 10),
        role: 'patient'
      });

      const req = {
        body: {
          email: 'existing@example.com',
          password: 'password123',
          role: 'patient'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User exists' });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        email: 'login@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'doctor',
        name: 'Dr. Test',
        active: true
      });
    });

    it('should login successfully with valid credentials', async () => {
      const req = {
        body: {
          email: 'login@example.com',
          password: 'password123'
        }
      };
      const res = {
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'login@example.com',
            role: 'doctor',
            name: 'Dr. Test'
          })
        })
      );
    });

    it('should return error for invalid credentials', async () => {
      const req = {
        body: {
          email: 'login@example.com',
          password: 'wrongpassword'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'invalid credentials' });
    });

    it('should return error for non-existent user', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'invalid credentials' });
    });

    it('should return error for inactive user', async () => {
      await User.create({
        email: 'inactive@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'patient',
        active: false
      });

      const req = {
        body: {
          email: 'inactive@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'account deactivated' });
    });
  });

  describe('forgotPassword', () => {
    beforeEach(() => {
      sgMail.send.mockClear();
      sgMail.send.mockResolvedValue([{ statusCode: 202 }]);
    });

    it('should send reset email for existing user', async () => {
      await User.create({
        email: 'reset@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'patient'
      });

      const req = {
        body: {
          email: 'reset@example.com'
        }
      };
      const res = {
        json: jest.fn()
      };

      await authController.forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'If email exists, reset link sent'
      });
      expect(sgMail.send).toHaveBeenCalled();

      // Verify reset token was saved
      const user = await User.findOne({ email: 'reset@example.com' });
      expect(user.resetToken).toBeTruthy();
      expect(user.resetExpires).toBeTruthy();
    });

    it('should return generic message for non-existent user', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com'
        }
      };
      const res = {
        json: jest.fn()
      };

      await authController.forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'If email exists, reset link sent'
      });
      expect(sgMail.send).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const resetToken = 'valid-reset-token';
      await User.create({
        email: 'reset@example.com',
        passwordHash: await bcrypt.hash('oldpassword', 10),
        role: 'patient',
        resetToken: resetToken,
        resetExpires: Date.now() + 3600000
      });

      const req = {
        body: {
          token: resetToken,
          newPassword: 'newpassword123'
        }
      };
      const res = {
        json: jest.fn()
      };

      await authController.resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset successfully'
      });

      // Verify password was changed
      const user = await User.findOne({ email: 'reset@example.com' });
      const isValid = await bcrypt.compare('newpassword123', user.passwordHash);
      expect(isValid).toBe(true);
      expect(user.resetToken).toBeUndefined();
      expect(user.resetExpires).toBeUndefined();
    });

    it('should return error for invalid token', async () => {
      const req = {
        body: {
          token: 'invalid-token',
          newPassword: 'newpassword123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
    });

    it('should return error for expired token', async () => {
      const resetToken = 'expired-token';
      await User.create({
        email: 'expired@example.com',
        passwordHash: await bcrypt.hash('oldpassword', 10),
        role: 'patient',
        resetToken: resetToken,
        resetExpires: Date.now() - 1000 // Expired
      });

      const req = {
        body: {
          token: resetToken,
          newPassword: 'newpassword123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
    });
  });
});
