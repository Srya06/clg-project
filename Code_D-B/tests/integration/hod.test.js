const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const HODProfile = require('../../src/models/HODProfile');
const Evaluation = require('../../src/models/Evaluation');
const tokenService = require('../../src/services/auth/tokenService');
const { hodOne, hodOneId, studentOne } = require('../fixtures/users');
const { evaluationOne } = require('../fixtures/evaluations');
require('../setup');

describe('HOD API Integration', () => {
  let hodToken;

  beforeEach(async () => {
    await User.create(studentOne);
    await User.create(hodOne);
    await HODProfile.create({ userId: hodOneId, department: 'CS' });
    hodToken = tokenService.generateAccessToken(hodOneId, 'hod');
  });

  it('GET /api/v1/hod/students - HOD authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/hod/students')
      .set('Authorization', `Bearer ${hodToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].email).toBe(studentOne.email);
  });

  it('GET /api/v1/hod/analytics - HOD authenticated', async () => {
    await Evaluation.create(evaluationOne);
    const res = await request(app)
      .get('/api/v1/hod/analytics')
      .set('Authorization', `Bearer ${hodToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.avgTotalScore).toBeDefined();
  });

  it('GET /api/v1/hod/top-performers - HOD authenticated', async () => {
    await Evaluation.create(evaluationOne);
    const res = await request(app)
      .get('/api/v1/hod/top-performers')
      .set('Authorization', `Bearer ${hodToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].grade).toBe('A');
  });
});
