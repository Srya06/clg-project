const mongoose = require('mongoose');
const { studentOneId } = require('./users');

const roadmapOneId = new mongoose.Types.ObjectId();

const roadmapOne = {
  _id: roadmapOneId,
  studentId: studentOneId,
  weekNumber: 1,
  tasks: [
    { _id: new mongoose.Types.ObjectId(), title: 'Learn React', description: 'Functional components', isCompleted: false },
    { _id: new mongoose.Types.ObjectId(), title: 'Learn Node', description: 'Express basics', isCompleted: true }
  ],
  status: 'in-progress'
};

const progressOne = {
  studentId: studentOneId,
  roadmapId: roadmapOneId,
  completedTasks: [roadmapOne.tasks[1]._id],
  completionPercentage: 50
};

module.exports = {
  roadmapOneId,
  roadmapOne,
  progressOne
};
