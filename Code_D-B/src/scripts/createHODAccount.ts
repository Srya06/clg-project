/**
 * createHODAccount.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Secure admin script to create a HOD account directly in the database.
 * Run:  npx ts-node src/scripts/createHODAccount.ts
 *
 * HOD accounts CANNOT be created via public registration.
 * This is the ONLY legitimate way to provision a new HOD.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import readline from 'readline';
import User from '../models/User';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise((res) => rl.question(q, res));

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('\n❌ MONGODB_URI is not set in your .env file.\n');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('\n✅ Connected to MongoDB\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('       CREATE SECURE HOD ACCOUNT        ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const firstName  = (await ask('First Name   : ')).trim();
  const lastName   = (await ask('Last Name    : ')).trim();
  const email      = (await ask('Email        : ')).trim().toLowerCase();
  const password   = (await ask('Temp Password: ')).trim();
  const department = (await ask('Department   : ')).trim();

  if (!firstName || !lastName || !email || !password || !department) {
    console.error('\n❌ All fields are required.\n');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('\n❌ Password must be at least 8 characters.\n');
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.error(`\n❌ Email "${email}" already exists in the system.\n`);
    process.exit(1);
  }

  // User model's pre-save hook automatically hashes the password with bcrypt(12)
  const hod = await User.create({
    firstName,
    lastName,
    email,
    password,        // plain — will be hashed by pre-save hook
    role: 'hod',
    department,
    isVerified: true,
    forcePasswordChange: true,   // HOD must change on first login
    lastPasswordChange: new Date(),
  });

  rl.close();
  await mongoose.disconnect();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅  HOD Account Created Successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   ID         : ${hod._id}`);
  console.log(`   Name       : ${firstName} ${lastName}`);
  console.log(`   Email      : ${email}`);
  console.log(`   Department : ${department}`);
  console.log(`   Role       : hod`);
  console.log(`   Temp Pass  : ${password}`);
  console.log('\n⚠️  IMPORTANT: Share credentials securely.');
  console.log('   HOD will be FORCED to change password on first login.\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
