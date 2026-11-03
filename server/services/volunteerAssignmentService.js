const User = require('../models/User');
const Notification = require('../models/Notification');
const AssistanceRequest = require('../models/AssistanceRequest');
const { calculateDistance } = require('./matchingService');

/**
 * Same-Location radius in meters.
 * Defaults to 100 meters (or configurable via SAME_LOCATION_RADIUS_METERS env).
 */
const SAME_LOCATION_RADIUS_METERS = Number(process.env.SAME_LOCATION_RADIUS_METERS) || 100;

/**
 * Validates whether GPS coordinates are non-zero numbers.
 */
function isValidLocation(loc) {
  if (!loc) return false;
  const lat = Number(loc.latitude);
  const lon = Number(loc.longitude);
  return !isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0);
}

/**
 * Evaluates volunteer assignment for an assistance request:
 *
 * RULE 1: If Elder & eligible Volunteer are within SAME_LOCATION_RADIUS_METERS (100m):
 *   -> Automatically assign the best volunteer.
 *   -> status: 'Volunteer Assigned', assignmentType: 'automatic', assignmentStatus: 'assigned'
 *   -> locationComparison: 'same_location'
 *
 * RULE 2: If distance > radius, or locations unavailable / missing:
 *   -> Do NOT auto-assign.
 *   -> status: 'Pending', assignmentType: 'unassigned', assignmentStatus: 'pending'
 *   -> locationComparison: 'different_location' or 'unavailable'
 *   -> Placed into Admin Manual Assignment Queue.
 */
async function processVolunteerAssignment(request, elder) {
  const elderLoc = {
    latitude: request.location?.latitude || elder.location?.latitude,
    longitude: request.location?.longitude || elder.location?.longitude,
  };

  const hasValidElderLoc = isValidLocation(elderLoc);

  // Retrieve approved and available volunteers
  const volunteers = await User.find({
    role: 'volunteer',
    isVerifiedVolunteer: true,
    isVolunteerAvailable: true,
  });

  if (!hasValidElderLoc || volunteers.length === 0) {
    // Missing location or no active volunteers -> Admin Queue
    request.status = 'Pending';
    request.assignmentType = 'unassigned';
    request.assignmentStatus = 'pending';
    request.locationComparison = hasValidElderLoc ? 'different_location' : 'unavailable';
    await request.save();

    // Notify admins about pending manual assignment queue
    await notifyAdminsOfPendingQueue(request, elder);
    return { assigned: false, reason: 'Elder location unavailable or no active volunteers' };
  }

  // Calculate distance for all volunteers
  const evaluatedVolunteers = [];

  for (const vol of volunteers) {
    const volLoc = vol.location;
    if (!isValidLocation(volLoc)) continue;

    // Haversine distance in km converted to meters
    const distanceKm = calculateDistance(
      elderLoc.latitude,
      elderLoc.longitude,
      volLoc.latitude,
      volLoc.longitude
    );
    const distanceMeters = Math.round(distanceKm * 1000);

    // Check category capability (if volunteer skills defined)
    const supportsCategory =
      !vol.volunteerSkills ||
      vol.volunteerSkills.length === 0 ||
      vol.volunteerSkills.includes(request.category);

    evaluatedVolunteers.push({
      volunteer: vol,
      distanceMeters,
      supportsCategory,
      rating: vol.volunteerRating || 5.0,
    });
  }

  // Check if any volunteer satisfies Same-Location rule
  const sameLocationVolunteers = evaluatedVolunteers.filter(
    (v) => v.distanceMeters <= SAME_LOCATION_RADIUS_METERS && v.supportsCategory
  );

  if (sameLocationVolunteers.length > 0) {
    // Rank by: 1. Distance, 2. Rating
    sameLocationVolunteers.sort((a, b) => {
      if (a.distanceMeters !== b.distanceMeters) {
        return a.distanceMeters - b.distanceMeters;
      }
      return b.rating - a.rating;
    });

    const chosen = sameLocationVolunteers[0];

    // Atomically assign volunteer
    request.assignedVolunteer = chosen.volunteer._id;
    request.status = 'Volunteer Assigned';
    request.assignmentType = 'automatic';
    request.assignmentStatus = 'assigned';
    request.locationComparison = 'same_location';
    request.distanceMeters = chosen.distanceMeters;
    request.assignmentHistory.push({
      assignedVolunteer: chosen.volunteer._id,
      assignmentType: 'automatic',
      timestamp: new Date(),
      notes: `Auto-assigned: Same location match (${chosen.distanceMeters}m <= ${SAME_LOCATION_RADIUS_METERS}m)`,
    });
    await request.save();

    // Send notifications to Elder and Volunteer
    const elderLang = elder.preferredLanguage || 'en';
    const elderMsg =
      elderLang === 'ta'
        ? `உங்களுக்கு ஒரு தன்னார்வலர் நியமிக்கப்பட்டுள்ளார்: ${chosen.volunteer.name}`
        : `Your volunteer has been assigned: ${chosen.volunteer.name}`;

    await Notification.create({
      recipient: elder._id,
      title: elderLang === 'ta' ? 'தன்னார்வலர் ஒதுக்கீடு' : 'Volunteer Assigned',
      message: elderMsg,
      type: 'Assistance',
      link: '/elder/requests',
    });

    const volLang = chosen.volunteer.preferredLanguage || 'en';
    const volMsg =
      volLang === 'ta'
        ? `புதிய பணி தானாக ஒதுக்கப்பட்டுள்ளது: ${request.category} (அருகில்: ${chosen.distanceMeters} மீ)`
        : `New assistance task auto-assigned: ${request.category} (Same location: ${chosen.distanceMeters}m)`;

    await Notification.create({
      recipient: chosen.volunteer._id,
      title: volLang === 'ta' ? 'புதிய பணி ஒதுக்கீடு' : 'New Task Assigned',
      message: volMsg,
      type: 'Assistance',
      link: '/volunteer/requests',
    });

    return { assigned: true, volunteer: chosen.volunteer, distanceMeters: chosen.distanceMeters };
  }

  // RULE 2: Different location -> DO NOT auto-assign. Add to Admin Manual Assignment Queue.
  const closestDistance = evaluatedVolunteers.length > 0
    ? Math.min(...evaluatedVolunteers.map((v) => v.distanceMeters))
    : null;

  request.status = 'Pending';
  request.assignmentType = 'unassigned';
  request.assignmentStatus = 'pending';
  request.locationComparison = 'different_location';
  request.distanceMeters = closestDistance;
  await request.save();

  // Notify Elder that request is in Admin Queue
  const elderLang = elder.preferredLanguage || 'en';
  const elderPendingMsg =
    elderLang === 'ta'
      ? 'உங்கள் உதவி கோரிக்கை நிர்வாகியின் ஒதுக்கீட்டிற்காக காத்திருக்கிறது.'
      : 'Your assistance request is waiting for administrator assignment.';

  await Notification.create({
    recipient: elder._id,
    title: elderLang === 'ta' ? 'கோரிக்கை சமர்ப்பிக்கப்பட்டது' : 'Request Submitted',
    message: elderPendingMsg,
    type: 'Assistance',
    link: '/elder/requests',
  });

  // Notify Admins
  await notifyAdminsOfPendingQueue(request, elder);

  return { assigned: false, reason: 'Different location. Awaiting manual assignment by administrator.' };
}

async function notifyAdminsOfPendingQueue(request, elder) {
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      recipient: admin._id,
      title: 'Manual Assignment Queue: New Request',
      message: `Request #${request.requestId} (${request.category}) for ${elder.name} requires manual volunteer assignment.`,
      type: 'Assistance',
      link: '/admin/requests',
    });
  }
}

module.exports = {
  SAME_LOCATION_RADIUS_METERS,
  processVolunteerAssignment,
  isValidLocation,
};
