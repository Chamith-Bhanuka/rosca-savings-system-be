import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import cloudinary from '../config/cloudinary.config';
import { Dispute, DisputeStatus } from '../model/dispute.model';

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

    const ticketId = `DSP-${Date.now().toString().slice(-6)}`;

    const dispute = await Dispute.create({
      ticketId,
      initiator: userId,
      group: groupId,
      contribution: contributionId,
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
