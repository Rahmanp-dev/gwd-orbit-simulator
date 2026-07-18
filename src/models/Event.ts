import mongoose, { Schema, Document } from 'mongoose';

export interface IBroadcast {
  time: string;
  title: string;
  message: string;
  sentBy: string;
}

export interface IEvent extends Document {
  name: string;
  slug: string;
  status: 'draft' | 'registration' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  currentDay: number;
  totalDays: number;
  niches: mongoose.Types.ObjectId[];
  maxParticipants: number;
  registrationFee: number;
  totalParticipants: number;
  totalTeams: number;
  totalDealsSubmitted: number;
  totalDealsVerified: number;
  totalRevenue: number;
  /** Demo presentation mode — injects realistic data for sponsor walkthroughs */
  demoMode: boolean;
  /** System-wide broadcast messages history (max 20) */
  broadcastMessages: IBroadcast[];
  createdAt: Date;
  updatedAt: Date;
}

const BroadcastSchema = new Schema<IBroadcast>(
  {
    time: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    sentBy: { type: String, default: 'GWD Admin' },
  },
  { _id: false }
);

const EventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'registration', 'active', 'paused', 'completed'],
      default: 'draft',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    currentDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 9,
    },
    totalDays: {
      type: Number,
      default: 9,
    },
    niches: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Niche',
      },
    ],
    maxParticipants: {
      type: Number,
      required: true,
    },
    registrationFee: {
      type: Number,
      required: true,
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },
    totalTeams: {
      type: Number,
      default: 0,
    },
    totalDealsSubmitted: {
      type: Number,
      default: 0,
    },
    totalDealsVerified: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    demoMode: {
      type: Boolean,
      default: true,
    },
    broadcastMessages: {
      type: [BroadcastSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ status: 1 });

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
