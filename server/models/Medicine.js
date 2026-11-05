const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, default: 'Daily' }, // e.g. Daily, Twice daily, As needed
    scheduleTimes: [{ type: String }], // Stored internally as unambiguous 24h HH:mm (e.g. ["10:00", "22:00"])
    timezone: { type: String, default: 'Asia/Kolkata' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    instructions: { type: String, default: 'Take with food' },
    stockRemaining: { type: Number, default: 30 },
    active: { type: Boolean, default: true },
    history: [
      {
        takenAt: { type: Date },
        status: { type: String, enum: ['Taken', 'Missed', 'Skipped'], default: 'Taken' },
        scheduledTime: { type: String }, // e.g. "10:00"
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
