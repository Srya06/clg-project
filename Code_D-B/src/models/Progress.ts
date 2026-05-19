import mongoose, { Schema } from 'mongoose';
import { IProgress } from '../types/models';

const progressSchema = new Schema<IProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'Roadmap ID is required'],
    },
    taskId: {
      type: String,
      required: [true, 'Task ID is required'],
    },
    completedAt: { type: Date, default: Date.now },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

progressSchema.index(
  { studentId: 1, roadmapId: 1, taskId: 1 },
  { unique: true }
);

export default mongoose.model<IProgress>('Progress', progressSchema);
