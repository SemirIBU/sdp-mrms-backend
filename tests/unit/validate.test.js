const { requireFields } = require('../../src/utils/validate');

describe('Validate Utils Unit Tests', () => {
  describe('requireFields', () => {
    it('should return empty array when all fields present', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        role: 'patient'
      };
      const required = ['email', 'password', 'role'];

      const missing = requireFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should return missing fields', () => {
      const data = {
        email: 'test@example.com'
      };
      const required = ['email', 'password', 'role'];

      const missing = requireFields(data, required);

      expect(missing).toEqual(['password', 'role']);
    });

    it('should handle null and undefined values as missing', () => {
      const data = {
        email: 'test@example.com',
        password: null,
        role: undefined
      };
      const required = ['email', 'password', 'role'];

      const missing = requireFields(data, required);

      expect(missing).toEqual(['password', 'role']);
    });

    it('should handle empty strings as present', () => {
      const data = {
        email: '',
        password: 'password123'
      };
      const required = ['email', 'password'];

      const missing = requireFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should handle empty required array', () => {
      const data = {
        email: 'test@example.com'
      };
      const required = [];

      const missing = requireFields(data, required);

      expect(missing).toEqual([]);
    });
  });
});
