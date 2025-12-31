import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../model/user.model';
import { Contribution } from '../model/contribution.model';
import { Status as ContribStatus } from '../model/contribution.model';
import { Group } from '../model/group.model';
import { Status as GroupStatus } from '../model/group.model';
import { Payment } from '../model/payment_transfer.model';

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;

  try {
    const user = await User.findById(userId).select(
      'firstName lastName profileImage trustScore walletBalance'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    const savingAgg = await Contribution.aggregate([
      { $match: { member: user._id, status: ContribStatus.Confirmed } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalSaved = savingAgg.length > 0 ? savingAgg[0].total : 0;

    const activeGroups = await Group.find({
      members: userId,
      status: { $in: [GroupStatus.Active] },
    }).select('name amount currentCycle totalMembers nextPaymentDate status');

    const allGroups = await Group.find({
      members: userId,
      status: GroupStatus.Active,
    }).populate('payoutOrder');
    let nextPayout = null;

    for (const group of allGroups) {
      const myIndex = group.payoutOrder.findIndex((m: any) => m.equals(userId));
      if (myIndex !== -1 && myIndex + 1 >= group.currentCycle) {
        const payoutAmount = group.amount * group.totalMembers;
        nextPayout = {
          groupName: group.name,
          amount: payoutAmount,
          cycle: myIndex + 1,
        };
        break;
      }
    }

    const recentContribs = await Contribution.find({ member: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
      .then((docs) =>
        docs.map((d) => ({
          type: 'CONTRIBUTION',
          amount: d.amount,
          date: d.createdAt,
          status: d.status,
        }))
      );

    const recentPayouts = await Payment.find({ toMember: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
      .then((docs) =>
        docs.map((d) => ({
          type: 'PAYOUT',
          amount: d.fromPoolAmount,
          date: d.createdAt,
          status: d.status,
        }))
      );

    const activityFeed = [...recentContribs, ...recentPayouts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    res.json({
      user,
      stats: {
        totalSaved,
        activeGroupCount: activeGroups.length,
        walletBalance: user.walletBalance,
        totalTrust: user.trustScore,
      },
      nextPayout,
      activeGroups,
      activityFeed,
    });
  } catch (err: any) {
    console.error('Error getting dashboard', err);
  }
};
