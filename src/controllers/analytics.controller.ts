import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  Contribution,
  Status as ContribStatus,
} from '../model/contribution.model';
import { Payment } from '../model/payment_transfer.model';
import mongoose from 'mongoose';

export const getUserAnalytics = async (req: AuthRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user.sub);

  try {
    const savingsHistory = await Contribution.aggregate([
      {
        $match: {
          member: userId,
          status: ContribStatus.Confirmed,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalSaved: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const payoutsHistory = await Payment.aggregate([
      { $match: { toMember: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalReceived: { $sum: '$fromPoolAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const currentYear = new Date().getFullYear();

    const chartData = months.map((m, index) => {
      const monthNum = index + 1;

      const saved = savingsHistory.find(
        (s) => s._id.year === currentYear && s._id.month === monthNum
      );
      const received = payoutsHistory.find(
        (p) => p._id.year === currentYear && p._id.month === monthNum
      );

      return {
        name: m,
        saved: saved ? saved.totalSaved : 0,
        received: received ? received.totalReceived : 0,
      };
    });

    const totalSaved = chartData.reduce((acc, curr) => acc + curr.saved, 0);
    const totalReceived = chartData.reduce(
      (acc, curr) => acc + curr.received,
      0
    );
    const netPosition = totalReceived - totalSaved; // Profit/Loss logic

    res.json({
      chartData,
      summary: {
        totalSaved,
        totalReceived,
        netPosition,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
