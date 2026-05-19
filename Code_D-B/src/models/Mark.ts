import mongoose, { Schema, Document } from 'mongoose';

export interface IMark extends Document {
  studentId: mongoose.Types.ObjectId;
  subject: string;
  type: 'internal' | 'external' | 'assignment' | 'lab';
  score: number;
  maxScore: number;
  semester: number;
  date: Date;
  recordedBy: mongoose.Types.ObjectId;
  comments?: string;
}

const markSchema = new Schema<IMark>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['internal', 'external', 'assignment', 'lab'],
      required: [true, 'Examination type is required'],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum score is required'],
      default: 100,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by ID is required'],
    },
    comments: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
markSchema.index({ studentId: 1, subject: 1, semester: 1 });
markSchema.index({ type: 1 });

export default mongoose.model<IMark>('Mark', markSchema);
