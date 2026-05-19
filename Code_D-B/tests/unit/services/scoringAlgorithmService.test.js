const scoringAlgorithmService = require('../../../src/services/scoring/scoringAlgorithmService');

describe('Scoring Algorithm Service', () => {
  it('should calculate total score correctly (30-30-20-20)', () => {
    const total = scoringAlgorithmService.calculateTotalScore({
      codingActivity: 100,
      projects: 100,
      problemSolving: 100,
      consistency: 100
    });
    expect(total).toBe(100);
  });

  it('should handle zero scores', () => {
    const total = scoringAlgorithmService.calculateTotalScore({
      codingActivity: 0,
      projects: 0,
      problemSolving: 0,
      consistency: 0
    });
    expect(total).toBe(0);
  });

  it('should use default 0s if fields omitted', () => {
    const total = scoringAlgorithmService.calculateTotalScore({
      codingActivity: 50,
      projects: 50
    });
    expect(total).toBe(30);
  });

  it('should round to 2 decimal places', () => {
    const total = scoringAlgorithmService.calculateTotalScore({
      codingActivity: 88,
      projects: 77,
      problemSolving: 91,
      consistency: 65
    });
    expect(total).toBe(80.7);
  });
});
