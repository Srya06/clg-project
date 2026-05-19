/**
 * ChatbotService — AI Mentor chat (optimized for local Ollama)
 *
 * Optimizations:
 * - Compact system prompt (fewer input tokens = faster Ollama response)
 * - Structured response hint so model stays on topic
 */
import { generateContent } from '../../utils/gemini';
import { logger } from '../../utils';

class ChatbotService {
  async chat(message: string): Promise<string> {
    try {
      // Keep system prompt SHORT for Ollama — every token costs time
      const prompt = `AI academic mentor. Be concise, practical, encouraging. Max 3 paragraphs.

Student: ${message}

Answer:`;

      const text = await generateContent(prompt);
      return text.trim();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('AI chat error:', msg);
      throw new Error(msg || 'AI service temporarily unavailable');
    }
  }
}

export default new ChatbotService();
