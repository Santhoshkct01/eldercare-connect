const mongoose = require('mongoose');

const wellnessCheckSchema = new mongoose.Schema(
  {
    elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    mood: { type: String, enum: ['Great', 'Good', 'Okay', 'Unwell', 'In Pain'], default: 'Good' },
    sleepHours: { type: Number, default: 7 },
    waterIntakeGlasses: { type: Number, default: 6 },
    bloodPressure: { systolic: Number, diastolic: Number },
    sugarLevel: { type: Number },
    symptoms: [{ type: String }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WellnessCheck', wellnessCheckSchema);

