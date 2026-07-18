import mongoose, { Schema, Document } from 'mongoose';

export interface IAward extends Document {
  eventId: mongoose.Types.ObjectId;
  name: string;
  emoji: string;
  category: 'team' | 'individual';
  winnerId: mongoose.Types.ObjectId;
  winnerType: 'user' | 'team';
  prize: string;
  orbitOffer: boolean;
  announced: boolean;
  announcedAt?: Date;
  createdAt: Date;
}

const AwardSchema = new Schema<IAward>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['team', 'individual'],
      required: true,
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'winnerType',
    },
    winnerType: {
      type: String,
      enum: ['user', 'team'],
      required: true,
    },
    prize: {
      type: String,
      required: true,
    },
    orbitOffer: {
      type: Boolean,
      default: false,
    },
    announced: {
      type: Boolean,
      default: false,
    },
    announcedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AwardSchema.index({ eventId: 1 });
AwardSchema.index({ winnerId: 1, winnerType: 1 });

const Award = mongoose.models.Award || mongoose.model<IAward>('Award', AwardSchema);

export default Award;
