const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema(
  {
    elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['Active', 'Responded', 'Resolved', 'False Alarm'],
      default: 'Active',
    },
    notifiedContacts: [
      {
        name: String,
        phone: String,
        notifiedAt: { type: Date, default: Date.now },
      },
    ],
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: { type: Date },
    resolvedAt: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SOSAlert', sosAlertSchema);

