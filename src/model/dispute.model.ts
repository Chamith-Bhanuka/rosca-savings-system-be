import mongoose, { Schema, Document } from 'mongoose';

export enum Status {
  Open = 'OPEN',
  UnderReview = 'UNDER_REVIEW',
  Resolved = 'RESOLVED',
  Rejected = 'REJECTED',
}

export interface IDispute extends Document {
  _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  againstUser: mongoose.Types.ObjectId;
  cycle?: number;
  reason: string;
  evidenceUrls?: string[];
  status: Status;
  moderatorNotes?: string;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const DisputeSchema = new Schema<IDispute>({
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  againstUser: { type: Schema.Types.ObjectId, ref: 'User' },
  cycle: { type: Number },
  reason: { type: String, required: true },
  evidenceUrls: [{ type: String }],
  status: { type: String, enum: Object.values(Status), default: Status.Open },
  moderatorNotes: { type: String },
  resolution: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

export const Dispute = mongoose.model('Dispute', DisputeSchema);
