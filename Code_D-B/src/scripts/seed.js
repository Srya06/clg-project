const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Integration = require('../models/Integration');
const bcrypt = require('bcryptjs');

const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in environment');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    // Clear existing seed data (optional, but good for clean tests)
    // await User.deleteMany({ email: /@test.com/ });

    console.log('Seeding HOD...');
    const hodPassword = await bcrypt.hash('password123', 12);
    const hod = await User.create({
      firstName: 'Dr. Sarah',
      lastName: 'Informatics',
      email: 'hod@test.com',
      password: 'password123', // Model hook will hash this usually, but doing it manually to be safe
      role: 'hod',
      department: 'Computer Science',
      isVerified: true
    });

    console.log('Seeding Students...');
    const student1 = await User.create({
      firstName: 'Surya',
      lastName: 'Pratap',
      email: 'surya@test.com',
      password: 'password123',
      role: 'student',
      branch: 'CSE',
      year: 3,
      cgpa: 8.5,
      isVerified: true,
      currentLevel: 'Intermediate',
      skills: ['React', 'Node.js', 'Python'],
      careerGoal: 'Full Stack Developer'
    });

    const student2 = await User.create({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul@test.com',
      password: 'password123',
      role: 'student',
      branch: 'ECE',
      year: 2,
      cgpa: 7.2,
      isVerified: true,
      currentLevel: 'Beginner'
    });

    // Create Integrations
    await Integration.create({ studentId: student1._id, leetcodeUsername: 'surya_dev' });
    await Integration.create({ studentId: student2._id });

    console.log('Seeding complete! Logins: hod@test.com / surya@test.com (pass: password123)');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
