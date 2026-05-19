import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  topic: string;
  type: 'video' | 'article' | 'course';
  url: string;
  source?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

const resourceSchema = new Schema<IResource>(
  {
    topic: {
      type: String,
      required: [true, 'Topic is required for a resource'],
      trim: true,
      maxlength: [100, 'Topic cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['video', 'article', 'course'],
        message: 'Resource type must be video, article, or course',
      },
      required: [true, 'Resource type is required'],
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      match: [/^https?:\/\/.*/, 'Please enter a valid URL'],
    },
    source: {
      type: String,
      trim: true,
      maxlength: [100, 'Source name cannot exceed 100 characters'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Difficulty must be beginner, intermediate, or advanced',
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag cannot exceed 30 characters'],
      },
    ],
  },
  { timestamps: true }
);

resourceSchema.index({ topic: 1, difficulty: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ type: 1 });

export default mongoose.model<IResource>('Resource', resourceSchema);
