const express = require('express');
const router = express.Router();
const { addMedicine, getMedicines, recordMedicineTaken } = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addMedicine);
router.get('/', protect, getMedicines);
router.put('/:id/take', protect, recordMedicineTaken);

module.exports = router;

