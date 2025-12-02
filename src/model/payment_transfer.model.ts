import mongoose, { Schema, Document } from 'mongoose';

export enum TransferMethods {
  GatewayPayout = 'GATEWAY_PAYOUT',
  BankTransfer = 'BANK_TRANSFER',
  Wallet = 'WALLET',
}

export enum Status {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
}

export interface Ipayment extends Document {
  _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  cycle: number;
  fromPoolAmount: number;
  toMember: mongoose.Types.ObjectId;
  transferMethod: TransferMethods;
  transferReference?: string;
  status: Status;
  createdAt: Date;
}

const PaymentTransferSchema = new Schema<Ipayment>({
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  cycle: { type: Number, required: true },
  fromPoolAmount: { type: Number, required: true },
  toMember: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transferMethod: {
    type: String,
    enum: Object.values(TransferMethods),
    required: true,
  },
  transferReference: { type: String },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.Pending,
  },
  createdAt: { type: Date, default: Date.now },
});

export const Payment = mongoose.model('Payment', PaymentTransferSchema);
