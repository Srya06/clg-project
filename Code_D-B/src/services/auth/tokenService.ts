import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

// Simple blacklist in-memory store
const blacklistedTokens = new Set<string>();

class TokenService {
  generateAccessToken(userId: string | Types.ObjectId, role: string): string {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRE as any,
    });
  }

  generateRefreshToken(userId: string | Types.ObjectId, role: string): string {
    return jwt.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE as any,
    });
  }

  verifyAccessToken(token: string): string | JwtPayload {
    if (blacklistedTokens.has(token)) throw new Error('Token is blacklisted');
    return jwt.verify(token, process.env.JWT_SECRET!);
  }

  verifyRefreshToken(token: string): string | JwtPayload {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  }

  blacklistToken(token: string): boolean {
    blacklistedTokens.add(token);
    return true;
  }
}

export default new TokenService();
