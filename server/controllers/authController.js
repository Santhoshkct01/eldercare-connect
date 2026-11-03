const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eldercare_super_secure_jwt_secret_key_2025_prod', {
    expiresIn: '30d',
  });
};

// @desc Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      age,
      address,
      city,
      role,
      emergencyContact,
      medicalConditions,
      mobilityRequirements,
      preferredLanguage,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      age: Number(age) || 65,
      address: address || '',
      city: city || '',
      role: role || 'elder',
      emergencyContact: emergencyContact || {},
      medicalConditions: medicalConditions || [],
      mobilityRequirements: mobilityRequirements || 'None',
      preferredLanguage: preferredLanguage || 'en',
      isVerifiedVolunteer: role === 'volunteer' ? false : true,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      preferredLanguage: user.preferredLanguage,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      age: user.age,
      address: user.address,
      city: user.city,
      isVerifiedVolunteer: user.isVerifiedVolunteer,
      isVolunteerAvailable: user.isVolunteerAvailable,
      emergencyContact: user.emergencyContact,
      preferredLanguage: user.preferredLanguage,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc Get current profile
// @route GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

// @desc Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.city = req.body.city || user.city;
    user.preferredLanguage = req.body.preferredLanguage || user.preferredLanguage;
    if (req.body.emergencyContact) user.emergencyContact = req.body.emergencyContact;
    if (typeof req.body.isVolunteerAvailable !== 'undefined') {
      user.isVolunteerAvailable = req.body.isVolunteerAvailable;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      isVolunteerAvailable: updated.isVolunteerAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
