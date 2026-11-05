const cron = require('node-cron');
const { initMedicineScheduler } = require('./medicineReminderService');

function initAutomation(io) {
  console.log('[Automation] Initializing background automations...');

  // 1. Initialize Indian Standard Time (IST) Medicine Reminder Scheduler
  initMedicineScheduler(io);

  // 2. Daily Wellness Check-in monitoring
  cron.schedule('0 12,18 * * *', async () => {
    try {
      console.log('[Automation] Checking daily wellness check-ins for active elders...');
    } catch (err) {
      console.error('[Automation] Wellness check error:', err.message);
    }
  });
}

module.exports = { initAutomation };
