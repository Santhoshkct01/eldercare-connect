const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getPendingAssignmentRequests,
  getAvailableVolunteersForRequest,
  assignVolunteerManually,
  reassignVolunteer,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.get('/pending-assignment', protect, authorize('admin'), getPendingAssignmentRequests);
router.get('/available-volunteers/:requestId', protect, authorize('admin'), getAvailableVolunteersForRequest);
router.post('/:requestId/assign-volunteer', protect, authorize('admin'), assignVolunteerManually);
router.patch('/:requestId/reassign-volunteer', protect, authorize('admin'), reassignVolunteer);
router.put('/:id/status', protect, updateRequestStatus);

module.exports = router;
