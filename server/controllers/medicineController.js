const Medicine = require('../models/Medicine');

const addMedicine = async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.body.elderId;
    const { name, dosage, frequency, scheduleTimes, instructions, stockRemaining } = req.body;
    const med = await Medicine.create({
      elder,
      name,
      dosage,
      frequency,
      scheduleTimes: scheduleTimes || ['08:00'],
      instructions,
      stockRemaining: stockRemaining || 30,
    });
    res.status(201).json(med);
  } catch (err) {
    res.status(500).json({ message: 'Error adding medicine' });
  }
};

const getMedicines = async (req, res) => {
  try {
    const elder = req.user.role === 'elder' ? req.user._id : req.query.elderId;
    const meds = await Medicine.find(elder ? { elder } : {}).populate('elder', 'name phone');
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching medicines' });
  }
};

const recordMedicineTaken = async (req, res) => {
  try {
    const { status, scheduledTime } = req.body;
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ message: 'Medicine not found' });

    med.history.push({
      takenAt: new Date(),
      status: status || 'Taken',
      scheduledTime: scheduledTime || '08:00',
    });
    if (med.stockRemaining > 0) med.stockRemaining -= 1;
    await med.save();
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: 'Error recording medicine intake' });
  }
};

module.exports = { addMedicine, getMedicines, recordMedicineTaken };
