const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    role: {
      type: String,
      enum: ['elder', 'family', 'volunteer', 'caregiver', 'admin'],
      default: 'elder',
    },
    profilePicture: { type: String, default: '' },
    isVerifiedVolunteer: { type: Boolean, default: false },
    isVolunteerAvailable: { type: Boolean, default: true },
    volunteerSkills: [{ type: String }],
    volunteerRating: { type: Number, default: 5.0 },
    // Specific elderly fields
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    medicalConditions: [{ type: String }],
    mobilityRequirements: { type: String, default: 'None' },
    preferredLanguage: {
      type: String,
      enum: ['en', 'ta', 'hi'],
      default: 'en',
    },
    familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignedCaregivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: {
      latitude: { type: Number, default: 11.0168 },
      longitude: { type: Number, default: 76.9558 },
      updatedAt: { type: Date, default: Date.now },
      isSharing: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
