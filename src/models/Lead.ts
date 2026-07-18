import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  eventId: mongoose.Types.ObjectId;
  nicheId: mongoose.Types.ObjectId;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  gapAnalysis?: string;
  suggestedPitch?: string;
  suggestedService?: string;
  estimatedValue?: number;
  assignedTeamId?: mongoose.Types.ObjectId;
  claimedByUserId?: mongoose.Types.ObjectId;
  status: 'available' | 'claimed' | 'contacted' | 'meeting_set' | 'proposal_sent' | 'closed' | 'lost';
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
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
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    gapAnalysis: {
      type: String,
    },
    suggestedPitch: {
      type: String,
    },
    suggestedService: {
      type: String,
    },
    estimatedValue: {
      type: Number,
    },
    assignedTeamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    claimedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'contacted', 'meeting_set', 'proposal_sent', 'closed', 'lost'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ eventId: 1, status: 1 });
LeadSchema.index({ nicheId: 1 });
LeadSchema.index({ nicheId: 1, status: 1 });
LeadSchema.index({ eventId: 1, nicheId: 1, status: 1 });
LeadSchema.index({ assignedTeamId: 1 });
LeadSchema.index({ claimedByUserId: 1 });

const Lead = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
