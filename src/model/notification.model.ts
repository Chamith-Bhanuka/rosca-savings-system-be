import mongoose, { Schema, Document } from 'mongoose';

export enum Type {
  Payment_Reminder = 'PAYMENT_REMINDER',
  Draw_Result = 'DRAW_RESULT',
  Dispute_Update = 'DISPUTE_UPDATE',
  Group_Invite = 'GROUP_INVITE',
  General = 'GENERAL',
  Join_Request = 'JOIN_REQUEST',
  Group_Joined = 'GROUP_JOINED',
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  type: Type;
  payload?: any;
  read: boolean;
  sendAt: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Types.ObjectId, ref: 'Group' },
  type: { type: String, enum: Object.values(Type), required: true },
  payload: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  sendAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model('Notification', NotificationSchema);
