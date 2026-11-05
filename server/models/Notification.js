const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['SOS', 'Medicine', 'Appointment', 'Assistance', 'System', 'CheckIn'],
      default: 'System',
    },
    relatedMedicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    scheduledTime: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
    idempotencyKey: { type: String, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
