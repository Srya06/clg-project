import { Types } from 'mongoose';

class SessionService {
  private sessions: Map<string, string>;

  constructor() {
    this.sessions = new Map<string, string>();
  }

  createSession(userId: string | Types.ObjectId): string {
    const sessionId = `session_${Date.now()}_${userId}`;
    this.sessions.set(userId.toString(), sessionId);
    return sessionId;
  }

  invalidateSession(userId: string | Types.ObjectId): boolean {
    this.sessions.delete(userId.toString());
    return true;
  }
}

export default new SessionService();
