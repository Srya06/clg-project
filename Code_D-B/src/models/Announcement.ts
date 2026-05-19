import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetBranch?: string | null;
  targetYear?: number | null;
  createdBy: Types.ObjectId;
  acknowledgements: {
    studentId: Types.ObjectId;
    response: string;
    readAt: Date;
  }[];
  isArchived: boolean;
  expiresAt?: Date | null;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Announcement body is required'],
      maxlength: [5000, 'Body cannot exceed 5000 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    targetBranch: { type: String, default: null },
    targetYear: { type: Number, default: null },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acknowledgements: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User' },
        response: { type: String, maxlength: 500, default: '' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isArchived: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

announcementSchema.index({
  targetBranch: 1,
  targetYear: 1,
  isArchived: 1,
  createdAt: -1,
});

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema);
