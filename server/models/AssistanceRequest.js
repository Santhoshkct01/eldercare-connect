const mongoose = require('mongoose');

const assistanceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      default: () => 'REQ-' + Math.floor(100000 + Math.random() * 900000),
    },
    elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Hospital Visit',
        'Doctor Appointment',
        'Medicine Collection',
        'Grocery Shopping',
        'Transportation',
        'Household Assistance',
        'Companionship',
        'Emergency Assistance',
        'Other',
      ],
    },
    description: { type: String, required: true },
    location: {
      address: { type: String, default: '' },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'Volunteer Assigned',
        'On The Way',
        'In Progress',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who assigned manually
    assignmentType: {
      type: String,
      enum: ['automatic', 'admin_manual', 'unassigned'],
      default: 'unassigned',
    },
    assignmentStatus: {
      type: String,
      enum: ['pending', 'assigned', 'reassigned', 'cancelled'],
      default: 'pending',
    },
    locationComparison: {
      type: String,
      enum: ['same_location', 'different_location', 'unavailable'],
      default: 'unavailable',
    },
    distanceMeters: { type: Number, default: null },
    assignmentHistory: [
      {
        previousVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignmentType: { type: String },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
      },
    ],
    notes: { type: String, default: '' },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssistanceRequest', assistanceRequestSchema);
