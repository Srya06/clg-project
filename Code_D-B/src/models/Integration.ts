import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IIntegration extends Document {
  studentId: Types.ObjectId;
  githubToken?: string;
  githubSyncedAt?: Date;
  leetcodeUsername?: string;
  lastSyncedAt?: Date;
}

const integrationSchema = new Schema<IIntegration>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required for integrations'],
      unique: true,
    },
    githubToken: { type: String, trim: true },
    githubSyncedAt: { type: Date },
    leetcodeUsername: {
      type: String,
      trim: true,
      maxlength: [50, 'LeetCode username cannot exceed 50 characters'],
    },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

integrationSchema.index({ leetcodeUsername: 1 });

export default mongoose.model<IIntegration>('Integration', integrationSchema);
