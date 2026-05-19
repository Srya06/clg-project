const mongoose = require('mongoose');
const { studentOneId } = require('./users');

const evaluationOneId = new mongoose.Types.ObjectId();

const evaluationOne = {
  _id: evaluationOneId,
  studentId: studentOneId,
  codingScore: 80,
  projectScore: 85,
  problemSolvingScore: 70,
  consistencyScore: 90,
  totalScore: 81.5,
  grade: 'A'
};

module.exports = {
  evaluationOneId,
  evaluationOne
};
