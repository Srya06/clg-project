const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
require('../setup');

describe('Auth API Integration', () => {
  it('POST /api/v1/auth/register - success case', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'student'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('jane@example.com');
  });

  it('POST /api/v1/auth/register - duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send({
      firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', password: 'password123', role: 'student'
    });
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'John', lastName: 'Smith', email: 'jane@example.com', password: 'password123', role: 'student'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login - success case', async () => {
    await User.create({ firstName: 'User', lastName: 'Test', email: 'login@test.com', password: 'password123', role: 'student' });
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@test.com',
      password: 'password123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/login - invalid credentials', async () => {
    await User.create({ firstName: 'User', lastName: 'Test', email: 'invalid@test.com', password: 'password123', role: 'student' });
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'invalid@test.com',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/v1/auth/refresh - valid token', async () => {
    const tokenService = require('../../src/services/auth/tokenService');
    const refreshToken = tokenService.generateRefreshToken('temp_id', 'student');
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/logout - valid session', async () => {
    const res = await request(app).post('/api/v1/auth/logout').send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });
});
