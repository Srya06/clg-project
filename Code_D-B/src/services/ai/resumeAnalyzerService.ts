import { generateContent } from '../../utils/gemini';
import { logger } from '../../utils';

export interface ResumeAnalysisResult {
  score: number;
  skills: string[];
  gaps: string[];
  match: string;
}

class ResumeAnalyzerService {
  async analyzeFullResume(
    resumeText: string,
    targetRole: string
  ): Promise<ResumeAnalysisResult> {
    try {
      const text = await generateContent(
        `You are an expert technical recruiter. Analyze the following resume for the role of "${targetRole}".
Resume: """${resumeText}"""

Respond ONLY with raw JSON (no markdown):
{
  "score": 85,
  "skills": ["React", "Node.js"],
  "gaps": ["Kubernetes", "AWS"],
  "match": "85% match for ${targetRole}"
}`
      );
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as ResumeAnalysisResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Error analyzing resume:', message);
      throw error;
    }
  }
}

export default new ResumeAnalyzerService();
