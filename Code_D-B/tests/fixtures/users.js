const mongoose = require('mongoose');

const studentOneId = new mongoose.Types.ObjectId();
const studentTwoId = new mongoose.Types.ObjectId();
const hodOneId = new mongoose.Types.ObjectId();

const studentOne = {
  _id: studentOneId,
  firstName: 'Test',
  lastName: 'Student',
  email: 'test@student.com',
  password: 'password123',
  role: 'student',
  isVerified: true
};

const hodOne = {
  _id: hodOneId,
  firstName: 'Test',
  lastName: 'HOD',
  email: 'test@hod.com',
  password: 'password123',
  role: 'hod',
  isVerified: true
};

module.exports = {
  studentOneId,
  studentTwoId,
  hodOneId,
  studentOne,
  hodOne,
};
