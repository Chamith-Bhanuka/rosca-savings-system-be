import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../model/user.model';

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user.sub;

  try {
    const topUsers = await User.find({})
      .sort({ trustScore: -1 })
      .limit(20)
      .select('firstName lastName avatarUrl trustScore walletBalance');

    const currentUser = await User.findById(currentUserId);
    if (!currentUser)
      return res.status(404).json({ message: 'User not found.!' });

    const rankCount = await User.countDocuments({
      trustScore: { $gt: currentUser.trustScore },
    });

    const myRank = rankCount + 1;

    res.json({
      leaderboard: topUsers,
      myRank: {
        rank: myRank,
        score: currentUser.trustScore,
        user: currentUser,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
