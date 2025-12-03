import dotenv from 'dotenv';
import { IUser } from '../model/user.model';
import jwt from 'jsonwebtoken';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const signAccessToken = (user: IUser) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '30m' }
  );
};

export const signRefreshToken = (user: IUser) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};
