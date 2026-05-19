/**
 * RoadmapGeneratorService — Standalone roadmap generator (optimized).
 *
 * Used when the orchestrator is overkill (e.g. simple re-generation).
 * Parallelizes all YouTube fetches for maximum throughput.
 */
import { generateContent } from '../../utils/gemini';
import { logger } from '../../utils';
import youtubeService from '../youtubeService';

export interface GeneratedRoadmapWeek {
  weekNumber: number;
  theme?: string;
  tasks: {
    title: string;
    description: string;
    video?: {
      videoId: string;
      title: string;
      thumbnail: string;
    } | null;
  }[];
  resources: string[];
}

class RoadmapGeneratorService {
  async generateRoadmap(goal: string, context?: any): Promise<GeneratedRoadmapWeek[]> {
    try {
      const studentInfo = context
        ? `Student: branch=${context.branch}, year=${context.year}, skills=${(context.skills || []).join(', ') || 'none'}.`
        : '';

      const prompt = `Generate a 4-week learning roadmap.
Goal: ${goal}
${studentInfo}

Focus on practical skills. Skip anything the student already knows.
Respond ONLY with valid raw JSON:
{"roadmap":[{"weekNumber":1,"theme":"short title","tasks":[{"title":"...","description":"..."}],"resources":["..."]}]}
No markdown. No explanation.`;

      const text = await generateContent(prompt);

      // Robust JSON extraction
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      const jsonStr = firstBrace !== -1 && lastBrace > firstBrace
        ? cleaned.slice(firstBrace, lastBrace + 1)
        : cleaned;

      const result = JSON.parse(jsonStr);
      const roadmap = (result.roadmap || result || []) as GeneratedRoadmapWeek[];

      if (!Array.isArray(roadmap) || roadmap.length === 0) {
        throw new Error('Empty roadmap returned by AI');
      }

      // ── Parallel YouTube enrichment (was sequential!) ────────────────────
      type VideoRef = { weekIdx: number; taskIdx: number; query: string };
      const refs: VideoRef[] = [];

      for (let w = 0; w < roadmap.length; w++) {
        for (let t = 0; t < (roadmap[w].tasks?.length || 0); t++) {
          refs.push({
            weekIdx: w,
            taskIdx: t,
            query: `${roadmap[w].tasks[t].title} ${goal} tutorial`,
          });
        }
      }

      const videoResults = await Promise.allSettled(
        refs.map((r) => youtubeService.searchVideos(r.query, 1))
      );

      videoResults.forEach((res, i) => {
        const { weekIdx, taskIdx } = refs[i];
        if (res.status === 'fulfilled' && res.value?.[0]) {
          roadmap[weekIdx].tasks[taskIdx].video = {
            videoId: res.value[0].videoId,
            title: res.value[0].title,
            thumbnail: res.value[0].thumbnail,
          };
        } else {
          roadmap[weekIdx].tasks[taskIdx].video = null;
        }
      });

      return roadmap;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error generating roadmap:', message);
      throw error;
    }
  }
}

export default new RoadmapGeneratorService();
