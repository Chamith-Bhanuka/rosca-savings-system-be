import { Request, Response } from 'express';
import { sendEmail } from '../utils/email';

export const contactSupport = async (req: Request, res: Response) => {
  const { email, subject, message } = req.body;

  try {
    await sendEmail(
      process.env.ADMIN_EMAIL as string,
      `New Support Request: ${subject}`,
      `<h3>From: ${email}</h3><p>${message}</p>`
    );

    await sendEmail(
      email,
      'We received your request',
      `<p>Hi there,</p><p>Thanks for contacting Seettuwa Support. We have received your message regarding "<b>${subject}</b>" and will get back to you shortly.</p>`
    );

    res.json({ message: 'Support request sent successfully.!' });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ message: 'Failed to send message.!' });
  }
};
