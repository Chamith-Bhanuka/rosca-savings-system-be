import Stripe from 'stripe';
import { AuthRequest } from '../middleware/auth.middleware';
import { Request, Response } from 'express';
import { Group } from '../model/group.model';
import { Contribution, PaymentMethod } from '../model/contribution.model';
import { Status } from '../model/contribution.model';
import { Payment, TransferMethods } from '../model/payment_transfer.model';
import { User } from '../model/user.model';
import { Status as PaymentStatus } from '../model/payment_transfer.model';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-12-15.clover',
});

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  const { groupId, cycle } = req.body;
  const userId = req.user.sub;

  console.log('From payment intent ', groupId, cycle);

  try {
    const group = await Group.findById(groupId).populate('payoutOrder');
    if (!group) return res.status(404).json({ message: 'Group not found.!' });

    const winnerForThisCycle = group.payoutOrder[cycle - 1];

    if (winnerForThisCycle && winnerForThisCycle._id.equals(userId)) {
      return res.status(200).json({
        message: 'You are the winner this round! No payment required.!',
        amount: 0,
        requiresPayment: false,
      });
    }

    const existingContribution = await Contribution.findOne({
      group: groupId,
      member: userId,
      cycle: cycle,
      status: { $in: [Status.Confirmed, Status.PendingApproval] },
    });

    if (existingContribution) {
      return res.status(400).json({
        message: 'Payment already made/pending for this cycle.!',
      });
    }

    const amountInCents = group.amount * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'lkr',
      metadata: {
        groupId,
        userId: userId.toString(),
        cycle: cycle.toString(),
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      amount: group.amount,
      requiresPayment: true,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const confirmStripePayment = async (req: AuthRequest, res: Response) => {
  const { groupId, cycle, paymentIntentId } = req.body;
  const userId = req.user.sub;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    const contribution = await Contribution.findOneAndUpdate(
      { group: groupId, member: userId, cycle },
      {
        amount: paymentIntent.amount / 100,
        paymentMethod: PaymentMethod.Gateway,
        paymentIntentId: paymentIntentId,
        status: Status.Confirmed,
        confirmedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, contribution });
  } else {
    return res.status(400).json({ message: 'Payment not successful.!' });
  }
};

export const getContributions = async (req: Request, res: Response) => {
  const { groupId, cycle } = req.params;
  console.log('Getting contributions...');
  console.log(groupId);
  console.log(cycle);

  try {
    const contributions = await Contribution.find({
      group: groupId,
      cycle: parseInt(cycle),
    })
      .populate('member', 'firstName lastName email avatarUrl')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Contributions fetched successfully.!',
      data: contributions,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const releasePayout = async (req: AuthRequest, res: Response) => {
  const { groupId, cycle } = req.body;
  const moderatorId = req.user.sub;

  try {
    const group = await Group.findById(groupId).populate('payoutOrder');
    if (!group) return res.status(404).json({ message: 'Group not found.!' });

    if (!group.createdBy.equals(moderatorId)) {
      return res
        .status(403)
        .json({ message: 'Only moderator can release funds.!' });
    }

    const winner = group.payoutOrder[cycle - 1];
    if (!winner)
      return res
        .status(400)
        .json({ message: 'No winner defined for this cycle.!' });

    const existingPayout = await Payment.findOne({
      group: groupId,
      cycle,
      transferMethod: TransferMethods.GatewayPayout,
    });

    if (existingPayout) {
      return res
        .status(400)
        .json({ message: 'Payout already released for this cycle.!' });
    }

    const poolAmount = group.amount * group.totalMembers;

    const payout = await Payment.create({
      group: groupId,
      cycle,
      fromPoolAmount: poolAmount,
      toMember: winner._id,
      transferMethod: TransferMethods.GatewayPayout,
      status: PaymentStatus.Completed,
      createdAt: new Date(),
    });

    const winningUser = await User.findById(winner);

    return res.status(200).json({
      message: `Payout of Rs.${poolAmount} released to ${winningUser?.firstName}`,
      payout,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
