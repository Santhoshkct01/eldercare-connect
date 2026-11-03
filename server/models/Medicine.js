const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, default: 'Daily' }, // e.g., Daily, Twice daily, As needed
    scheduleTimes: [{ type: String }], // e.g. ["08:00", "14:00", "20:00"]
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    instructions: { type: String, default: 'Take with food' },
    stockRemaining: { type: Number, default: 30 },
    history: [
      {
        takenAt: { type: Date },
        status: { type: String, enum: ['Taken', 'Missed', 'Skipped'], default: 'Taken' },
        scheduledTime: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);

