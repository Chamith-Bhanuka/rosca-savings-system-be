import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User, Role } from '../model/user.model';
import { Frequency, Group } from '../model/group.model';
import crypto from 'crypto';
import { Audit } from '../model/audit.model';
import { EntityType } from '../model/audit.model';

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
      badges: [],
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

    // Promote user role if necessary
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

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    //Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 4;
    const skip = (page - 1) * limit;

    const groups = await Group.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Group.countDocuments();

    return res.status(200).json({
      message: 'Groups found successfully.!',
      data: groups,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || 'Failed to get groups.!' });
  }
};
