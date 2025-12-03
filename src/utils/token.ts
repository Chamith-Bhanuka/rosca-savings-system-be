import dotenv from 'dotenv';
import { IUser } from '../model/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { RefreshToken } from '../model/refresh_token.model';
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

export const signRefreshToken = async (user: IUser) => {
  const refreshToken = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await RefreshToken.create({
    user: user._id,
    token: hashedRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return refreshToken;
};
