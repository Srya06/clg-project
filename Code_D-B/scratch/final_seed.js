require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const accounts = [
    {
      firstName: 'Academic',
      lastName: 'Teacher',
      email: 'teacher@academ.os',
      password: hashedPassword,
      role: 'teacher',
      isVerified: true,
      department: 'CSE-AI',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      firstName: 'Academic',
      lastName: 'Student',
      email: 'student@academ.os',
      password: hashedPassword,
      role: 'student',
      isVerified: true,
      department: 'CSE-AI',
      credits: 0,
      academicRankScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const account of accounts) {
    const existing = await db.collection('users').findOne({ email: account.email });
    if (existing) {
      await db.collection('users').updateOne({ _id: existing._id }, { $set: account });
      console.log(`Updated: ${account.email}`);
    } else {
      await db.collection('users').insertOne(account);
      console.log(`Inserted: ${account.email}`);
    }
  }

  process.exit(0);
}

seed();
