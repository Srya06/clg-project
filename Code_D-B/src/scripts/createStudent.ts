import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/database';
import User from '../models/User';

const run = async () => {
    try {
        await connectDB();
        
        // Check if user already exists
        const existing = await User.findOne({ email: "mithunmourya.27@gmail.com" });
        if (existing) {
            console.log("User already exists!");
            process.exit(0);
        }

        const user = await User.create({
            email: "mithunmourya.27@gmail.com",
            password: "Password123!",
            firstName: "Mithun",
            lastName: "Mourya",
            role: "student",
            isEmailVerified: true
        });
        console.log("User created:", user.email);
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();
