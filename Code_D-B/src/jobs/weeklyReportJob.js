const User = require('../models/User');
const Progress = require('../models/Progress');
const emailService = require('../services/notifications/emailService');
const logger = require('../utils/logger');
const axios = require('axios');

const weeklyReportJob = async () => {
  try {
    const students = await User.find({ role: 'student' });
    
    let summaries = [];
    for (const student of students) {
      const activeProgress = await Progress.find({ studentId: student._id })
                                           .sort('-lastUpdated')
                                           .limit(1)
                                           .populate('roadmapId');
      
      const progressData = activeProgress.length > 0 ? activeProgress[0] : null;
      if (progressData) {
          await emailService.sendWeeklyProgressEmail(student.email, progressData);
          summaries.push({ studentId: student._id, completed: progressData.completedTasks.length });
      }
    }

    if (process.env.N8N_WEBHOOK_URL) {
       await axios.post(process.env.N8N_WEBHOOK_URL, {
          event: 'weekly_report_generated',
          totalStudents: students.length,
          activeSummaries: summaries.length
       }).catch(e => logger.warn(`n8n Webhook failed: ${e.message}`));
    }
    
    // Create HOD summary report log
    logger.info(`WeeklyReportJob: Processed ${summaries.length} student reports and generated HOD summary insights.`);
  } catch (error) {
    logger.error(`WeeklyReportJob Error: ${error.message}`);
  }
};

module.exports = weeklyReportJob;
