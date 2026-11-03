const express = require('express');
const router = express.Router();
const { triggerSOS, getSOSAlerts, updateSOS } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');

router.post('/', protect, triggerSOS);
router.get('/', protect, getSOSAlerts);
router.put('/:id', protect, updateSOS);

module.exports = router;
