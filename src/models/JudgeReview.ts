import mongoose, { Schema, Document } from 'mongoose';

export interface IJudgeReview extends Document {
  judgeId: mongoose.Types.ObjectId;
  dealId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  designScore: number;
  technicalScore: number;
  pitchScore: number;
  innovationScore: number;
  scalabilityScore: number;
  feedback: string;
  nominatedAward?: string;
  nominationReason?: string;
  createdAt: Date;
}

const JudgeReviewSchema = new Schema<IJudgeReview>(
  {
    judgeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: 'Deal',
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
    designScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    technicalScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    pitchScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    innovationScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    scalabilityScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    feedback: {
      type: String,
      required: false, // Make feedback optional so judges can just score
      default: "",
    },
    nominatedAward: {
      type: String,
    },
    nominationReason: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

JudgeReviewSchema.index({ dealId: 1 });
JudgeReviewSchema.index({ judgeId: 1, dealId: 1 }, { unique: true });
JudgeReviewSchema.index({ eventId: 1 });

const JudgeReview =
  mongoose.models.JudgeReview || mongoose.model<IJudgeReview>('JudgeReview', JudgeReviewSchema);

export default JudgeReview;
