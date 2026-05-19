/**
 * OTP Model — stores hashed one-time passwords for email verification
 * TTL index auto-deletes documents after 10 minutes.
 */
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IOtp extends Document {
  email: string;
  hashedOtp: string;
  attempts: number;
  expiresAt: Date;
  compareOtp(candidateOtp: string): Promise<boolean>;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    hashedOtp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL — auto-deletes when expiresAt passes
    },
  },
  { timestamps: false }
);

otpSchema.methods.compareOtp = async function (candidateOtp: string): Promise<boolean> {
  return bcrypt.compare(candidateOtp, this.hashedOtp);
};

export default mongoose.model<IOtp>('Otp', otpSchema);
