import { AuthRequest } from '../middleware/auth.middleware';
import { Response } from 'express';
import { Notification } from '../model/notification.model';
import { getIo } from '../server/socket';

export const listNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;
  const unread = req.query.unread === 'true';
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const filter: any = { user: userId };
  if (unread) filter.read = false;

  const totalNotifications = await Notification.countDocuments(filter);
  const totalPages = Math.ceil(totalNotifications / limit);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    notifications,
    totalPages,
    currentPage: page,
    total: totalNotifications,
    hasMore: page < totalPages,
  });
};

export const markRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;
  const { id } = req.params;
  console.log('userID', userId);
  console.log('id', id);
  const note = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { read: true },
    { new: true }
  );
  if (!note) return res.status(404).send('Notification not found.!');

  try {
    getIo()
      .to(userId.toString())
      .emit('notification:update', { id: note._id, read: true });
  } catch {}
  res.json({ success: true });
};
