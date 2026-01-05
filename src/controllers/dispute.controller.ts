import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import cloudinary from '../config/cloudinary.config';
import { Dispute, DisputeStatus } from '../model/dispute.model';
import { Contribution, Status } from '../model/contribution.model';
import { Status as ContribStatus } from '../model/contribution.model';

export const raiseDispute = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;
  const { groupId, contributionId, subject, description } = req.body;

  try {
    let evidenceUrl = '';

    if (req.file) {
      const result: any = await new Promise(async (resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { folder: 'dispute_evidence' },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        upload_stream.end(req.file?.buffer);
      });
      evidenceUrl = result.secure_url;
    }

    let targetContributionId = contributionId;

    if (!targetContributionId) {
      const lastRejected = await Contribution.findOne({
        member: userId,
        group: groupId,
        status: Status.Rejected,
      }).sort({ createdAt: -1 });

      if (lastRejected) {
        targetContributionId = lastRejected._id;
      }
    }

    const ticketId = `DSP-${Date.now().toString().slice(-6)}`;

    const dispute = await Dispute.create({
      ticketId,
      initiator: userId,
      group: groupId,
      contribution: targetContributionId || null,
      subject,
      description,
      evidenceUrl,
      status: DisputeStatus.Open,
    });

    res.status(201).json({ message: 'Dispute raised successfully', dispute });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

export const getMyDisputes = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;

  try {
    const disputes = await Dispute.find({ initiator: userId })
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

export const resolveDispute = async (req: AuthRequest, res: Response) => {
  const { disputeId, resolution, adminComment } = req.body;

  try {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) return res.status(404).send({ error: 'Dispute not found.!' });

    dispute.adminResponse = adminComment;

    if (resolution === 'APPROVE_PAYMENT' && dispute.contribution) {
      await Contribution.findByIdAndUpdate(dispute.contribution, {
        status: ContribStatus.Confirmed,
        rejectionReason: `Resolved via Dispute ${dispute.ticketId}`,
      });
      dispute.status = DisputeStatus.Resolved;
    } else {
      dispute.status = DisputeStatus.Rejected;
    }

    await dispute.save();
    res.json({ message: 'Disputed resolved.!', dispute });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

export const getAllDisputes = async (req: AuthRequest, res: Response) => {
  try {
    const disputes = await Dispute.find()
      .populate('initiator', 'firstName lastName email')
      .populate('group', 'name')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};
