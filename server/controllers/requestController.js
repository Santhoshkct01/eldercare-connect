const AssistanceRequest = require('../models/AssistanceRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateDistance } = require('../services/matchingService');
const {
  processVolunteerAssignment,
  SAME_LOCATION_RADIUS_METERS,
  isValidLocation,
} = require('../services/volunteerAssignmentService');

// @desc Create assistance request
// @route POST /api/requests
const createRequest = async (req, res) => {
  try {
    const { category, description, location, preferredDate, preferredTime, priority } = req.body;
    const elderId = req.user.role === 'elder' ? req.user._id : req.body.elderId;

    if (!category || !description || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Missing required request fields' });
    }

    const elderUser = await User.findById(elderId);
    if (!elderUser) {
      return res.status(404).json({ message: 'Elder user not found' });
    }

    const finalLocation = {
      address: location?.address || elderUser.address || '',
      latitude: Number(location?.latitude || elderUser.location?.latitude || 0),
      longitude: Number(location?.longitude || elderUser.location?.longitude || 0),
    };

    const newRequest = await AssistanceRequest.create({
      elder: elderId,
      category,
      description,
      location: finalLocation,
      preferredDate,
      preferredTime,
      priority: priority || 'Medium',
    });

    // Run Location-Based Smart Volunteer Assignment Rule (100m radius)
    await processVolunteerAssignment(newRequest, elderUser);

    const populated = await AssistanceRequest.findById(newRequest._id)
      .populate('elder', 'name phone address emergencyContact location preferredLanguage')
      .populate('assignedVolunteer', 'name phone volunteerRating location')
      .populate('assignedBy', 'name email');

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
      .populate('elder', 'name phone address emergencyContact location preferredLanguage')
      .populate('assignedVolunteer', 'name phone volunteerRating location')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assistance requests' });
  }
};

// @desc Get pending assignment queue requests (Admin only)
// @route GET /api/requests/pending-assignment
const getPendingAssignmentRequests = async (req, res) => {
  try {
    const pendingRequests = await AssistanceRequest.find({
      $or: [
        { assignmentStatus: 'pending' },
        { status: 'Pending' },
        { assignedVolunteer: { $exists: false } },
        { assignedVolunteer: null },
      ],
      status: { $nin: ['Completed', 'Cancelled'] },
    })
      .populate('elder', 'name phone address location preferredLanguage')
      .populate('assignedVolunteer', 'name phone volunteerRating')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(pendingRequests);
  } catch (error) {
    console.error('Fetch pending assignment error:', error);
    res.status(500).json({ message: 'Failed to fetch pending requests' });
  }
};

// @desc Get available volunteers with distance comparison for a specific request
// @route GET /api/requests/available-volunteers/:requestId
const getAvailableVolunteersForRequest = async (req, res) => {
  try {
    const request = await AssistanceRequest.findById(req.params.requestId).populate('elder');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const elderLoc = {
      latitude: request.location?.latitude || request.elder?.location?.latitude,
      longitude: request.location?.longitude || request.elder?.location?.longitude,
    };
    const hasElderLoc = isValidLocation(elderLoc);

    // Fetch approved, available volunteers
    const volunteers = await User.find({
      role: 'volunteer',
      isVerifiedVolunteer: true,
      isVolunteerAvailable: true,
    }).select('name email phone location volunteerRating volunteerSkills address');

    const volunteersWithDistance = volunteers.map((vol) => {
      let distanceMeters = null;
      let distanceKm = null;
      let isSameLocation = false;

      if (hasElderLoc && isValidLocation(vol.location)) {
        distanceKm = calculateDistance(
          elderLoc.latitude,
          elderLoc.longitude,
          vol.location.latitude,
          vol.location.longitude
        );
        distanceMeters = Math.round(distanceKm * 1000);
        isSameLocation = distanceMeters <= SAME_LOCATION_RADIUS_METERS;
      }

      return {
        _id: vol._id,
        name: vol.name,
        email: vol.email,
        phone: vol.phone,
        address: vol.address,
        location: vol.location,
        volunteerRating: vol.volunteerRating || 5.0,
        volunteerSkills: vol.volunteerSkills || [],
        distanceMeters,
        distanceKm: distanceKm ? parseFloat(distanceKm.toFixed(2)) : null,
        isSameLocation,
      };
    });

    // Sort by: same location first, then shortest distance, then rating
    volunteersWithDistance.sort((a, b) => {
      if (a.distanceMeters !== null && b.distanceMeters !== null) {
        return a.distanceMeters - b.distanceMeters;
      }
      if (a.distanceMeters !== null) return -1;
      if (b.distanceMeters !== null) return 1;
      return (b.volunteerRating || 0) - (a.volunteerRating || 0);
    });

    res.json({
      requestId: request._id,
      elder: {
        name: request.elder?.name,
        location: elderLoc,
        hasValidLocation: hasElderLoc,
      },
      sameLocationRadiusMeters: SAME_LOCATION_RADIUS_METERS,
      volunteers: volunteersWithDistance,
    });
  } catch (error) {
    console.error('Get available volunteers error:', error);
    res.status(500).json({ message: 'Failed to get available volunteers' });
  }
};

// @desc Manually assign a volunteer to an assistance request (Admin only)
// @route POST /api/requests/:requestId/assign-volunteer
const assignVolunteerManually = async (req, res) => {
  try {
    const { volunteerId, notes } = req.body;
    if (!volunteerId) {
      return res.status(400).json({ message: 'Volunteer ID is required' });
    }

    const request = await AssistanceRequest.findById(req.params.requestId).populate('elder');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(400).json({ message: 'Valid volunteer required' });
    }

    // Calculate distance
    let calculatedDistance = null;
    let comparison = 'different_location';
    const elderLoc = {
      latitude: request.location?.latitude || request.elder?.location?.latitude,
      longitude: request.location?.longitude || request.elder?.location?.longitude,
    };
    if (isValidLocation(elderLoc) && isValidLocation(volunteer.location)) {
      const km = calculateDistance(
        elderLoc.latitude,
        elderLoc.longitude,
        volunteer.location.latitude,
        volunteer.location.longitude
      );
      calculatedDistance = Math.round(km * 1000);
      comparison = calculatedDistance <= SAME_LOCATION_RADIUS_METERS ? 'same_location' : 'different_location';
    } else {
      comparison = 'unavailable';
    }

    // Update Request
    request.assignedVolunteer = volunteer._id;
    request.assignedBy = req.user._id;
    request.assignmentType = 'admin_manual';
    request.assignmentStatus = 'assigned';
    request.locationComparison = comparison;
    request.distanceMeters = calculatedDistance;
    request.status = 'Volunteer Assigned';

    request.assignmentHistory.push({
      assignedVolunteer: volunteer._id,
      assignedBy: req.user._id,
      assignmentType: 'admin_manual',
      timestamp: new Date(),
      notes: notes || `Admin manually assigned volunteer ${volunteer.name} (distance: ${calculatedDistance !== null ? calculatedDistance + 'm' : 'N/A'})`,
    });

    await request.save();

    // Notify Elder
    const elderLang = request.elder?.preferredLanguage || 'en';
    const elderMsg = elderLang === 'ta'
      ? `நிர்வாகி உங்களுக்கு ஒரு தன்னார்வலரை நியமித்துள்ளார்: ${volunteer.name}`
      : `An administrator has assigned volunteer ${volunteer.name} to your request.`;

    await Notification.create({
      recipient: request.elder._id,
      title: elderLang === 'ta' ? 'தன்னார்வலர் நியமிக்கப்பட்டார்' : 'Volunteer Assigned by Admin',
      message: elderMsg,
      type: 'Assistance',
      link: '/elder/requests',
    });

    // Notify Volunteer
    const volLang = volunteer.preferredLanguage || 'en';
    const volMsg = volLang === 'ta'
      ? `நிர்வாகி உங்களுக்கு புதிய உதவி பணியை ஒதுக்கியுள்ளார்: ${request.category}`
      : `Administrator assigned you to assistance request: ${request.category}`;

    await Notification.create({
      recipient: volunteer._id,
      title: volLang === 'ta' ? 'புதிய பணி ஒதுக்கீடு' : 'Manual Task Assignment',
      message: volMsg,
      type: 'Assistance',
      link: '/volunteer/requests',
    });

    const populated = await AssistanceRequest.findById(request._id)
      .populate('elder', 'name phone address location preferredLanguage')
      .populate('assignedVolunteer', 'name phone volunteerRating location')
      .populate('assignedBy', 'name email');

    res.json({
      message: 'Volunteer successfully assigned by administrator',
      request: populated,
    });
  } catch (error) {
    console.error('Assign volunteer manually error:', error);
    res.status(500).json({ message: 'Failed to assign volunteer' });
  }
};

// @desc Reassign volunteer to a request (Admin only)
// @route PATCH /api/requests/:requestId/reassign-volunteer
const reassignVolunteer = async (req, res) => {
  try {
    const { volunteerId, notes } = req.body;
    if (!volunteerId) {
      return res.status(400).json({ message: 'New volunteer ID is required' });
    }

    const request = await AssistanceRequest.findById(req.params.requestId).populate('elder');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const newVolunteer = await User.findById(volunteerId);
    if (!newVolunteer || newVolunteer.role !== 'volunteer') {
      return res.status(400).json({ message: 'Valid volunteer required' });
    }

    const prevVolunteerId = request.assignedVolunteer;

    // Calculate distance for new volunteer
    let calculatedDistance = null;
    let comparison = 'different_location';
    const elderLoc = {
      latitude: request.location?.latitude || request.elder?.location?.latitude,
      longitude: request.location?.longitude || request.elder?.location?.longitude,
    };
    if (isValidLocation(elderLoc) && isValidLocation(newVolunteer.location)) {
      const km = calculateDistance(
        elderLoc.latitude,
        elderLoc.longitude,
        newVolunteer.location.latitude,
        newVolunteer.location.longitude
      );
      calculatedDistance = Math.round(km * 1000);
      comparison = calculatedDistance <= SAME_LOCATION_RADIUS_METERS ? 'same_location' : 'different_location';
    } else {
      comparison = 'unavailable';
    }

    request.assignedVolunteer = newVolunteer._id;
    request.assignedBy = req.user._id;
    request.assignmentType = 'admin_manual';
    request.assignmentStatus = 'reassigned';
    request.locationComparison = comparison;
    request.distanceMeters = calculatedDistance;
    request.status = 'Volunteer Assigned';

    request.assignmentHistory.push({
      assignedVolunteer: newVolunteer._id,
      assignedBy: req.user._id,
      assignmentType: 'admin_manual',
      timestamp: new Date(),
      notes: notes || `Reassigned by admin from ${prevVolunteerId || 'none'} to ${newVolunteer.name}`,
    });

    await request.save();

    // Notify previous volunteer if any
    if (prevVolunteerId) {
      await Notification.create({
        recipient: prevVolunteerId,
        title: 'Task Reassigned',
        message: `Task ${request.category} was reassigned by an administrator.`,
        type: 'Assistance',
        link: '/volunteer/requests',
      });
    }

    // Notify new volunteer
    await Notification.create({
      recipient: newVolunteer._id,
      title: 'New Task Assigned',
      message: `You were assigned to assistance request: ${request.category}`,
      type: 'Assistance',
      link: '/volunteer/requests',
    });

    // Notify elder
    await Notification.create({
      recipient: request.elder._id,
      title: 'Volunteer Reassigned',
      message: `A new volunteer has been assigned: ${newVolunteer.name}`,
      type: 'Assistance',
      link: '/elder/requests',
    });

    const populated = await AssistanceRequest.findById(request._id)
      .populate('elder', 'name phone address location preferredLanguage')
      .populate('assignedVolunteer', 'name phone volunteerRating location')
      .populate('assignedBy', 'name email');

    res.json({
      message: 'Volunteer successfully reassigned',
      request: populated,
    });
  } catch (error) {
    console.error('Reassign volunteer error:', error);
    res.status(500).json({ message: 'Failed to reassign volunteer' });
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
      .populate('elder', 'name phone address emergencyContact location')
      .populate('assignedVolunteer', 'name phone volunteerRating location')
      .populate('assignedBy', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request status' });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getPendingAssignmentRequests,
  getAvailableVolunteersForRequest,
  assignVolunteerManually,
  reassignVolunteer,
  updateRequestStatus,
};
