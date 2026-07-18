import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  emoji: string;
  eventId: mongoose.Types.ObjectId;
  nicheId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  captainId: mongoose.Types.ObjectId;
  totalScore: number;
  totalRevenue: number;
  totalDeals: number;
  rank?: number;
  pinnedMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    nicheId: {
      type: Schema.Types.ObjectId,
      ref: 'Niche',
      required: true,
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    captainId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalDeals: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
    },
    pinnedMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

TeamSchema.index({ eventId: 1 });
TeamSchema.index({ nicheId: 1 });
TeamSchema.index({ eventId: 1, rank: 1 });

const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

export default Team;
