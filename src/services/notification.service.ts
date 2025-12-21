import mongoose from 'mongoose';
import { Notification } from '../model/notification.model';
import { getIo } from '../server/socket';

export async function createAndDispatchNotification({
  userId,
  groupId,
  type,
  payload,
  sendAt = new Date(),
}: {
  userId: mongoose.Types.ObjectId | string;
  groupId?: mongoose.Types.ObjectId | string;
  type: string;
  payload?: any;
  sendAt?: Date;
}) {
  console.log('createAndDispatchNotification', userId, groupId, type, payload);

  // 1) Persist
  const note = await Notification.create({
    user: userId,
    group: groupId,
    type,
    payload,
    sendAt,
  });

  try {
    const io = getIo();
    io.to(userId.toString()).emit('notification:new', {
      id: note._id,
      type: note.type,
      payload: note.payload,
      createdAt: note.createdAt,
    });
  } catch (err) {
    console.warn('Socket emit failed', err);
  }
}
