import { generateVisionContent } from '../utils/gemini';
import logger from '../utils/logger';

export interface CertificateDetails {
  courseName: string;
  provider: string;
  issueDate?: string;
  relevanceScore: number;
  analysis: string;
  isAuthentic: boolean;
}

class CertificateAnalyzer {
  /**
   * Analyzes a certificate image and extracts details
   */
  async analyze(imageBase64: string, mimeType: string, careerGoal: string): Promise<CertificateDetails> {
    const prompt = `
      You are an expert academic and career credential verifier. 
      Analyze the provided certificate image and extract the following details in JSON format:
      1. courseName: The exact name of the course or certification.
      2. provider: The organization that issued the certificate (e.g., Coursera, Udemy, Google, MIT).
      3. issueDate: The date of issue (if found, else null).
      4. isAuthentic: Boolean indicating if this looks like a valid certificate (based on layout, signatures, seals).
      5. relevanceScore: A score from 0-100 indicating how relevant this course is to the student's career goal of: "${careerGoal}".
      6. analysis: A 2-3 sentence explanation of why this course is or isn't valuable for the goal.

      IMPORTANT: Return ONLY raw JSON. No markdown.
    `;

    try {
      const response = await generateVisionContent(prompt, imageBase64, mimeType);
      
      // Clean the response
      const cleanJson = response.replace(/```json/gi, '').replace(/```/g, '').trim();
      const details = JSON.parse(cleanJson);
      
      logger.info(`AI Certificate Analysis complete for course: ${details.courseName}`);
      return details;
    } catch (error: any) {
      logger.error('Certificate AI Analysis failed:', error.message);
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
  }
}

export default new CertificateAnalyzer();
