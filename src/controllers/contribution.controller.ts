import { AuthRequest } from '../middleware/auth.middleware';
import { Request, Response } from 'express';
import {
  Contribution,
  PaymentMethod,
  Status,
} from '../model/contribution.model';
import cloudinary from '../config/cloudinary.config';

export const submitManualPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, cycle } = req.body;
    const userId = req.user.sub;

    let proofUrl = '';

    if (req.file) {
      const result: any = await new Promise(async (resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { folder: 'payment_proofs' },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        upload_stream.end(req.file?.buffer);
      });
      proofUrl = result.secure_url;
    }

    console.log('Proof URL: ', proofUrl);

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
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
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
