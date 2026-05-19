import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  description: string;
  type: 'student' | 'faculty';
  category: 'competition' | 'research' | 'certification' | 'patent' | 'other';
  date: Date;
  winnerName: string;
  winnerId?: mongoose.Types.ObjectId; // Optional link to User model
  image?: string;
  isFeatured: boolean;
}

const achievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['student', 'faculty'], required: true },
    category: {
      type: String,
      enum: ['competition', 'research', 'certification', 'patent', 'other'],
      default: 'competition',
    },
    date: { type: Date, required: true },
    winnerName: { type: String, required: true },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAchievement>('Achievement', achievementSchema);
