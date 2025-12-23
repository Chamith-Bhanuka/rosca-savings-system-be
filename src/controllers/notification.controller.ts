import { AuthRequest } from '../middleware/auth.middleware';
import { Response } from 'express';
import { Notification } from '../model/notification.model';

export const listNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;
  const unread = req.query.unread === 'true';
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const filter: any = { user: userId };

  if (unread) filter.read = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json({ notifications });
};
