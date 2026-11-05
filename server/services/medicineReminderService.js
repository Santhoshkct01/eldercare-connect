const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const MedicineDoseLog = require('../models/MedicineDoseLog');
const User = require('../models/User');
const { getISTDateTime, convert24to12, diffMinutes } = require('./istTimeService');
const { sendPushToUser } = require('./webPushService');
const { sendSMS } = require('./smsService');

/**
 * Evaluates and processes all medicine reminders due at current IST time.
 * Can be invoked by cron scheduler or on-demand for testing.
 * @param {object} [io] - Socket.IO instance
 * @param {object} [mockIST] - Optional { dateStr, timeStr } for controlled testing
 */
async function processDueMedicineReminders(io, mockIST = null) {
  try {
    const { dateStr, timeStr } = mockIST || getISTDateTime();

    // 1. Find all active medicines with a schedule matching current HH:mm
    const medicinesDue = await Medicine.find({
      active: true,
      scheduleTimes: timeStr,
    }).populate('elder', 'name phone preferredLanguage familyMembers');

    if (!medicinesDue || medicinesDue.length === 0) {
      return { triggered: 0, checkedTime: timeStr, checkedDate: dateStr };
    }

    let triggeredCount = 0;

    for (const med of medicinesDue) {
      if (!med.elder) continue;

      const elder = med.elder;
      const elderId = elder._id.toString();
      const medId = med._id.toString();

      // Idempotency Key: Unique per medicine + user + date + scheduledTime
      const idempotencyKey = `rem_${elderId}_${medId}_${dateStr}_${timeStr}`;

      // Check if dose log already exists for this exact dose today
      const existingLog = await MedicineDoseLog.findOne({ idempotencyKey });
      if (existingLog) {
        // Already triggered and recorded today
        continue;
      }

      // Create MedicineDoseLog record atomically
      try {
        await MedicineDoseLog.create({
          elder: elder._id,
          medicine: med._id,
          scheduledDate: dateStr,
          scheduledTime: timeStr,
          status: 'Pending',
          idempotencyKey,
          triggeredAt: new Date(),
        });
      } catch (err) {
        // Duplicate key error code 11000 caught (prevents race condition across concurrent processes)
        if (err.code === 11000) {
          continue;
        }
        console.error('[MedicineReminder] Error creating dose log:', err.message);
        continue;
      }

      triggeredCount += 1;
      const displayTime12 = convert24to12(timeStr);
      const lang = elder.preferredLanguage || 'en';

      const title =
        lang === 'ta'
          ? `💊 மருந்து நினைவூட்டல்`
          : `💊 Medicine Reminder`;

      const message =
        lang === 'ta'
          ? `உங்கள் ${med.name} (${med.dosage}) மருந்தை எடுத்துக்கொள்ள வேண்டிய நேரம் இது. நேரம்: ${displayTime12}`
          : `It is time to take your ${med.name} (${med.dosage}). Scheduled Time: ${displayTime12}`;

      // 1. Create In-App Notification (Notification Panel)
      const notification = await Notification.create({
        recipient: elder._id,
        title,
        message,
        type: 'Medicine',
        relatedMedicineId: med._id,
        scheduledTime: timeStr,
        link: '/elder/medicines',
        idempotencyKey: `notif_${idempotencyKey}`,
      });

      // 2. Real-Time Socket.IO broadcast to elder's room
      if (io) {
        io.to(`user_${elder._id}`).emit('medicine_reminder', {
          medicine: {
            _id: med._id,
            name: med.name,
            dosage: med.dosage,
            instructions: med.instructions,
            scheduledTime: timeStr,
            displayTime: displayTime12,
          },
          notification,
        });
      }

      // 3. Web Push Notification to browser / desktop
      await sendPushToUser(elder._id, {
        title,
        message,
        link: '/elder/medicines',
        scheduledTime: displayTime12,
      });

      // 4. SMS alert fallback if Twilio is configured
      if (elder.phone) {
        await sendSMS(
          elder.phone,
          `ElderCare Connect: It is time to take ${med.name} (${med.dosage}). Scheduled Time: ${displayTime12}`
        );
      }

      // 5. Notify connected family members
      if (elder.familyMembers && elder.familyMembers.length > 0) {
        for (const famId of elder.familyMembers) {
          const famMsg =
            lang === 'ta'
              ? `${elder.name} அவர்களுக்கு ${med.name} (${med.dosage}) உட்கொள்ள வேண்டிய நேரம்: ${displayTime12}.`
              : `Reminder: ${elder.name} is scheduled to take ${med.name} (${med.dosage}) at ${displayTime12}.`;

          const famNotif = await Notification.create({
            recipient: famId,
            title: `Elder Medication Reminder: ${elder.name}`,
            message: famMsg,
            type: 'Medicine',
            relatedMedicineId: med._id,
            link: '/family/dashboard',
            idempotencyKey: `fam_${famId}_${idempotencyKey}`,
          });

          if (io) {
            io.to(`user_${famId}`).emit('family_alert', {
              message: famMsg,
              notification: famNotif,
            });
          }
        }
      }
    }

    return { triggered: triggeredCount, checkedTime: timeStr, checkedDate: dateStr };
  } catch (err) {
    console.error('[MedicineReminder] Process reminders error:', err.message);
    return { error: err.message };
  }
}

/**
 * Audits unanswered pending doses older than MISSED_GRACE_MINUTES (default 15 minutes).
 * If unanswered, marks dose as 'Missed' and notifies elder and family.
 * @param {object} [io]
 * @param {number} [graceMinutes=15]
 * @param {object} [mockIST]
 */
async function auditMissedMedicineReminders(io, graceMinutes = 15, mockIST = null) {
  try {
    const { dateStr, timeStr } = mockIST || getISTDateTime();

    // Find pending logs for today
    const pendingLogs = await MedicineDoseLog.find({
      scheduledDate: dateStr,
      status: 'Pending',
    }).populate('medicine elder');

    let missedCount = 0;

    for (const log of pendingLogs) {
      if (!log.medicine || !log.elder) continue;

      const elapsed = diffMinutes(log.scheduledTime, timeStr);
      if (elapsed >= graceMinutes) {
        log.status = 'Missed';
        log.missedAt = new Date();
        log.notes = `Dose unanswered after ${elapsed} minutes.`;
        await log.save();

        missedCount += 1;
        const elder = log.elder;
        const med = log.medicine;
        const displayTime12 = convert24to12(log.scheduledTime);
        const lang = elder.preferredLanguage || 'en';

        // Notify elder
        const elderMissedTitle = lang === 'ta' ? '⚠️ தவறவிடப்பட்ட மருந்து' : '⚠️ Missed Medicine Reminder';
        const elderMissedMsg =
          lang === 'ta'
            ? `நீங்கள் ${med.name} (${displayTime12}) மருந்தை எடுத்துக்கொள்ளவில்லை. தயவுசெய்து உங்கள் அட்டவணையை சரிபார்க்கவும்.`
            : `You missed your scheduled dose of ${med.name} at ${displayTime12}. Please check your prescription.`;

        await Notification.create({
          recipient: elder._id,
          title: elderMissedTitle,
          message: elderMissedMsg,
          type: 'Medicine',
          relatedMedicineId: med._id,
          link: '/elder/medicines',
          idempotencyKey: `missed_${log._id}`,
        });

        if (io) {
          io.to(`user_${elder._id}`).emit('medicine_missed', {
            medicine: med,
            scheduledTime: displayTime12,
          });
        }

        // Notify family members of missed dose
        if (elder.familyMembers && elder.familyMembers.length > 0) {
          for (const famId of elder.familyMembers) {
            await Notification.create({
              recipient: famId,
              title: `Missed Medication Alert: ${elder.name}`,
              message: `${elder.name} did not log taking ${med.name} scheduled at ${displayTime12}.`,
              type: 'Medicine',
              relatedMedicineId: med._id,
              link: '/family/dashboard',
              idempotencyKey: `fam_missed_${famId}_${log._id}`,
            });

            if (io) {
              io.to(`user_${famId}`).emit('family_alert', {
                message: `Alert: ${elder.name} missed medicine ${med.name} at ${displayTime12}.`,
              });
            }
          }
        }
      }
    }

    return { missedAudited: missedCount, checkedDate: dateStr, checkedTime: timeStr };
  } catch (err) {
    console.error('[MedicineReminder] Audit missed error:', err.message);
    return { error: err.message };
  }
}

/**
 * Initializes the backend recurring scheduler.
 * Runs every minute in production.
 * Recovers safely after server restart without duplicate triggers.
 */
function initMedicineScheduler(io) {
  console.log('[MedicineReminder] Initializing IST Medicine Reminder Scheduler (every minute)...');

  // Trigger once per minute (* * * * *)
  cron.schedule('* * * * *', async () => {
    await processDueMedicineReminders(io);
    await auditMissedMedicineReminders(io);
  });
}

module.exports = {
  initMedicineScheduler,
  processDueMedicineReminders,
  auditMissedMedicineReminders,
};
