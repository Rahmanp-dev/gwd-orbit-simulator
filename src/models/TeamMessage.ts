import mongoose, { Schema, Document } from 'mongoose';

export type MessageChannel = 'team' | 'broadcast' | 'staff';
export type SenderRole = 'participant' | 'admin' | 'organizer' | 'judge';

export interface ITeamMessage extends Document {
  /** Which channel this message belongs to */
  channel: MessageChannel;
  /** null for broadcast / staff channels */
  teamId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'text' | 'file' | 'system';
  content: string;
  fileUrl?: string;
  /** Denormalized sender display name to guarantee chat history integrity */
  senderName?: string;
  /** Denormalized role tag for fast badge rendering without a join */
  senderRole: SenderRole;
  /** True when sent by admin/organizer/judge — participants see a special UI badge */
  isStaffMessage: boolean;
  createdAt: Date;
}

const TeamMessageSchema = new Schema<ITeamMessage>(
  {
    channel: {
      type: String,
      enum: ['team', 'broadcast', 'staff'],
      default: 'team',
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    senderName: {
      type: String,
    },
    senderRole: {
      type: String,
      enum: ['participant', 'admin', 'organizer', 'judge'],
      default: 'participant',
    },
    isStaffMessage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for fast channel + team lookups
TeamMessageSchema.index({ teamId: 1, channel: 1, createdAt: -1 });
TeamMessageSchema.index({ channel: 1, createdAt: -1 });
TeamMessageSchema.index({ teamId: 1, createdAt: -1 });

const TeamMessage =
  mongoose.models.TeamMessage || mongoose.model<ITeamMessage>('TeamMessage', TeamMessageSchema);

export default TeamMessage;
