require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('--- USER LIST ---');
  users.forEach(u => {
    console.log(`Email: ${u.email}, Role: ${u.role}, Verified: ${u.isVerified}`);
  });
  process.exit(0);
}

check();
