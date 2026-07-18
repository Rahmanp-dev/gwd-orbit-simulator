import mongoose, { Schema, Document } from 'mongoose';

export interface INiche extends Document {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  eventId: mongoose.Types.ObjectId;
  totalLeads: number;
  createdAt: Date;
}

const NicheSchema = new Schema<INiche>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    totalLeads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NicheSchema.index({ eventId: 1 });
NicheSchema.index({ slug: 1, eventId: 1 }, { unique: true });

const Niche = mongoose.models.Niche || mongoose.model<INiche>('Niche', NicheSchema);

export default Niche;
