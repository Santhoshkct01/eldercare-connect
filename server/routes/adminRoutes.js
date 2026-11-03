const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, verifyVolunteer } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/volunteers/:id/verify', protect, authorize('admin'), verifyVolunteer);

module.exports = router;

