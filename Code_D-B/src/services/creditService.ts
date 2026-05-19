import { User, Certificate, Roadmap, Attendance, Mark } from '../models';
import { logger } from '../utils';

class CreditService {
  /**
   * Recalculates and updates both total credits and academic ranking score
   */
  async updateStudentCredits(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // --- 1. GENERAL GAMIFICATION CREDITS (Additive) ---
      let totalCredits = 0;
      totalCredits += (user.publicRepos || 0) * 5;
      totalCredits += Math.floor((user.followers || 0) / 10) * 2;
      totalCredits += (user.leetcodeSolved || 0) * 1;
      
      const certCount = await Certificate.countDocuments({ userId, status: 'verified' });
      totalCredits += certCount * 50;

      if (user.cgpa) totalCredits += Math.floor(user.cgpa * 10);

      const activeRoadmap = await Roadmap.findOne({ studentId: userId, status: 'active' });
      if (activeRoadmap) {
        const completedWeeks = activeRoadmap.weeks.filter(w => 
          w.tasks.every(t => t.isCompleted)
        ).length;
        totalCredits += completedWeeks * 20;
      }

      // --- 2. ACADEMIC RANK SCORE (Weighted 40/30/30) ---
      // Scale: 0 - 100
      
      // A. Attendance (30%)
      const attendanceRecords = await Attendance.find({ studentId: userId });
      let attendanceScore = 0;
      if (attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
        const attendancePercentage = (presentCount / attendanceRecords.length);
        attendanceScore = attendancePercentage * 30;
      }

      // B. Marks (40%)
      const marksRecords = await Mark.find({ studentId: userId });
      let marksScore = 0;
      if (marksRecords.length > 0) {
        const totalPercentage = marksRecords.reduce((acc, m) => acc + (m.score / m.maxScore), 0);
        const avgPercentage = totalPercentage / marksRecords.length;
        marksScore = avgPercentage * 40;
      }

      // C. Certificates (30%)
      // Reward up to 3 verified certificates for full 30 points
      const certScore = Math.min(certCount * 10, 30);

      const academicRankScore = Math.round(attendanceScore + marksScore + certScore);

      // Update user document
      await User.findByIdAndUpdate(userId, { 
        credits: totalCredits,
        academicRankScore: academicRankScore
      });

      logger.info(`Updated scores for ${user.email}: Credits=${totalCredits}, RankScore=${academicRankScore}`);
      
      return { totalCredits, academicRankScore };
    } catch (error: any) {
      logger.error(`Failed to update scores for ${userId}: ${error.message}`);
    }
  }
}

export default new CreditService();
