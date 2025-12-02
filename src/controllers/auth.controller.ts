import { Request, Response } from 'express';
import { User } from '../model/user.model';
import bcrypt from 'bcryptjs';

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
