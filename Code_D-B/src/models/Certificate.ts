import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  courseName: string;
  provider: string;
  issueDate?: Date;
  certificateUrl: string;
  relevanceScore?: number;
  aiAnalysis?: string;
  status: 'pending' | 'verified' | 'rejected';
}

const certificateSchema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseName: { type: String, required: true },
    provider: { type: String, required: true },
    issueDate: { type: Date },
    certificateUrl: { type: String, required: true },
    relevanceScore: { type: Number, min: 0, max: 100 },
    aiAnalysis: { type: String },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICertificate>('Certificate', certificateSchema);
