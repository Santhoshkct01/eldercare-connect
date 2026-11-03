const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const WellnessCheck = require('../models/WellnessCheck');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
  TrustedContact,
  CheckIn,
  Conversation,
  Message,
  Review,
  CommunityEvent,
  MedicalDocument,
  Expense,
  CarePlan,
} = require('../models/OtherModels');

// APPOINTMENTS
router.get('/appointments', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.query.elderId;
    const items = await Appointment.find(elder ? { elder } : {}).populate('elder', 'name phone');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

router.post('/appointments', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.body.elderId;
    const { doctorName, hospital, appointmentDate, appointmentTime, specialty, notes } = req.body;
    const appt = await Appointment.create({
      elder,
      doctorName,
      hospital,
      appointmentDate,
      appointmentTime,
      specialty,
      notes,
    });
    res.status(201).json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Error booking appointment' });
  }
});

// WELLNESS CHECKS
router.post('/wellness', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.body.elderId;
    const { mood, sleepHours, waterIntakeGlasses, bloodPressure, sugarLevel, symptoms, notes } = req.body;
    const check = await WellnessCheck.create({
      elder,
      mood,
      sleepHours,
      waterIntakeGlasses,
      bloodPressure,
      sugarLevel,
      symptoms,
      notes,
    });
    res.status(201).json(check);
  } catch (err) {
    res.status(500).json({ message: 'Error recording wellness check' });
  }
});

router.get('/wellness', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.query.elderId;
    const checks = await WellnessCheck.find(elder ? { elder } : {}).sort({ createdAt: -1 }).limit(14);
    res.json(checks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wellness checks' });
  }
});

// NOTIFICATIONS
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(30);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Error reading notification' });
  }
});

// COMMUNITY EVENTS
router.get('/community-events', protect, async (req, res) => {
  try {
    const events = await CommunityEvent.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.post('/community-events', protect, async (req, res) => {
  try {
    const event = await CommunityEvent.create({
      ...req.body,
      organizer: req.user._id,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

// MEDICAL DOCUMENTS
router.get('/medical-documents', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.query.elderId;
    const docs = await MedicalDocument.find(elder ? { elder } : {}).sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

router.post('/medical-documents', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.body.elderId;
    const doc = await MedicalDocument.create({ ...req.body, elder });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Error saving document' });
  }
});

// EXPENSES
router.get('/expenses', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.query.elderId;
    const expenses = await Expense.find(elder ? { elder } : {}).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

router.post('/expenses', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.body.elderId;
    const exp = await Expense.create({ ...req.body, elder });
    res.status(201).json(exp);
  } catch (err) {
    res.status(500).json({ message: 'Error saving expense' });
  }
});

// CARE PLANS
router.get('/careplans', protect, async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.query.elderId;
    const plans = await CarePlan.find(elder ? { elder } : {}).populate('elder caregiver', 'name phone email');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching care plans' });
  }
});

router.post('/careplans', protect, async (req, res) => {
  try {
    const plan = await CarePlan.create({
      ...req.body,
      caregiver: req.user._id,
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Error creating care plan' });
  }
});

// LOCATION UPDATES
router.post('/location/update', protect, async (req, res) => {
  try {
    const { latitude, longitude, isSharing } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.location = {
      latitude,
      longitude,
      updatedAt: new Date(),
      isSharing: typeof isSharing === 'boolean' ? isSharing : user.location.isSharing,
    };
    await user.save();
    res.json({ message: 'Location updated', location: user.location });
  } catch (err) {
    res.status(500).json({ message: 'Error updating location' });
  }
});

module.exports = router;
