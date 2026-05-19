import { generateContent } from '../../utils/gemini';
import { logger } from '../../utils';

export interface RecommendedResource {
  title: string;
  type: 'article' | 'video' | 'course';
  url: string;
}

export const recommendResources = async (
  topic: string,
  difficulty = 'beginner'
): Promise<RecommendedResource[]> => {
  try {
    const text = await generateContent(
      `You are a technical resource recommender. Provide 3 specific learning resources for learning "${topic}" at a "${difficulty}" level.
Return ONLY raw JSON in this exact format:
[
  { "title": "...", "type": "article|video|course", "url": "..." },
  { "title": "...", "type": "article|video|course", "url": "..." },
  { "title": "...", "type": "article|video|course", "url": "..." }
]`
    );
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as RecommendedResource[];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error generating AI recommendations:', message);
    return [];
  }
};
