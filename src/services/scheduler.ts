import cron from 'node-cron';
import { Group, Status } from '../model/group.model';
import { generatePayoutOrder } from '../controllers/group.controller';
import { Notification } from '../model/notification.model';

// 1. Payment Reminders (Run daily at 9 AM)
cron.schedule('0 9 * * *', async () => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  // Find groups with payment due in 3 days
  const groups = await Group.find({
    status: Status.Active,
    nextPaymentDate: {
      $gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
      $lt: new Date(threeDaysFromNow.setHours(23, 59, 59, 999)),
    },
  });

  groups.forEach((group) => {
    // Create notifications for all members [cite: 154]
    // "Payment Reminder: Cycle X is due in 3 days!"
  });
});

// 2. Auto-Draw Fail-safe (Run daily at 11:00 PM)
cron.schedule('0 23 * * *', async () => {
  const today = new Date();

  // Find groups that started today OR have a cycle due today
  const groups = await Group.find({
    status: Status.Active,
    // Add logic to check if today is "Draw Day" based on Frequency
  });

  for (const group of groups) {
    const isDrawDone = group.payoutOrder.length > 0; // Or check specific cycle log

    if (!isDrawDone) {
      console.log(`⚠️ Auto-triggering draw for group ${group.name}`);
      await generatePayoutOrder(group);

      // Notify Moderator: "We auto-drew the winner because you missed the deadline."
    }
  }
});
