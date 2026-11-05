const Medicine = require('../models/Medicine');
const MedicineDoseLog = require('../models/MedicineDoseLog');
const PushSubscription = require('../models/PushSubscription');
const { getISTDateTime, convert12to24, convert24to12 } = require('../services/istTimeService');
const { getPublicKey } = require('../services/webPushService');

// @desc Add new prescription
// @route POST /api/medicines
const addMedicine = async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.body.elderId;
    const { name, dosage, frequency, scheduleTimes, instructions, stockRemaining } = req.body;

    if (!name || !dosage) {
      return res.status(400).json({ message: 'Medicine name and dosage are required' });
    }

    // Convert all user times (12h or 24h) to clean, unambiguous 24h HH:mm internally
    let normalizedTimes = ['08:00'];
    if (Array.isArray(scheduleTimes) && scheduleTimes.length > 0) {
      const converted = scheduleTimes.map((t) => convert12to24(t));
      // Deduplicate schedule times
      normalizedTimes = [...new Set(converted)].sort();
    } else if (typeof scheduleTimes === 'string') {
      const parts = scheduleTimes.split(',').map((p) => convert12to24(p.trim()));
      normalizedTimes = [...new Set(parts)].sort();
    }

    const med = await Medicine.create({
      elder,
      name,
      dosage,
      frequency: frequency || 'Daily',
      scheduleTimes: normalizedTimes,
      instructions: instructions || 'Take with water after meals',
      stockRemaining: typeof stockRemaining === 'number' ? stockRemaining : 30,
      timezone: 'Asia/Kolkata',
    });

    res.status(201).json(med);
  } catch (err) {
    console.error('Add medicine error:', err);
    res.status(500).json({ message: 'Error adding medicine prescription' });
  }
};

// @desc Get all medicines with today's dose statuses
// @route GET /api/medicines
const getMedicines = async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.query.elderId;
    const query = elder ? { elder, active: true } : { active: true };

    const meds = await Medicine.find(query)
      .populate('elder', 'name phone preferredLanguage')
      .sort({ createdAt: -1 });

    const { dateStr } = getISTDateTime();

    // Query today's dose logs for these medicines
    const medIds = meds.map((m) => m._id);
    const todayLogs = await MedicineDoseLog.find({
      medicine: { $in: medIds },
      scheduledDate: dateStr,
    });

    // Map dose statuses into response for each medicine
    const result = meds.map((med) => {
      const medObj = med.toObject();
      const logsForMed = todayLogs.filter((l) => l.medicine.toString() === med._id.toString());

      // Format schedule times to 12-hour AM/PM with today's status
      medObj.dosesToday = (med.scheduleTimes || []).map((t24) => {
        const display12 = convert24to12(t24);
        const log = logsForMed.find((l) => l.scheduledTime === t24);
        return {
          time24: t24,
          display12,
          status: log ? log.status : 'Pending',
          takenAt: log ? log.takenAt : null,
          missedAt: log ? log.missedAt : null,
        };
      });

      return medObj;
    });

    res.json(result);
  } catch (err) {
    console.error('Get medicines error:', err);
    res.status(500).json({ message: 'Error fetching medicines' });
  }
};

// @desc Mark a specific medicine dose as taken
// @route PUT /api/medicines/:id/take
const recordMedicineTaken = async (req, res) => {
  try {
    const { status, scheduledTime } = req.body;
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ message: 'Medicine not found' });

    const { dateStr, timeStr } = getISTDateTime();
    const timeToRecord = scheduledTime ? convert12to24(scheduledTime) : med.scheduleTimes[0] || timeStr;
    const elderId = med.elder.toString();
    const idempotencyKey = `rem_${elderId}_${med._id}_${dateStr}_${timeToRecord}`;

    // Upsert / update the MedicineDoseLog for today
    let doseLog = await MedicineDoseLog.findOne({ idempotencyKey });
    if (!doseLog) {
      doseLog = new MedicineDoseLog({
        elder: med.elder,
        medicine: med._id,
        scheduledDate: dateStr,
        scheduledTime: timeToRecord,
        idempotencyKey,
      });
    }

    if (doseLog.status === 'Taken') {
      return res.status(200).json({ message: 'Dose already marked as taken', doseLog, med });
    }

    doseLog.status = status || 'Taken';
    doseLog.takenAt = new Date();
    await doseLog.save();

    // Record into medicine history
    med.history.push({
      takenAt: new Date(),
      status: status || 'Taken',
      scheduledTime: timeToRecord,
    });

    // Decrement stock if available
    if (med.stockRemaining > 0) {
      med.stockRemaining -= 1;
    }
    await med.save();

    res.json({
      message: 'Medicine successfully marked as taken',
      doseLog,
      medicine: med,
    });
  } catch (err) {
    console.error('Record medicine taken error:', err);
    res.status(500).json({ message: 'Error recording medicine intake' });
  }
};

// @desc Get public VAPID key for web push subscription
// @route GET /api/medicines/vapid-key
const getVapidPublicKey = async (req, res) => {
  res.json({ publicKey: getPublicKey() });
};

// @desc Register or update browser push subscription
// @route POST /api/medicines/subscribe-push
const subscribePush = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ message: 'Valid subscription object required' });
    }

    const updated = await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        user: req.user._id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: req.headers['user-agent'] || '',
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Push subscription registered', subscription: updated });
  } catch (err) {
    console.error('Subscribe push error:', err);
    res.status(500).json({ message: 'Error saving push subscription' });
  }
};

module.exports = {
  addMedicine,
  getMedicines,
  recordMedicineTaken,
  getVapidPublicKey,
  subscribePush,
};
