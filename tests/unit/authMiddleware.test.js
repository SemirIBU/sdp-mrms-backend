const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middlewares/auth');
const { JWT_SECRET } = require('../../src/config');

describe('Auth Middleware Unit Tests', () => {
  it('should authenticate valid token', () => {
    const userId = 'test-user-id';
    const role = 'doctor';
    const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.user.userId).toBe(userId);
    expect(req.user.role).toBe(role);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject request without token', () => {
    const req = {
      headers: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject expired token', () => {
    const token = jwt.sign(
      { userId: 'test-user', role: 'patient' },
      JWT_SECRET,
      { expiresIn: '0s' }
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    // Wait a bit to ensure token expires
    setTimeout(() => {
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    }, 100);
  });

  it('should handle malformed authorization header', () => {
    const req = {
      headers: {
        authorization: 'InvalidFormat'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
