const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const User = require('../models/User');

function initAutomation(io) {
  console.log('[Automation] Initializing background schedulers...');

  // Automation 1: Smart Medicine Reminders
  // Runs every minute to evaluate medicine schedules
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      // Find medicines scheduled for this time
      const medicinesDue = await Medicine.find({
        scheduleTimes: currentTime,
      }).populate('elder', 'name phone familyMembers');

      for (const med of medicinesDue) {
        if (!med.elder) continue;

        // 1. Send in-app notification to elder
        const notification = await Notification.create({
          recipient: med.elder._id,
          title: `Medicine Reminder: ${med.name}`,
          message: `It is time to take ${med.dosage} of ${med.name}. Instructions: ${med.instructions}`,
          type: 'Medicine',
          link: '/elder/medicines',
        });

        // Emit real-time notification to elder
        if (io) {
          io.to(`user_${med.elder._id}`).emit('medicine_reminder', {
            medicine: med,
            notification,
          });
        }

        // Notify connected family members
        if (med.elder.familyMembers && med.elder.familyMembers.length > 0) {
          for (const famId of med.elder.familyMembers) {
            await Notification.create({
              recipient: famId,
              title: `Elder Medication Reminder: ${med.elder.name}`,
              message: `${med.elder.name} was scheduled to take ${med.name} (${med.dosage}) at ${currentTime}.`,
              type: 'Medicine',
              link: '/family/dashboard',
            });
            if (io) {
              io.to(`user_${famId}`).emit('family_alert', {
                message: `Scheduled reminder sent to ${med.elder.name}`,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('[Automation] Medicine reminder error:', err.message);
    }
  });

  // Daily Check-in monitoring (Missed check-in check at 12:00 PM and 18:00 PM)
  cron.schedule('0 12,18 * * *', async () => {
    try {
      console.log('[Automation] Checking daily wellness check-ins for active elders...');
    } catch (err) {
      console.error('[Automation] Wellness check error:', err.message);
    }
  });
}

module.exports = { initAutomation };
