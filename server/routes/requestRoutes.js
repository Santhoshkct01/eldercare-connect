const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.put('/:id/status', protect, updateRequestStatus);

module.exports = router;

