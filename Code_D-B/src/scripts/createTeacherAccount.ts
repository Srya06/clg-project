import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models';

const createTeacher = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI is not defined in .env');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const accounts = [
      {
        firstName: 'Academic',
        lastName: 'Teacher',
        email: 'teacher@academ.os',
        password: 'password123',
        role: 'teacher',
        isVerified: true,
        department: 'CSE-AI'
      },
      {
        firstName: 'Academic',
        lastName: 'Student',
        email: 'student@academ.os',
        password: 'password123',
        role: 'student',
        isVerified: true,
        department: 'CSE-AI'
      }
    ];

    for (const data of accounts) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        console.log(`Account ${data.email} already exists, skipping.`);
        continue;
      }
      await User.create(data);
      console.log(`Created account: ${data.email}`);
    }

    console.log('\n--- Seed Complete ---');
    console.log('Password for all: password123');
    console.log('---------------------\n');

    
    process.exit(0);
  } catch (err: any) {
    console.error('\nCreation error:', err.message);
    process.exit(1);
  }
};

createTeacher();
