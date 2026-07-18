import mongoose, { Schema, Document } from 'mongoose';

export interface IEventSnapshot extends Document {
  eventId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  snapshotData: any;
  collectionCounts: {
    events: number;
    users: number;
    teams: number;
    deals: number;
    scores: number;
    leads: number;
    niches: number;
    notifications: number;
    dailyBriefings: number;
    judgeReviews: number;
    awards: number;
    clientContacts: number;
    teamMessages: number;
  };
  sizeBytes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSnapshotSchema = new Schema<IEventSnapshot>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    snapshotData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    collectionCounts: {
      events: { type: Number, default: 0 },
      users: { type: Number, default: 0 },
      teams: { type: Number, default: 0 },
      deals: { type: Number, default: 0 },
      scores: { type: Number, default: 0 },
      leads: { type: Number, default: 0 },
      niches: { type: Number, default: 0 },
      notifications: { type: Number, default: 0 },
      dailyBriefings: { type: Number, default: 0 },
      judgeReviews: { type: Number, default: 0 },
      awards: { type: Number, default: 0 },
      clientContacts: { type: Number, default: 0 },
      teamMessages: { type: Number, default: 0 },
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

EventSnapshotSchema.index({ eventId: 1, createdAt: -1 });

const EventSnapshot =
  mongoose.models.EventSnapshot ||
  mongoose.model<IEventSnapshot>('EventSnapshot', EventSnapshotSchema);

export default EventSnapshot;
