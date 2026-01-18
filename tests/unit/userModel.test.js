const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

describe('User Model Unit Tests', () => {
  it('should create a user with required fields', async () => {
    const userData = {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'patient',
      name: 'Test User'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.active).toBe(true); // Default value
    expect(savedUser.createdAt).toBeDefined();
  });

  it('should not create user without required fields', async () => {
    const user = new User({
      email: 'test@example.com'
    });

    await expect(user.save()).rejects.toThrow();
  });

  it('should not create user with duplicate email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'patient'
    };

    await User.create(userData);
    const duplicateUser = new User(userData);

    await expect(duplicateUser.save()).rejects.toThrow();
  });

  it('should only accept valid roles', async () => {
    const user = new User({
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'invalidrole'
    });

    await expect(user.save()).rejects.toThrow();
  });

  it('should store reset token and expiry', async () => {
    const user = await User.create({
      email: 'reset@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'patient',
      resetToken: 'test-token',
      resetExpires: new Date(Date.now() + 3600000)
    });

    expect(user.resetToken).toBe('test-token');
    expect(user.resetExpires).toBeDefined();
  });

  it('should allow deactivating user', async () => {
    const user = await User.create({
      email: 'deactivate@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'patient',
      active: false
    });

    expect(user.active).toBe(false);
  });
});
