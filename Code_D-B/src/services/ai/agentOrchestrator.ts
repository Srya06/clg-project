/**
 * AgentOrchestrator — Multi-agent AI pipeline (optimized)
 *
 * Optimizations vs original:
 * 1. Architect + Strategist collapsed into ONE prompt (was 2 sequential AI calls)
 * 2. YouTube video fetches are now fully parallel via Promise.allSettled
 * 3. Graceful fallback if YouTube quota is exceeded (skips videos, never fails)
 * 4. Academic monitoring agents are kept separate (they operate on real DB data)
 */
import { generateContent } from '../../utils/gemini';
import { logger } from '../../utils';
import youtubeService from '../youtubeService';
import { Attendance, Mark, User } from '../../models';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface RoadmapTask {
  title: string;
  description: string;
  video?: { videoId: string; title: string; thumbnail: string } | null;
}

interface RoadmapWeek {
  weekNumber: number;
  theme: string;
  careerInsight: string;
  tasks: RoadmapTask[];
  resources: string[];
}

// ─── JSON extraction helper ───────────────────────────────────────────────────
/**
 * Robust JSON extractor: handles markdown code fences, leading text, trailing junk.
 * Tries multiple strategies before throwing.
 */
function extractJson(raw: string): any {
  // Strategy 1: strip code fences
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Strategy 2: find the first '[' or '{' and last ']' or '}'
  const firstBracket = Math.min(
    cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('['),
    cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{')
  );
  if (firstBracket !== Infinity) {
    const isArray = cleaned[firstBracket] === '[';
    const lastBracket = isArray
      ? cleaned.lastIndexOf(']')
      : cleaned.lastIndexOf('}');
    if (lastBracket > firstBracket) {
      const slice = cleaned.slice(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(slice);
      } catch {
        // fall through to strategy 3
      }
    }
  }

  // Strategy 3: try the cleaned string directly
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Could not parse AI response as JSON. Raw: ${raw.slice(0, 200)}`);
  }
}

// ─── Orchestrator class ───────────────────────────────────────────────────────
class AgentOrchestrator {
  /**
   * Combined Architect + Strategist in ONE AI call.
   * Original had 2 sequential calls; this halves the Ollama latency.
   */
  private async buildRoadmapPlan(goal: string, context: any): Promise<RoadmapWeek[]> {
    const studentInfo = context
      ? `Student: branch=${context.branch || 'CS'}, year=${context.year || 1}, skills=${(context.skills || []).join(', ') || 'none'}, bio=${context.bio || ''}.`
      : '';

    const prompt = `You are an educational architect and career strategist.
${studentInfo}
Goal: ${goal}

Create a 4-week learning roadmap. For EACH week provide:
- weekNumber (1-4)
- theme (short title)
- careerInsight (1 sentence: why these skills matter for ${goal})
- tasks: array of 3 objects with title and description (2 sentences max each)
- resources: array of 2-3 resource names (books, sites, tools)

Respond ONLY with a valid JSON array. No markdown, no explanation:
[{"weekNumber":1,"theme":"...","careerInsight":"...","tasks":[{"title":"...","description":"..."}],"resources":["..."]}]`;

    const raw = await generateContent(prompt);
    const parsed = extractJson(raw);
    const weeks = Array.isArray(parsed) ? parsed : (parsed.roadmap || []);

    if (!Array.isArray(weeks) || weeks.length === 0) {
      throw new Error('AI returned empty or malformed roadmap');
    }

    return weeks as RoadmapWeek[];
  }

  /**
   * Enrich tasks with YouTube videos — ALL in parallel via Promise.allSettled.
   * If YouTube quota is exceeded, tasks still succeed (just without video).
   */
  private async enrichWithVideos(weeks: RoadmapWeek[], goal: string): Promise<RoadmapWeek[]> {
    // Collect all tasks with their positions so we can update them in parallel
    type TaskRef = { weekIdx: number; taskIdx: number; query: string };
    const taskRefs: TaskRef[] = [];

    for (let w = 0; w < weeks.length; w++) {
      for (let t = 0; t < (weeks[w].tasks?.length || 0); t++) {
        taskRefs.push({
          weekIdx: w,
          taskIdx: t,
          query: `${weeks[w].tasks[t].title} ${goal} tutorial beginner`,
        });
      }
    }

    // Fire ALL YouTube searches at once (was sequential before — 12 calls!)
    const results = await Promise.allSettled(
      taskRefs.map((ref) => youtubeService.searchVideos(ref.query, 1))
    );

    // Apply results back to their positions
    results.forEach((result, i) => {
      const { weekIdx, taskIdx } = taskRefs[i];
      if (result.status === 'fulfilled' && result.value?.[0]) {
        weeks[weekIdx].tasks[taskIdx].video = {
          videoId: result.value[0].videoId,
          title: result.value[0].title,
          thumbnail: result.value[0].thumbnail,
        };
      } else {
        weeks[weekIdx].tasks[taskIdx].video = null; // graceful fallback
        if (result.status === 'rejected') {
          logger.warn(`[YouTube] Skipped video for task: ${weeks[weekIdx].tasks[taskIdx].title}`);
        }
      }
    });

    return weeks;
  }

  /**
   * Master orchestrator for roadmap generation.
   * Single AI call + parallel YouTube = much faster than original.
   */
  async orchestrateRoadmap(goal: string, context: any): Promise<RoadmapWeek[]> {
    logger.info(`[Orchestrator] Building roadmap for goal: "${goal}"`);

    // Step 1: One AI call for full plan (architect + strategist combined)
    const plan = await this.buildRoadmapPlan(goal, context);
    logger.info(`[Orchestrator] Plan built: ${plan.length} weeks`);

    // Step 2: Parallel YouTube enrichment
    const enriched = await this.enrichWithVideos(plan, goal);
    logger.info(`[Orchestrator] YouTube enrichment complete`);

    return enriched;
  }

  // ── Academic Risk Analysis (unchanged — operates on real DB data) ─────────
  private async riskAgent(studentData: any): Promise<any> {
    const prompt = `You are an academic risk analyst.
Data: ${JSON.stringify(studentData)}

Analyze attendance and marks. Respond ONLY with raw JSON:
{"riskLevel":"LOW|MEDIUM|HIGH","reasoning":"brief reason","subjectsAtRisk":["subject1"]}`;

    const raw = await generateContent(prompt);
    return extractJson(raw);
  }

  private async counselingAgent(riskAnalysis: any, studentProfile: any): Promise<any> {
    const prompt = `You are an academic counselor.
Risk: ${JSON.stringify(riskAnalysis)}
Student: ${JSON.stringify(studentProfile)}

Provide encouraging, specific advice. Respond ONLY with raw JSON:
{"counselingMessage":"message here","actionPlan":["action1","action2","action3"]}`;

    const raw = await generateContent(prompt);
    return extractJson(raw);
  }

  /**
   * Master orchestrator for academic monitoring.
   */
  async monitorStudent(studentId: string) {
    logger.info(`[Orchestrator] Starting monitoring for student: ${studentId}`);

    const student = await User.findById(studentId);
    const attendance = await Attendance.find({ studentId }).sort({ date: -1 }).limit(20);
    const marks = await Mark.find({ studentId }).sort({ date: -1 });

    const context = {
      profile: {
        name: `${student?.firstName} ${student?.lastName}`,
        branch: student?.branch,
        semester: student?.year ? student.year * 2 : 0,
      },
      academicRecords: {
        attendanceCount: attendance.length,
        marksCount: marks.length,
        recentAttendance: attendance.map(a => ({ subject: a.subject, status: a.status, date: a.date })),
        recentMarks: marks.map(m => ({ subject: m.subject, type: m.type, score: m.score, maxScore: m.maxScore })),
      }
    };

    // Run risk + counseling sequentially (counseling needs risk output)
    const riskAnalysis = await this.riskAgent(context);
    logger.info(`[Orchestrator] Risk: ${riskAnalysis.riskLevel}`);

    const counseling = await this.counselingAgent(riskAnalysis, context.profile);
    logger.info(`[Orchestrator] Counseling generated`);

    return { ...riskAnalysis, ...counseling, analyzedAt: new Date() };
  }
}

export default new AgentOrchestrator();
