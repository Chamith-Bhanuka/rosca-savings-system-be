import { Request, Response } from 'express';
import { IUser, User } from '../model/user.model';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.middleware';
import { signAccessToken, signRefreshToken } from '../utils/token';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { RefreshToken } from '../model/refresh_token.model';
dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.!' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json({
      message: 'User registered successfully.!',
      user: userWithoutPassword,
    });
  } catch (err: any) {
    console.error('Registration error ', err);

    return res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.!' });
  }

  const userId = req.user.sub;

  const user =
    ((await User.findById(userId).select('-password')) as IUser) || null;

  if (!user) {
    return res.status(404).json({
      message: 'User not found!',
    });
  }

  const { firstName, lastName, email, role, _id, avatarUrl, phone } = user;

  res.status(200).json({
    message: 'Ok',
    data: { firstName, lastName, email, role, _id, avatarUrl, phone },
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid Credentials.!' });
    }

    const valid = await bcrypt.compare(password, existingUser.password!);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid Credentials.!' });
    }

    const accessToken = signAccessToken(existingUser);

    const refreshToken = await signRefreshToken(existingUser);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'User logged in successfully.!',
      data: existingUser.email,
      role: existingUser.role,
      accessToken: accessToken,
    });
  } catch (err: any) {
    console.error('Login error', err);

    if (err.code === 11000) {
      return res.status(401).json({ message: 'Invalid Credentials.!' });
    }

    res.status(500).json({ message: err.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token found.!' });
  }

  try {
    const payload: any = jwt.verify(token, JWT_REFRESH_SECRET);

    const userId = payload.sub;

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(401).json({
        message: 'Invalid or expired refresh token.!',
        existingUser: existingUser,
      });
    }
    const newAccessToken = signAccessToken(existingUser);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: 'Invalid or expired refresh token.!', error: err });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.!' });
    }

    const userId = req.user.sub;

    if (userId) {
      await RefreshToken.deleteMany({ user: userId });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return res.status(200).json({ message: 'Logged out successfully.!' });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: 'Logout failed', error: err.message });
  }
};
