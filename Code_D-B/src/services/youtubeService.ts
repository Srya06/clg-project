import axios from 'axios';
import { logger } from '../utils';

class YoutubeService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://www.googleapis.com/youtube/v3/search';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
  }

  async searchVideos(query: string, maxResults: number = 3): Promise<any[]> {
    if (!this.apiKey) {
      logger.warn('YouTube API Key is missing. Skipping video search.');
      return [];
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          part: 'snippet',
          q: query,
          maxResults,
          type: 'video',
          videoEmbeddable: 'true',
          key: this.apiKey,
        },
      });

      return response.data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=极${item.id.videoId}`,
      }));
    } catch (error: any) {
      logger.error('YouTube API Error:', error.response?.data?.error?.message || error.message);
      return [];
    }
  }
}

export default new YoutubeService();
