import mongoose, { Schema, Document } from 'mongoose';

export interface IInteraction {
  date: Date;
  type: 'call' | 'email' | 'whatsapp' | 'meeting';
  handledBy: mongoose.Types.ObjectId;
  summary: string;
  outcome: string;
  followUpDate?: Date;
}

export interface IClientContact extends Document {
  dealId: mongoose.Types.ObjectId;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  interactions: IInteraction[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientContactSchema = new Schema<IClientContact>(
  {
    dealId: {
      type: Schema.Types.ObjectId,
      ref: 'Deal',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
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
      trim: true,
    },
    address: {
      type: String,
    },
    interactions: [
      {
        date: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ['call', 'email', 'whatsapp', 'meeting'],
          required: true,
        },
        handledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        summary: { type: String, required: true },
        outcome: { type: String, required: true },
        followUpDate: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ClientContactSchema.index({ phone: 1 });

const ClientContact = mongoose.models.ClientContact || mongoose.model<IClientContact>('ClientContact', ClientContactSchema);

export default ClientContact;
