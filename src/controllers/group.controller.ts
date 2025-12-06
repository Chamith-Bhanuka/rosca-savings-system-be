// import { Request, Response } from 'express';
// import { AuthRequest } from '../middleware/auth.middleware';
// import { User } from '../model/user.model';
// import { Group } from '../model/group.model';
// import crypto from 'crypto';
// import mongoose from 'mongoose';
// import { Audit } from '../model/audit.model';
// import { Role } from '../model/user.model';
//
// function computeHash(payload: object, prevHash?: string) {
//   const json = JSON.stringify({ payload, prevHash: prevHash || '' });
//   return crypto.createHash('sha256').update(json).digest('hex');
// }
//
// export const createGroup = async (req: AuthRequest, res: Response) => {
//   if (!req.user) return res.status(401).json({ message: 'Unauthorized.!' });
//
//   const session = await mongoose.startSession();
//   session.startTransaction();
//
//   try {
//     const userId = req.user.sub;
//     const user = await User.findById(userId).session(session);
//
//     if (!user) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(404).json({ message: 'User not found.!' });
//     }
//
//     const {
//       groupName,
//       description,
//       amountPerCycle,
//       paymentFrequency,
//       startDate,
//       totalMembers,
//       autoAccept,
//       maxCycle,
//       settings = {},
//     } = req.body;
//
//     if (
//       !groupName ||
//       !amountPerCycle ||
//       !paymentFrequency ||
//       !startDate ||
//       !totalMembers ||
//       !autoAccept
//     ) {
//       await session.abortTransaction();
//       await session.endSession();
//       return res.status(400).json({ message: 'All fields are required.!' });
//     }
//
//     const computedMaxCycles = totalMembers;
//
//     const groupDoc = {
//       name: groupName.trim(),
//       description: description ? String(description).trim() : undefined,
//       amount: amountPerCycle,
//       frequency: paymentFrequency,
//       startDate: new Date(startDate),
//       totalMembers,
//       autoAccept: Boolean(autoAccept),
//       members: [],
//       createdBy: user._id,
//       maxCycles: computedMaxCycles,
//       currentCycle: 1,
//       badges: [],
//       rating: 0,
//       rations: [],
//       disputes: [],
//       status: 'ACTIVE',
//       payoutOrder: [],
//       currentPayoutIndex: 0,
//       settings: {
//         allowBidding: Boolean(settings.allowBidding),
//         escrowEnabled: Boolean(settings.escrowEnabled),
//       },
//       auditHash: undefined,
//     };
//
//     const [createdGroup] = await Group.create([groupDoc], { session });
//
//     createdGroup.members.push(user._id);
//     await createdGroup.save({ session });
//
//     user.groups = user.groups || [];
//     user.groups.push(createdGroup._id);
//
//     const payload = {
//       entityType: 'Group',
//       entityId: createdGroup._id.toString(),
//       name: createdGroup.name,
//       frequency: createdGroup.frequency,
//       createdBy: createdGroup.createdBy.toString(),
//       createdAt: createdGroup.createdAt.toISOString(),
//     };
//
//     const initialHash = computeHash(payload, undefined);
//
//     const auditDoc = {
//       entityType: 'Group',
//       entityId: createdGroup._id,
//       hash: initialHash,
//       payload,
//     };
//
//     const auditRecord = await Audit.create([auditDoc], { session });
//
//     createdGroup.auditHash = initialHash;
//     await createdGroup.save({ session });
//
//     if (user.role === 'USER') {
//       user.role = Role.Moderator;
//     }
//
//     user.createdGroups = user.createdGroups || [];
//     user.createdGroups.push(createdGroup._id);
//     await user.save({ session });
//
//     await session.commitTransaction();
//     await session.endSession();
//
//     const result = await Group.findById(createdGroup._id).select('-__v');
//     return res
//       .status(200)
//       .json({ message: 'Group created successfully.', group: result });
//   } catch (error: any) {
//     await session.abortTransaction();
//     await session.endSession();
//     console.error(error);
//     res.status(500).json({ message: error.message || 'Server Error' });
//   }
// };

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User, Role } from '../model/user.model';
import { Group } from '../model/group.model';
import crypto from 'crypto';
import { Audit } from '../model/audit.model';
import { EntityType } from '../model/audit.model';

function computeHash(payload: object, prevHash?: string) {
  const json = JSON.stringify({ payload, prevHash: prevHash || '' });
  return crypto.createHash('sha256').update(json).digest('hex');
}

export const createGroup = async (req: AuthRequest, res: Response) => {
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

    const groupDoc = {
      name: groupName.trim(),
      description: description ? String(description).trim() : undefined,
      amount: amountPerCycle,
      frequency: paymentFrequency,
      startDate: new Date(startDate),
      totalMembers,
      autoAccept: Boolean(autoAccept),
      members: [user._id],
      createdBy: user._id,
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
