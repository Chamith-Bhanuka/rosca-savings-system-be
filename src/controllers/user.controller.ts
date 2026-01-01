import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../model/user.model';
import { Group } from '../model/group.model';
import { Status as GroupStatus } from '../model/group.model';
import { Contribution } from '../model/contribution.model';
import { Status as ContribStatus } from '../model/contribution.model';
import cloudinary from '../config/cloudinary.config';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;
  const { firstName, lastName, phone, bankDetails } = req.body;

  try {
    let profileImageUrl;

    if (req.file) {
      const result: any = await new Promise(async (resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { folder: 'seettuwa_profiles' },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        upload_stream.end(req.file?.buffer);
      });
      profileImageUrl = result.secure_url;
    }

    console.log('🔗 profile URL: ', profileImageUrl);

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (profileImageUrl) updateData.avatarUrl = profileImageUrl;

    console.log(updateData.avatarUrl);

    if (bankDetails) {
      try {
        updateData.bankDetails =
          typeof bankDetails === 'string'
            ? JSON.parse(bankDetails)
            : bankDetails;
      } catch (e) {
        console.error('Bank details parse error', e);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

export const getWalletData = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.!' });

    const activeGroups = await Group.find({
      members: userId,
      status: GroupStatus.Active,
    }).populate('payoutOrder');

    const dues = [];
    const incomes: any = [];

    for (const group of activeGroups) {
      const currentCycle = group.currentCycle;

      const winner = group.payoutOrder[currentCycle - 1];

      const isWinner = winner && winner._id.equals(userId);

      if (!isWinner) {
        const contribution = await Contribution.findOne({
          group: group._id,
          member: userId,
          cycle: currentCycle,
          status: {
            $in: [ContribStatus.Confirmed, ContribStatus.PendingApproval],
          },
        });

        if (!contribution) {
          dues.push({
            groupId: group._id,
            groupName: group.name,
            amount: group.amount,
            dueDate: group.nextPaymentDate,
            cycle: currentCycle,
          });
        }
      }

      group.payoutOrder.forEach((memberId: any, index: number) => {
        if (memberId.equals(userId) && index + 1 >= currentCycle) {
          incomes.push({
            groupId: group._id,
            groupName: group.name,
            amount: group.amount * group.totalMembers,
            cycle: index + 1,
            estimatedDate: group.nextPaymentDate,
          });
        }
      });
    }

    res.json({
      balance: user.walletBalance,
      dues,
      incomes,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
