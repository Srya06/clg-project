import axios from 'axios';
import { logger } from '../../utils';

class GithubService {
  async fetchUserProfile(token: string): Promise<any> {
    try {
      const { data } = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`GitHub fetchUserProfile error: ${message}`);
      throw error;
    }
  }

  async fetchRepositories(token: string): Promise<any[]> {
    try {
      const { data } = await axios.get(
        'https://api.github.com/user/repos?per_page=100',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`GitHub fetchRepositories error: ${message}`);
      throw error;
    }
  }

  async fetchCommitActivity(token: string, username: string): Promise<any[]> {
    try {
      const { data } = await axios.get(
        `https://api.github.com/users/${username}/events/public`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data.filter((event: any) => event.type === 'PushEvent');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`GitHub fetchCommitActivity error: ${message}`);
      throw error;
    }
  }

  calculateCodingScore(activityData: any[]): number {
    if (!activityData || activityData.length === 0) return 0;

    const commitsCount = activityData.reduce(
      (acc, event) => acc + (event.payload.commits ? event.payload.commits.length : 0),
      0
    );
    const score = Math.min((commitsCount / 50) * 100, 100); // Baseline: 50 commits = 100 points
    return Math.round(score);
  }
}

export default new GithubService();
