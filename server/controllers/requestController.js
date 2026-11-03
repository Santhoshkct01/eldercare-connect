const AssistanceRequest = require('../models/AssistanceRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { matchVolunteers } = require('../services/matchingService');

// @desc Create assistance request
// @route POST /api/requests
const createRequest = async (req, res) => {
  try {
    const { category, description, location, preferredDate, preferredTime, priority } = req.body;
    const elderId = req.user.role === 'elder' ? req.user._id : req.body.elderId;

    if (!category || !description || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Missing required request fields' });
    }

    const newRequest = await AssistanceRequest.create({
      elder: elderId,
      category,
      description,
      location: location || { address: req.user.address || '' },
      preferredDate,
      preferredTime,
      priority: priority || 'Medium',
    });

    // Auto-match nearby available volunteers using Haversine formula
    const matched = await matchVolunteers(category, req.user.location || {}, User);
    if (matched.length > 0) {
      const topVolunteer = matched[0].volunteer;
      // Notify recommended volunteer
      await Notification.create({
        recipient: topVolunteer._id,
        title: `New Assistance Request Available: ${category}`,
        message: `An elder requested assistance with ${category}. Distance: approx ${matched[0].distanceKm} km.`,
        type: 'Assistance',
        link: '/volunteer/requests',
      });
    }

    const populated = await AssistanceRequest.findById(newRequest._id)
      .populate('elder', 'name phone address emergencyContact')
      .populate('assignedVolunteer', 'name phone volunteerRating');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Failed to create assistance request' });
  }
};

// @desc Get assistance requests (filtered by role)
// @route GET /api/requests
const getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'elder') {
      query.elder = req.user._id;
    } else if (req.user.role === 'volunteer') {
      // Show assigned tasks or unassigned pending tasks
      query = {
        $or: [
          { assignedVolunteer: req.user._id },
          { status: 'Pending' },
        ],
      };
    } else if (req.user.role === 'family') {
      // Show for elders connected to this family
      const elders = await User.find({ familyMembers: req.user._id }).select('_id');
      query.elder = { $in: elders.map((e) => e._id) };
    }

    const requests = await AssistanceRequest.find(query)
      .populate('elder', 'name phone address emergencyContact location')
      .populate('assignedVolunteer', 'name phone volunteerRating')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assistance requests' });
  }
};

// @desc Update request status (accept, on the way, in progress, complete, cancel)
// @route PUT /api/requests/:id/status
const updateRequestStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await AssistanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (status === 'Accepted' && req.user.role === 'volunteer') {
      request.assignedVolunteer = req.user._id;
      request.status = 'Accepted';
    } else if (status) {
      request.status = status;
      if (status === 'Completed') {
        request.completedAt = new Date();
      }
    }

    if (notes) request.notes = notes;
    await request.save();

    // Create notification for elder
    await Notification.create({
      recipient: request.elder,
      title: `Assistance Request Update: ${request.category}`,
      message: `Your request status changed to: ${request.status}`,
      type: 'Assistance',
      link: '/elder/requests',
    });

    const updated = await AssistanceRequest.findById(request._id)
      .populate('elder', 'name phone address emergencyContact')
      .populate('assignedVolunteer', 'name phone volunteerRating');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request status' });
  }
};

module.exports = { createRequest, getRequests, updateRequestStatus };
