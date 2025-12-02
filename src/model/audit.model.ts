import mongoose, { Schema, Document } from 'mongoose';

export enum EntityType {
  Contribution = 'CONTRIBUTION',
  Group = 'GROUP',
  Transfer = 'TRANSFER',
}

export interface IAudit extends Document {
  _id: mongoose.Types.ObjectId;
  entityType: EntityType;
  entityId: mongoose.Types.ObjectId;
  prevHash?: string;
  hash: string;
  payload?: any;
  createdAt: Date;
}

const AuditSchema = new Schema<IAudit>({
  entityType: { type: String, enum: Object.values(EntityType), required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  prevHash: { type: String },
  hash: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export const Audit = mongoose.model('Audit', AuditSchema);
