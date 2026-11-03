const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { matchVolunteers } = require('../services/matchingService');

// @desc Trigger SOS alert
// @route POST /api/sos
const triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const elder = await User.findById(req.user._id);

    const alert = await SOSAlert.create({
      elder: req.user._id,
      location: {
        latitude: latitude || 11.0168,
        longitude: longitude || 76.9558,
        address: address || elder.address || 'Live GPS Coordinates Shared',
      },
      status: 'Active',
      notifiedContacts: elder.emergencyContact?.name
        ? [{ name: elder.emergencyContact.name, phone: elder.emergencyContact.phone }]
        : [],
    });

    // 1. Notify Administrators
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: `EMERGENCY SOS: ${elder.name}`,
        message: `Elder ${elder.name} triggered an SOS emergency alert at ${alert.location.address}`,
        type: 'SOS',
        link: '/admin/sos',
      });
    }

    // 2. Notify connected family members
    if (elder.familyMembers && elder.familyMembers.length > 0) {
      for (const famId of elder.familyMembers) {
        await Notification.create({
          recipient: famId,
          title: `EMERGENCY ALERT: ${elder.name} Needs Immediate Help!`,
          message: `Location: https://maps.google.com/?q=${alert.location.latitude},${alert.location.longitude}`,
          type: 'SOS',
          link: '/family/dashboard',
        });
      }
    }

    // 3. Find nearby volunteers with Haversine distance
    const nearbyVolunteers = await matchVolunteers('Emergency Assistance', alert.location, User);
    if (nearbyVolunteers.length > 0) {
      // Notify the closest 3 volunteers
      for (let i = 0; i < Math.min(3, nearbyVolunteers.length); i++) {
        const v = nearbyVolunteers[i].volunteer;
        await Notification.create({
          recipient: v._id,
          title: `EMERGENCY DISPATCH: Elder nearby needs help!`,
          message: `Distance: ~${nearbyVolunteers[i].distanceKm} km. Location: https://maps.google.com/?q=${alert.location.latitude},${alert.location.longitude}`,
          type: 'SOS',
          link: '/volunteer/sos',
        });
      }
    }

    res.status(201).json({
      message: 'SOS Alert triggered successfully. Emergency contacts and volunteers notified.',
      alert,
    });
  } catch (error) {
    console.error('SOS trigger error:', error);
    res.status(500).json({ message: 'Failed to dispatch SOS alert' });
  }
};

// @desc Get active SOS alerts
// @route GET /api/sos
const getSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find()
      .populate('elder', 'name phone address emergencyContact medicalConditions')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch SOS alerts' });
  }
};

// @desc Resolve or respond to SOS
// @route PUT /api/sos/:id
const updateSOS = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    if (status) alert.status = status;
    if (notes) alert.notes = notes;
    if (status === 'Responded') alert.respondedAt = new Date();
    if (status === 'Resolved') alert.resolvedAt = new Date();

    if (req.user.role === 'volunteer') {
      alert.assignedVolunteer = req.user._id;
    }

    await alert.save();
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update SOS alert' });
  }
};

module.exports = { triggerSOS, getSOSAlerts, updateSOS };
