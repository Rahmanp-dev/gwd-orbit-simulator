import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliverable {
  title: string;
  url: string;
  type: 'website' | 'social' | 'seo' | 'branding' | 'other';
  submittedAt: Date;
}

export interface IEvidence {
  screenshot?: string;
  invoiceUrl?: string;
  paymentProof?: string;
  clientApproval?: string;
  notes?: string;
  interestSignalUrl?: string;
  meetingNotesUrl?: string;
  voiceNoteUrl?: string;
}

export interface IDeliveryQA {
  submittedByParticipant?: boolean;
  participantDeliverableUrls?: string[];
  adminQaStatus?: 'pending' | 'approved' | 'revision_required';
  adminQaFeedback?: string;
  gwdFinalDeliverableUrls?: string[];
}

export type DealStatus = 
  | 'submitted'
  | 'admin_pending_contact'
  | 'gwd_contacted'
  | 'proposal_sent'
  | 'negotiating'
  | 'gwd_closed_paid'
  | 'lead_cold'
  | 'revision_requested'
  | 'delivery_assigned'
  | 'delivery_in_progress'
  | 'delivery_qa_pass'
  | 'client_delivered'
  | 'client_approved'
  | 'under_review' // Backwards compatibility
  | 'approved'     // Backwards compatibility
  | 'rejected';    // Backwards compatibility

export interface IDeal extends Document {
  eventId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  dealArchitectId: mongoose.Types.ObjectId;
  projectManagerId?: mongoose.Types.ObjectId;
  clientName: string;
  clientBusiness: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceType: string;
  dealValue: number;
  participantEstimatedValue?: number;
  gwdFinalDealValue?: number;
  evidence: IEvidence;
  status: DealStatus;
  verifiedByAdminId?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  pointsAwarded: number;
  bonusPoints: number;
  
  // GWD Sales Tracking
  gwdSalesRep?: mongoose.Types.ObjectId;
  gwdContactedAt?: Date;
  gwdProposalSentAt?: Date;
  gwdPaymentConfirmedAt?: Date;
  gwdPaymentMethod?: string;
  gwdPaymentTransactionId?: string;
  gwdInvoiceNumber?: string;
  gwdInternalNotes?: string;

  // Delivery Assignment & QA
  deliveryStatus: 'not_started' | 'in_progress' | 'delivered' | 'client_approved';
  deliveryAssignment?: 'gwd_full' | 'participant_supervised' | 'hybrid';
  deliveryAssignedTo?: mongoose.Types.ObjectId;
  deliveryBriefUrl?: string;
  deliveryDeadline?: Date;
  deliveryQA?: IDeliveryQA;
  deliverables: IDeliverable[];

  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    dealArchitectId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientBusiness: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      required: true,
    },
    dealValue: {
      type: Number,
      required: true,
    },
    participantEstimatedValue: {
      type: Number,
    },
    gwdFinalDealValue: {
      type: Number,
    },
    evidence: {
      screenshot: { type: String },
      invoiceUrl: { type: String },
      paymentProof: { type: String },
      clientApproval: { type: String },
      notes: { type: String },
      interestSignalUrl: { type: String },
      meetingNotesUrl: { type: String },
      voiceNoteUrl: { type: String },
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'admin_pending_contact',
        'gwd_contacted',
        'proposal_sent',
        'negotiating',
        'gwd_closed_paid',
        'lead_cold',
        'revision_requested',
        'delivery_assigned',
        'delivery_in_progress',
        'delivery_qa_pass',
        'client_delivered',
        'client_approved',
        'under_review',
        'approved',
        'rejected'
      ],
      default: 'admin_pending_contact',
    },
    verifiedByAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    bonusPoints: {
      type: Number,
      default: 0,
    },
    
    // GWD Sales Tracking
    gwdSalesRep: { type: Schema.Types.ObjectId, ref: 'User' },
    gwdContactedAt: { type: Date },
    gwdProposalSentAt: { type: Date },
    gwdPaymentConfirmedAt: { type: Date },
    gwdPaymentMethod: { type: String },
    gwdPaymentTransactionId: { type: String },
    gwdInvoiceNumber: { type: String },
    gwdInternalNotes: { type: String },

    // Delivery Assignment & QA
    deliveryStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'delivered', 'client_approved'],
      default: 'not_started',
    },
    deliveryAssignment: {
      type: String,
      enum: ['gwd_full', 'participant_supervised', 'hybrid'],
    },
    deliveryAssignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    deliveryBriefUrl: { type: String },
    deliveryDeadline: { type: Date },
    deliveryQA: {
      submittedByParticipant: { type: Boolean, default: false },
      participantDeliverableUrls: [{ type: String }],
      adminQaStatus: {
        type: String,
        enum: ['pending', 'approved', 'revision_required'],
        default: 'pending',
      },
      adminQaFeedback: { type: String },
      gwdFinalDeliverableUrls: [{ type: String }],
    },
    deliverables: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['website', 'social', 'seo', 'branding', 'other'],
          required: true,
        },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

DealSchema.index({ eventId: 1, teamId: 1 });
DealSchema.index({ dealArchitectId: 1 });
DealSchema.index({ status: 1 });
DealSchema.index({ eventId: 1, status: 1 });
DealSchema.index({ teamId: 1, status: 1, createdAt: -1 });
DealSchema.index({ dealArchitectId: 1, createdAt: -1 }); // Per-user deal history sorted by recency
DealSchema.index({ gwdContactedAt: 1 }, { sparse: true }); // Sales pipeline contact date queries

const Deal = mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);

export default Deal;
