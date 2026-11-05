const mongoose = require('mongoose');

// Trusted Contact
const trustedContactSchema = new mongoose.Schema({
  elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relation: { type: String, default: 'Family' },
  isEmergencyDefault: { type: Boolean, default: false }
}, { timestamps: true });

// CheckIn (Daily Check-in tracking for elderly)
const checkInSchema = new mongoose.Schema({
  elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Completed', 'Missed', 'AlertTriggered'], default: 'Completed' },
  checkInTime: { type: Date, default: Date.now },
  notes: { type: String, default: 'Elder safe and well' }
}, { timestamps: true });

// Conversation & Message for real-time Socket.IO chat
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Volunteer Review
const reviewSchema = new mongoose.Schema({
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssistanceRequest' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' }
}, { timestamps: true });

// Community Event
const communityEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Social' },
  date: { type: Date, required: true },
  location: { type: String, default: 'Online / Community Hall' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Medical Document Vault
const medicalDocumentSchema = new mongoose.Schema({
  elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Prescription', 'Lab Report', 'Discharge Summary', 'Insurance', 'Other'], default: 'Prescription' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'application/pdf' },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Assistance Expense Tracker
const expenseSchema = new mongoose.Schema({
  elder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['Medicine', 'Doctor Visit', 'Groceries', 'Transport', 'Caregiving', 'Other'], default: 'Medicine' },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = {
  TrustedContact: mongoose.model('TrustedContact', trustedContactSchema),
  CheckIn: mongoose.model('CheckIn', checkInSchema),
  Conversation: mongoose.model('Conversation', conversationSchema),
  Message: mongoose.model('Message', messageSchema),
  Review: mongoose.model('Review', reviewSchema),
  CommunityEvent: mongoose.model('CommunityEvent', communityEventSchema),
  MedicalDocument: mongoose.model('MedicalDocument', medicalDocumentSchema),
  Expense: mongoose.model('Expense', expenseSchema),
};

