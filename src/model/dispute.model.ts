import mongoose, { Schema, Document } from 'mongoose';

export enum DisputeStatus {
  Open = 'OPEN',
  InReview = 'IN_REVIEW',
  Resolved = 'RESOLVED',
  Rejected = 'REJECTED',
}

export interface IDispute extends Document {
  ticketId: string;
  initiator: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  contribution?: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  evidenceUrl?: string;
  status: DisputeStatus;
  adminResponse?: string;
  createdAt: Date;
}

const DisputeSchema = new Schema<IDispute>({
  ticketId: { type: String, required: true, unique: true },
  initiator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  contribution: { type: Schema.Types.ObjectId, ref: 'Contribution' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  evidenceUrl: { type: String },
  status: {
    type: String,
    enum: Object.values(DisputeStatus),
    default: DisputeStatus.Open,
  },
  adminResponse: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Dispute = mongoose.model('Dispute', DisputeSchema);
