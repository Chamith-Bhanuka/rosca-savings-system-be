import mongoose, { Schema, Document } from 'mongoose';

export enum Frequency {
  Monthly = 'MONTHLY',
  Weekly = 'WEEKLY',
  BiWeekly = 'BI-WEEKLY',
}

export enum Status {
  Active = 'ACTIVE',
  Paused = 'PAUSED',
  Completed = 'COMPLETED',
  Closed = 'CLOSED',
}

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  amount: number;
  frequency: Frequency;
  startDate: Date;
  totalMembers: number;
  autoAccept: boolean;
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdUserName: string;
  createdAt: Date;
  currentCycle: number;
  maxCycles: number;
  badges: string[];
  rating: number;
  ratings: { user: mongoose.Types.ObjectId; score: number }[];
  disputes: mongoose.Types.ObjectId[];
  pendingRequests: { user: mongoose.Types.ObjectId; requestedAt: Date }[];
  status: Status;
  payoutOrder: mongoose.Types.ObjectId[];
  currentPayoutIndex: number;
  settings: {
    allowBidding: boolean;
    escrowEnabled: boolean;
    securityDepositAmount: number;
  };
  nextPaymentDate: Date;
  drawTime: string;
  auditHash?: string;
}

const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  amount: { type: Number, required: true },
  frequency: {
    type: String,
    enum: Object.values(Frequency),
    required: true,
  },
  startDate: { type: Date, required: true },
  totalMembers: { type: Number, required: true },
  autoAccept: { type: Boolean, default: false },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdUserName: { type: String },
  createdAt: { type: Date, default: Date.now },
  currentCycle: { type: Number, default: 1 },
  maxCycles: { type: Number, required: true },
  badges: [{ type: String }],
  rating: { type: Number, default: 0 },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      score: Number,
    },
  ],
  disputes: [{ type: Schema.Types.ObjectId, ref: 'Dispute' }],
  pendingRequests: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date },
    },
  ],
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.Active,
  },
  payoutOrder: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  currentPayoutIndex: { type: Number, default: 0 },
  settings: {
    allowBidding: { type: Boolean, default: false },
    escrowEnabled: { type: Boolean, default: false },
    securityDepositAmount: { type: Number, default: 0 },
  },
  nextPaymentDate: { type: Date },
  drawTime: { type: String, default: '23:00' },
  auditHash: { type: String },
});

export const Group = mongoose.model('Group', GroupSchema);
