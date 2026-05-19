import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  type: 'hackathon' | 'workshop' | 'conference' | 'webinar' | 'other';
  date: Date;
  location: string;
  link?: string;
  image?: string;
  postedBy: mongoose.Types.ObjectId;
  isArchived: boolean;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['hackathon', 'workshop', 'conference', 'webinar', 'other'],
      default: 'hackathon',
    },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    link: { type: String },
    image: { type: String },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', eventSchema);
