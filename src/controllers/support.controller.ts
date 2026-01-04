import { Request, Response } from 'express';
import { sendEmail } from '../utils/email';
import { Subscriber } from '../model/subscriber.model';

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

export const subscribeNewsletter = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const exist = Subscriber.findOne({ email });
    if (!exist) return res.status(400).send({ message: 'Already exists.!' });

    await Subscriber.create({ email });
    res.json({ message: 'Subscribed successfully.!' });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

export const sendBroadcast = async (req: Request, res: Response) => {
  const { subject, content } = req.body;

  try {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0)
      res.status(400).send({ message: 'No subscribers found.!' });

    const promises = subscribers.map((sub) =>
      sendEmail(sub.email, subject, content)
    );

    await Promise.all(promises);

    res.json({ message: `Newsletter sent to ${subscribers.length} users.` });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};
