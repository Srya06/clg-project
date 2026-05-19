import axios from 'axios';
import { logger } from '../../utils';

export interface LeetCodeStats {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

class LeetcodeService {
  async fetchUserProfile(username: string): Promise<any> {
    try {
      const { data } = await axios.get(
        `https://leetcode-stats-api.herokuapp.com/${username}`
      );
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`LeetCode fetchUserProfile error: ${message}`);
      throw error;
    }
  }

  async fetchSolvedProblems(username: string): Promise<LeetCodeStats> {
    const profile = await this.fetchUserProfile(username);
    if (profile.status !== 'success') {
      throw new Error('LeetCode user not found or private');
    }
    return {
      easy: profile.easySolved,
      medium: profile.mediumSolved,
      hard: profile.hardSolved,
      total: profile.totalSolved,
    };
  }

  calculateProblemSolvingScore(data: LeetCodeStats): number {
    if (!data) return 0;

    const weightedScore = data.easy * 1 + data.medium * 3 + data.hard * 5;
    const score = Math.min((weightedScore / 500) * 100, 100); // 500 weighted points = 100%
    return Math.round(score);
  }
}

export default new LeetcodeService();
