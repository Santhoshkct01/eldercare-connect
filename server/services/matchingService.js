// Haversine formula to calculate great-circle distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Smart volunteer matching algorithm:
 * Ranks available & verified volunteers based on:
 * 1. Proximity (Haversine distance)
 * 2. Volunteer rating
 * 3. Volunteer skills matching category
 */
async function matchVolunteers(category, elderLocation, User) {
  const volunteers = await User.find({
    role: 'volunteer',
    isVerifiedVolunteer: true,
    isVolunteerAvailable: true,
  });

  if (!volunteers || volunteers.length === 0) return [];

  const evaluated = volunteers.map((v) => {
    const lat = v.location?.latitude || 11.0168;
    const lon = v.location?.longitude || 76.9558;
    const distanceKm = calculateDistance(
      elderLocation.latitude || 11.0168,
      elderLocation.longitude || 76.9558,
      lat,
      lon
    );

    // Compute composite match score (lower score is better: prioritizes closest & highest rated)
    const ratingScore = (5 - (v.volunteerRating || 5)) * 2; // penalty for lower rating
    const skillBonus = v.volunteerSkills?.includes(category) ? -2 : 0;
    const compositeScore = distanceKm + ratingScore + skillBonus;

    return {
      volunteer: v,
      distanceKm: Math.round(distanceKm * 10) / 10,
      compositeScore,
    };
  });

  evaluated.sort((a, b) => a.compositeScore - b.compositeScore);
  return evaluated;
}

module.exports = { calculateDistance, matchVolunteers };

