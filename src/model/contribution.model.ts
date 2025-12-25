import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentMethod {
  Gateway = 'GATEWAY',
  Bank_Transfer = 'BANK_TRANSFER',
  Wallet = 'WALLET',
}

export enum Status {
  Pending = 'PENDING',
  PendingApproval = 'PENDING_APPROVAL',
  Confirmed = 'CONFIRMED',
  Rejected = 'REJECTED',
  Late = 'LATE',
}

export interface IContribution extends Document {
  _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  cycle: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentGatewayId?: string;
  proofUrl?: string;
  rejectionReason?: string;
  status: Status;
  confirmedAt?: Date;
  createdAt: Date;
  auditHash?: string;
}

const ContributionSchema = new Schema<IContribution>({
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  member: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cycle: { type: Number, required: true },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  paymentGatewayId: { type: String },
  proofUrl: { type: String },
  rejectionReason: { type: String },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.Pending,
  },
  confirmedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  auditHash: { type: String },
});

export const Contribution = mongoose.model<IContribution>(
  'Contribution',
  ContributionSchema
);
