import mongoose, { Schema, Document } from 'mongoose';

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  action: string;
  points: number;
  dealId?: mongoose.Types.ObjectId;
  description: string;
  createdAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: 'Deal',
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ScoreSchema.index({ userId: 1 });
ScoreSchema.index({ teamId: 1 });
ScoreSchema.index({ eventId: 1 });
ScoreSchema.index({ eventId: 1, teamId: 1 });
ScoreSchema.index({ eventId: 1, userId: 1 }); // For per-user score history within an event
ScoreSchema.index({ createdAt: -1 });          // For recent activity feeds

const Score = mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);

export default Score;
