import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  subscribedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>({
  email: { type: String, required: true, unique: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
});

export const Subscriber = mongoose.model<ISubscriber>(
  'Subscriber',
  SubscriberSchema
);
