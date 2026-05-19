import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  subject: string;
  date: Date;
  status: 'present' | 'absent';
  semester: number;
  session?: string;
  recordedBy: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>(
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
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: [true, 'Status is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
    },
    session: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
attendanceSchema.index({ studentId: 1, subject: 1, date: 1 });
attendanceSchema.index({ recordedBy: 1 });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
