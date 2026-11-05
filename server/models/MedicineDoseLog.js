const mongoose = require('mongoose');

const medicineDoseLogSchema = new mongoose.Schema(
  {
    elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    scheduledDate: { type: String, required: true }, // Format: YYYY-MM-DD in IST
    scheduledTime: { type: String, required: true }, // Format: HH:mm (24h internal storage)
    status: {
      type: String,
      enum: ['Pending', 'Taken', 'Missed', 'Skipped'],
      default: 'Pending',
      index: true,
    },
    idempotencyKey: { type: String, required: true, unique: true }, // elder_med_date_time
    triggeredAt: { type: Date, default: Date.now },
    takenAt: { type: Date },
    missedAt: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

medicineDoseLogSchema.index({ elder: 1, scheduledDate: 1 });
medicineDoseLogSchema.index({ medicine: 1, scheduledDate: 1 });

module.exports = mongoose.model('MedicineDoseLog', medicineDoseLogSchema);
