import mongoose, { Schema, Document } from 'mongoose';

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
  Moderator = 'MODERATOR',
}

export enum Badge {
  New = 'NEW',
  Bronze = 'BRONZE',
  Silver = 'SILVER',
  Gold = 'GOLD',
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  googleId?: string;
  phone?: string;
  role: Role[];
  trustScore: number;
  trustBadge: Badge;
  walletBalance: number;
  groups: mongoose.Types.ObjectId[];
  createdGroups: mongoose.Types.ObjectId[];
  contributions: mongoose.Types.ObjectId[];
  disputesRaised: mongoose.Types.ObjectId[];
  ratingsGiven: { group: mongoose.Types.ObjectId; score: number }[];
  avatarUrl?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String },
  googleId: { type: String, index: true },
  phone: { type: String },
  role: {
    type: [String],
    enum: Object.values(Role),
    default: [Role.User],
  },
  trustScore: { type: Number, default: 0 },
  trustBadge: {
    type: String,
    enum: Object.values(Badge),
    default: Badge.New,
  },
  walletBalance: { type: Number, default: 0 },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  createdGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  contributions: [{ type: Schema.Types.ObjectId, ref: 'Contribution' }],
  disputesRaised: [{ type: Schema.Types.ObjectId, ref: 'Dispute' }],
  ratingsGiven: [
    {
      group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
      score: Number,
    },
  ],
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);
