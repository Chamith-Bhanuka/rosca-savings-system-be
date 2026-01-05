import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User, Role } from '../model/user.model';
import { Frequency, Group, IGroup } from '../model/group.model';
import crypto from 'crypto';
import { Audit } from '../model/audit.model';
import { EntityType } from '../model/audit.model';
import { Notification } from '../model/notification.model';
import mongoose from 'mongoose';
import { createAndDispatchNotification } from '../services/notification';

function computeHash(payload: object, prevHash?: string) {
  const json = JSON.stringify({ payload, prevHash: prevHash || '' });
  return crypto.createHash('sha256').update(json).digest('hex');
}

export const createGroup = async (req: AuthRequest, res: Response) => {
  console.log('Received body:', req.body);
  console.log('Parsed startDate:', new Date(req.body.startDate));

  if (!req.user) return res.status(401).json({ message: 'Unauthorized.!' });

  try {
    const userId = req.user.sub;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.!' });
    }

    const {
      groupName,
      description,
      amountPerCycle,
      paymentFrequency,
      startDate,
      totalMembers,
      autoAccept,
      settings = {},
    } = req.body;

    if (
      !groupName ||
      !amountPerCycle ||
      !paymentFrequency ||
      !startDate ||
      !totalMembers ||
      autoAccept === undefined
    ) {
      return res.status(400).json({ message: 'All fields are required.!' });
    }

    const computedMaxCycles = totalMembers;

    const createdUserName = user.firstName + ' ' + user.lastName;

    const groupDoc = {
      name: groupName.trim(),
      description: description ? String(description).trim() : undefined,
      amount: amountPerCycle,
      frequency: paymentFrequency as Frequency,
      startDate: new Date(startDate),
      totalMembers,
      autoAccept: Boolean(autoAccept),
      members: [user._id],
      createdBy: user._id,
      createdUserName,
      maxCycles: computedMaxCycles,
      currentCycle: 1,
      badges: [] as string[],
      rating: 0,
      rations: [],
      disputes: [],
      status: 'ACTIVE',
      payoutOrder: [],
      currentPayoutIndex: 0,
      settings: {
        allowBidding: Boolean(settings.allowBidding),
        escrowEnabled: Boolean(settings.escrowEnabled),
      },
      auditHash: undefined,
    };

    // Add auto-accept badge
    if (groupDoc.autoAccept) {
      groupDoc.badges.push('Auto-Accept');
    }

    // Create group
    const createdGroup = await Group.create(groupDoc);

    // Add group to user's list
    user.groups = user.groups || [];
    user.groups.push(createdGroup._id);

    const payload = {
      entityType: 'Group',
      entityId: createdGroup._id.toString(),
      name: createdGroup.name,
      frequency: createdGroup.frequency,
      createdBy: createdGroup.createdBy.toString(),
      createdAt: createdGroup.createdAt.toISOString(),
    };

    const initialHash = computeHash(payload);

    const auditDoc = {
      entityType: EntityType.Group,
      entityId: createdGroup._id,
      hash: initialHash,
      payload,
    };

    await Audit.create(auditDoc);

    // Update group with audit hash
    createdGroup.auditHash = initialHash;
    await createdGroup.save();

    // Promote user role
    if (user.role === 'USER') {
      user.role = Role.Moderator;
    }

    user.createdGroups = user.createdGroups || [];
    user.createdGroups.push(createdGroup._id);
    await user.save();

    const result = await Group.findById(createdGroup._id).select('-__v');

    return res
      .status(200)
      .json({ message: 'Group created successfully.', group: result });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Server Error' });
  }
};

const calculateNextDueDate = (
  startDate: Date,
  frequency: string,
  currentCycle: number
): Date => {
  const date = new Date(startDate);
  const periodsToAdd = currentCycle;

  if (frequency.toLowerCase() === 'monthly') {
    date.setMonth(date.getMonth() + periodsToAdd);
  } else if (frequency.toLowerCase() === 'weekly') {
    date.setDate(date.getDate() + periodsToAdd * 7);
  } else if (frequency.toLowerCase() === 'biweekly') {
    date.setDate(date.getDate() + periodsToAdd * 14);
  }

  return date;
};

export const getAllGroups = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6; // Changed default to 6 to match frontend
    const skip = (page - 1) * limit;
    const filter = req.query.filter || 'all';

    let query: any = {};

    if (filter === 'created') {
      query = { createdBy: req.user.sub };
    }

    if (filter === 'joined') {
      query = {
        members: req.user.sub,
      };
    }

    const total = await Group.countDocuments(query);

    const rawGroups = await Group.find(query)
      .populate({
        path: 'members',
        select: 'firstName lastName email trustScore avatarUrl',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); //plain JSON not Mongoose Docs

    const groupsWithDates = rawGroups.map((group: any) => {
      const nextDue = calculateNextDueDate(
        group.startDate,
        group.frequency,
        group.currentCycle
      );

      return {
        ...group,
        nextPaymentDate: nextDue.toISOString(),
        nextDrawDate: nextDue.toISOString(),
      };
    });

    return res.status(200).json({
      message: 'Groups fetched successfully!',
      data: groupsWithDates,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || 'Failed to fetch groups!',
    });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;
  const { groupId } = req.params;

  if (!userId) return res.status(401).json({ message: 'Unauthorized.!' });

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Group not found.!' });

  if (group.status !== 'ACTIVE')
    return res.status(400).json({ message: 'Group not active.!' });
  if (group.members.length >= group.totalMembers)
    return res.status(400).json({ message: 'Group is full.!' });
  if (group.members.some((m) => m.equals(userId)))
    return res.status(400).json({ message: 'Already a member.!' });

  // @ts-ignore
  if (group.pendingRequests?.some((r) => r.user.equals(userId)))
    return res.status(409).json({ message: 'Request already pending.!' });

  if (group.autoAccept) {
    group.members.push(userId);
    // payout order logic
    await group.save();

    await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });

    await Notification.create({
      user: userId,
      group: group._id,
      type: 'GROUP_JOINED',
      payload: { groupId },
    });

    return res
      .status(200)
      .json({ message: 'Group joined successfully.!', joined: true });
  }

  group.pendingRequests = group.pendingRequests || [];
  // @ts-ignore
  group.pendingRequests.push({ user: userId, requestedAt: new Date() });
  await group.save();

  await User.findByIdAndUpdate(userId, {
    $addToSet: { pendingGroups: group._id },
  });

  const moderatorId = group.createdBy;
  await createAndDispatchNotification({
    userId: moderatorId,
    groupId: group._id,
    type: 'JOIN_REQUEST',
    payload: { userId, groupId },
  });

  return res
    .status(202)
    .json({ message: 'Join request submitted successfully.!', pending: true });
};

export const acceptJoinRequest = async (req: AuthRequest, res: Response) => {
  const actorId = req.user?.sub;
  const { groupId, userId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  console.log(actorId);
  console.log(group.createdBy);

  if (!group.createdBy.equals(actorId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const result = await Group.updateOne(
    {
      _id: groupId,
      'pendingRequests.user': userId,
    },
    {
      $pull: { pendingRequests: { user: userId } },
      $addToSet: { members: userId },
    }
  );

  if (result.modifiedCount === 0) {
    return res.status(404).json({ message: 'Pending request not found' });
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { groups: groupId },
    $pull: { pendingGroups: groupId },
  });

  await Notification.create({
    user: userId,
    group: groupId,
    type: 'JOIN_ACCEPTED',
    payload: { groupId },
  });

  return res.status(200).json({ message: 'User accepted into group' });
};

export const declineJoinRequest = async (req: AuthRequest, res: Response) => {
  const actorId = req.user?.sub;
  const { groupId, userId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.createdBy.equals(actorId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const groupObjectId = new mongoose.Types.ObjectId(groupId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const result = await Group.updateOne(
    {
      _id: groupObjectId,
      'pendingRequests.user': userObjectId,
    },
    {
      $pull: { pendingRequests: { user: userObjectId } },
    }
  );

  if (result.modifiedCount === 0) {
    return res.status(404).json({ message: 'Pending request not found' });
  }

  await User.findByIdAndUpdate(userObjectId, {
    $pull: { pendingGroups: groupObjectId },
  });

  await Notification.create({
    user: userObjectId,
    group: groupObjectId,
    type: 'JOIN_DECLINED',
    payload: { groupId },
  });

  return res.status(200).json({ message: 'Join request declined' });
};

export const generatePayoutOrder = async (group: IGroup) => {
  const moderatorId = group.createdBy as mongoose.Types.ObjectId;

  let participants = group.members.filter((m) => !m.equals(moderatorId));

  for (let i = participants.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participants[i], participants[j]] = [participants[j], participants[i]];
  }

  const finalOrder = [...participants, moderatorId];

  group.payoutOrder = finalOrder;
  await group.save();
  return finalOrder;
};

export const getGroupDetails = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId)
      .populate('createdBy', 'firstName lastName email')
      .populate('members', 'firstName lastName email avatarUrl')
      .populate(
        'pendingRequests.user',
        'firstName lastName email avatarUrl trustScore'
      )
      .populate('payoutOrder', 'firstName lastName email avatarUrl');

    if (!group) {
      return res.status(404).json({ message: 'Group not found.!' });
    }

    res.status(200).json({
      message: 'Group details fetched successfully.!',
      data: group,
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || 'Error getting group details.' });
  }
};

export const triggerManualDraw = async (req: AuthRequest, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user.sub;

  try {
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: 'Group not found.!' });

    if (!group.createdBy.equals(userId)) {
      return res
        .status(403)
        .json({ message: 'Only Moderator can start the draw.!' });
    }

    if (group.payoutOrder && group.payoutOrder.length > 0) {
      return res
        .status(400)
        .json({ message: 'Draw has already been completed.!' });
    }

    if (group.members.length < group.totalMembers) {
      return res.status(400).json({ message: 'Group is not full yet.!' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const groupStart = new Date(group.startDate);
    groupStart.setHours(0, 0, 0, 0);

    if (today < groupStart) {
      return res
        .status(400)
        .json({ message: 'Cannot start draw before the start Date.!' });
    }

    await generatePayoutOrder(group);

    const updatedGroup = await Group.findById(groupId).populate(
      'payoutOrder',
      'firstName lastName'
    );

    return res.status(200).json({
      message: 'Draw completed successfully! Payout order generated.!',
      payoutOrder: updatedGroup?.payoutOrder,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
