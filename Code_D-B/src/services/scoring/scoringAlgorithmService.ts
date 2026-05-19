import { constants, helpers } from '../../utils';

const { SCORE_WEIGHTS } = constants;
const { roundToTwo } = helpers;

interface ScoreInputs {
  codingActivity?: number;
  projects?: number;
  problemSolving?: number;
  consistency?: number;
}

class ScoringAlgorithmService {
  /**
   * Calculates a student's overall score using the weighted formula.
   */
  calculateTotalScore({
    codingActivity = 0,
    projects = 0,
    problemSolving = 0,
    consistency = 0,
  }: ScoreInputs): number {
    const score =
      (codingActivity * SCORE_WEIGHTS.coding) / 100 +
      (projects * SCORE_WEIGHTS.projects) / 100 +
      (problemSolving * SCORE_WEIGHTS.problemSolving) / 100 +
      (consistency * SCORE_WEIGHTS.consistency) / 100;

    return roundToTwo(score);
  }
}

export default new ScoringAlgorithmService();
