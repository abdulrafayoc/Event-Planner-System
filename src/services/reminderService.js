const cron = require('node-cron');
const Event = require('../models/Event');

const checkReminders = async () => {
  const now = new Date();
  const events = await Event.find({
    'reminder.time': { $lte: now },
    'reminder.notified': false
  }).populate('user');

  for (const event of events) {
    // Here you would implement actual notification logic
    // (e.g., sending emails, push notifications, etc.)
    console.log(`Reminder for event: ${event.name}`);
    
    // Mark reminder as notified
    event.reminder.notified = true;
    await event.save();
  }
};

const startReminderCron = () => {
  // Check for reminders every minute
  cron.schedule('* * * * *', checkReminders);
};

module.exports = {
  startReminderCron
};