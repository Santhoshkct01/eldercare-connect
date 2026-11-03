const User = require('../models/User');
const AssistanceRequest = require('../models/AssistanceRequest');
const SOSAlert = require('../models/SOSAlert');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const elderlyUsers = await User.countDocuments({ role: 'elder' });
    const registeredVolunteers = await User.countDocuments({ role: 'volunteer' });
    const approvedVolunteers = await User.countDocuments({ role: 'volunteer', isVerifiedVolunteer: true });
    const pendingApprovals = await User.countDocuments({ role: 'volunteer', isVerifiedVolunteer: false });
    const activeRequests = await AssistanceRequest.countDocuments({ status: { $in: ['Pending', 'Accepted', 'Volunteer Assigned', 'On The Way', 'In Progress'] } });
    const completedRequests = await AssistanceRequest.countDocuments({ status: 'Completed' });
    const emergencyCases = await SOSAlert.countDocuments({ status: 'Active' });

    // Category distribution for charts
    const categoryDistribution = await AssistanceRequest.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      elderlyUsers,
      registeredVolunteers,
      approvedVolunteers,
      pendingApprovals,
      activeRequests,
      completedRequests,
      emergencyCases,
      categoryDistribution: categoryDistribution.map((item) => ({ name: item._id, value: item.count })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to aggregate statistics' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const verifyVolunteer = async (req, res) => {
  try {
    const { isVerifiedVolunteer } = req.body;
    const volunteer = await User.findById(req.params.id);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    volunteer.isVerifiedVolunteer = isVerifiedVolunteer;
    await volunteer.save();
    res.json({ message: 'Volunteer verification updated', volunteer });
  } catch (error) {
    res.status(500).json({ message: 'Error updating volunteer verification' });
  }
};

module.exports = { getDashboardStats, getAllUsers, verifyVolunteer };
