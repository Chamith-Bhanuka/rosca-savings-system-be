import { AuthRequest } from '../middleware/auth.middleware';
import { Request, Response } from 'express';
import {
  Contribution,
  PaymentMethod,
  Status,
} from '../model/contribution.model';

export const submitManualPayment = async (req: AuthRequest, res: Response) => {
  const { groupId, cycle, proofUrl } = req.body;
  const userId = req.user.sub;

  const contribution = await Contribution.findOneAndUpdate(
    { group: groupId, cycle, member: userId },
    {
      paymentMethod: PaymentMethod.Bank_Transfer,
      proofUrl,
      status: Status.PendingApproval,
      createdAt: new Date(),
    },
    { upsert: true, new: true }
  );

  res.json({ message: 'Proof submitted', contribution });
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  const { contributionId } = req.params;
  const { action, reason } = req.body;

  const status = action === 'APPROVE' ? Status.Confirmed : Status.Rejected;

  const contribution = await Contribution.findByIdAndUpdate(
    contributionId,
    { status, rejectionReason: reason },
    { new: true }
  );

  res.json({ message: `Payment ${status}`, contribution });
};
