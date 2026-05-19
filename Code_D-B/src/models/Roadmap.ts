import mongoose, { Schema } from 'mongoose';
import { IRoadmap } from '../types/models';

const roadmapSchema = new Schema<IRoadmap>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    title: { type: String, required: true },
    targetRole: { type: String, required: true },
    weeks: [
      {
        weekNumber: { type: Number, required: true },
        theme: { type: String },
        careerInsight: { type: String },
        tasks: [
          {
            title: { type: String, required: true },
            description: { type: String },
            isCompleted: { type: Boolean, default: false },
            video: {
              videoId: { type: String },
              title: { type: String },
              thumbnail: { type: String },
            },
          },
        ],
        resources: [String],
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    currentWeek: { type: Number, default: 1 },
    completionPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

roadmapSchema.index({ studentId: 1, status: 1 });

export default mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
