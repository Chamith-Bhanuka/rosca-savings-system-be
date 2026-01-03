import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../model/user.model';
import { Contribution } from '../model/contribution.model';
import { Status as ContribStatus } from '../model/contribution.model';
import { Group } from '../model/group.model';
import { Status as GroupStatus } from '../model/group.model';

export const getTrustProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.!' });

    const totalContributions = await Contribution.countDocuments({
      member: userId,
      status: { $in: [ContribStatus.Confirmed, ContribStatus.Late] },
    });

    const lateContributions = await Contribution.countDocuments({
      member: userId,
      status: ContribStatus.Late,
    });

    const onTimePercentage =
      totalContributions === 0
        ? 100
        : Math.round(
            ((totalContributions - lateContributions) / totalContributions) *
              100
          );

    const completedGroups = await Group.countDocuments({
      members: userId,
      status: GroupStatus.Completed,
    });

    const factors = [];

    // Positive factors
    factors.push({ label: 'Identity Verified', points: '+20', type: 'good' }); // Assuming basic verify
    if (user.avatarUrl)
      factors.push({
        label: 'Profile Photo Added',
        points: '+5',
        type: 'good',
      });
    if (completedGroups > 0)
      factors.push({
        label: `Completed ${completedGroups} Groups`,
        points: `+${completedGroups * 10}`,
        type: 'good',
      });
    if (onTimePercentage === 100 && totalContributions > 0)
      factors.push({
        label: 'Perfect Payment Record',
        points: '+15',
        type: 'good',
      });

    // Negative factors
    if (lateContributions > 0)
      factors.push({
        label: `${lateContributions} Late Payments`,
        points: `-${lateContributions * 5}`,
        type: 'bad',
      });
    if (user.trustScore < 50)
      factors.push({
        label: 'Low Community Activity',
        points: '-10',
        type: 'bad',
      });

    // Badge level
    let level = 'Newcomer';
    if (user.trustScore >= 90) level = 'Platinum Guardian';
    else if (user.trustScore >= 75) level = 'Gold Member';
    else if (user.trustScore >= 50) level = 'Silver Saver';

    res.json({
      user: {
        name: `${user.firstName} ${user.lastName}`,
        joinedAt: user.createdAt,
        trustScore: user.trustScore,
        level,
      },
      stats: {
        onTimePercentage,
        totalContributions,
        completedGroups,
      },
      factors,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
