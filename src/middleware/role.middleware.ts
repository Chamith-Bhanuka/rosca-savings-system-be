import { AuthRequest } from './auth.middleware';
import { Role } from '../model/user.model';
import { Response, NextFunction } from 'express';

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.role;

    if (
      !userRoles ||
      !userRoles.some((role: Role) => allowedRoles.includes(role))
    ) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }

    next();
  };
};
