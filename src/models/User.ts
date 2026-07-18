import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'participant' | 'admin' | 'judge' | 'organizer';
  participantRole?: 'deal_architect' | 'project_manager' | 'developer' | 'designer' | 'wildcard';
  teamId?: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  nicheId?: mongoose.Types.ObjectId;
  orbitScore: number;
  tier: 'member' | 'pro' | 'elite' | 'partner';
  skills: string[];
  bio?: string;
  linkedin?: string;
  portfolio?: string;
  college?: string;
  company?: string;
  onboardingComplete: boolean;
  onboardingStep: number;
  /** UPI Virtual Payment Address for prize payouts */
  upiId?: string;
  /** Notification delivery preferences */
  notificationPrefs: {
    whatsapp: boolean;
    email: boolean;
  };
  suspended: boolean;
  suspendedAt?: Date;
  suspendedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['participant', 'admin', 'judge', 'organizer'],
      default: 'participant',
    },
    participantRole: {
      type: String,
      enum: ['deal_architect', 'project_manager', 'developer', 'designer', 'wildcard'],
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    nicheId: {
      type: Schema.Types.ObjectId,
      ref: 'Niche',
    },
    orbitScore: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['member', 'pro', 'elite', 'partner'],
      default: 'member',
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    portfolio: {
      type: String,
    },
    college: {
      type: String,
    },
    company: {
      type: String,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },
    upiId: {
      type: String,
      trim: true,
    },
    notificationPrefs: {
      whatsapp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
    suspended: {
      type: Boolean,
      default: false,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ teamId: 1 });
UserSchema.index({ eventId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ teamId: 1, role: 1 });
UserSchema.index({ eventId: 1, orbitScore: -1 });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
