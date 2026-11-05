const express = require('express');
const router = express.Router();
const {
  addMedicine,
  getMedicines,
  recordMedicineTaken,
  getVapidPublicKey,
  subscribePush,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

router.get('/vapid-key', getVapidPublicKey);
router.post('/subscribe-push', protect, subscribePush);

router.post('/', protect, addMedicine);
router.get('/', protect, getMedicines);
router.put('/:id/take', protect, recordMedicineTaken);

module.exports = router;
