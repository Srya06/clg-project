require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const { User, HODProfile } = require('../models');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = query => new Promise(resolve => rl.question(query, resolve));

const createHOD = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('\n--- Create HOD Account ---');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const email = await question('Email: ');
    const password = await question('Password (min 8 chars): ');
    const department = await question('Department: ');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\nError: Email already exists in the system.');
      process.exit(1);
    }

    const newHOD = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'hod',
      isVerified: true
    });

    await HODProfile.create({
      userId: newHOD._id,
      department
    });

    console.log(`\nSuccess! HOD Account created.`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (err) {
    console.error('\nCreation error:', err.message);
    process.exit(1);
  }
};

createHOD();
