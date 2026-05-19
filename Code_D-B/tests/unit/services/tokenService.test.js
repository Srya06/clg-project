const jwt = require('jsonwebtoken');
const tokenService = require('../../../src/services/auth/tokenService');

describe('Token Service', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRE = '1h';
    process.env.JWT_REFRESH_SECRET = 'testrefreshsecret';
    process.env.JWT_REFRESH_EXPIRE = '7d';
  });

  it('should generate an access token', () => {
    const token = tokenService.generateAccessToken('user123', 'student');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('user123');
    expect(decoded.role).toBe('student');
  });

  it('should generate a refresh token', () => {
    const token = tokenService.generateRefreshToken('user123', 'student');
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    expect(decoded.id).toBe('user123');
  });

  it('should verify valid access token', () => {
    const token = tokenService.generateAccessToken('user123', 'student');
    const decoded = tokenService.verifyAccessToken(token);
    expect(decoded.id).toBe('user123');
  });

  it('should throw error for blacklisted access token', () => {
    const token = tokenService.generateAccessToken('user123', 'student');
    tokenService.blacklistToken(token);
    expect(() => {
      tokenService.verifyAccessToken(token);
    }).toThrow('Token is blacklisted');
  });
});
