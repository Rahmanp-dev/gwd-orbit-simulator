import mongoose, { Schema, Document } from 'mongoose';

export interface IObjective {
  text: string;
  points: number;
}

export interface IWildCard {
  active: boolean;
  title: string;
  description: string;
  bonusPoints: number;
  deadline?: Date;
}

export interface IStatsSnapshot {
  totalDeals: number;
  totalRevenue: number;
  topTeam?: string;
  topDA?: string;
}

export interface IDailyBriefing extends Document {
  eventId: mongoose.Types.ObjectId;
  dayNumber: number;
  title: string;
  subtitle: string;
  objectives: IObjective[];
  tips: string[];
  wildCard: IWildCard;
  statsSnapshot: IStatsSnapshot;
  publishedAt?: Date;
  createdAt: Date;
}

const DailyBriefingSchema = new Schema<IDailyBriefing>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 9,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    objectives: [
      {
        text: { type: String, required: true },
        points: { type: Number, required: true },
      },
    ],
    tips: {
      type: [String],
      default: [],
    },
    wildCard: {
      active: { type: Boolean, default: false },
      title: { type: String },
      description: { type: String },
      bonusPoints: { type: Number, default: 0 },
      deadline: { type: Date },
    },
    statsSnapshot: {
      totalDeals: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      topTeam: { type: String },
      topDA: { type: String },
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

DailyBriefingSchema.index({ eventId: 1, dayNumber: 1 }, { unique: true });

const DailyBriefing =
  mongoose.models.DailyBriefing || mongoose.model<IDailyBriefing>('DailyBriefing', DailyBriefingSchema);

export default DailyBriefing;
