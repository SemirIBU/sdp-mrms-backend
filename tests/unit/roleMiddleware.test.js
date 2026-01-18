const roleMiddleware = require('../../src/middlewares/role');

describe('Role Middleware Unit Tests', () => {
  it('should allow user with correct role', () => {
    const middleware = roleMiddleware(['admin', 'doctor']);
    
    const req = {
      user: { role: 'doctor' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should deny user without correct role', () => {
    const middleware = roleMiddleware(['admin', 'doctor']);
    
    const req = {
      user: { role: 'patient' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow admin role', () => {
    const middleware = roleMiddleware(['admin']);
    
    const req = {
      user: { role: 'admin' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle empty allowed roles', () => {
    const middleware = roleMiddleware([]);
    
    const req = {
      user: { role: 'admin' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
