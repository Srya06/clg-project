const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const StudentProfile = require('../../src/models/StudentProfile');
const Roadmap = require('../../src/models/Roadmap');
const Evaluation = require('../../src/models/Evaluation');
const tokenService = require('../../src/services/auth/tokenService');
const { studentOne, studentOneId } = require('../fixtures/users');
const { roadmapOne } = require('../fixtures/roadmaps');
const { evaluationOne } = require('../fixtures/evaluations');
require('../setup');

describe('Student API Integration', () => {
  let token;

  beforeEach(async () => {
    await User.create(studentOne);
    await StudentProfile.create({ userId: studentOneId });
    token = tokenService.generateAccessToken(studentOneId, 'student');
  });

  it('GET /api/v1/student/profile - authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/student/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.userId.email).toBe(studentOne.email);
  });

  it('PUT /api/v1/student/profile - authenticated', async () => {
    const res = await request(app)
      .put('/api/v1/student/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ CGPA: 9.0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.CGPA).toBe(9.0);
  });

  it('GET /api/v1/student/roadmap - has roadmap', async () => {
    await Roadmap.create(roadmapOne);
    const res = await request(app)
      .get('/api/v1/student/roadmap')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('in-progress');
  });

  it('GET /api/v1/student/score - has evaluation', async () => {
    await Evaluation.create(evaluationOne);
    const res = await request(app)
      .get('/api/v1/student/score')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.grade).toBe('A');
  });
});
