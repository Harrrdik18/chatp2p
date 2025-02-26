const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword, validateMobileNumber } = require('../utils/validation');

exports.signup = async (req, res) => {
  try {
    const { email, password, mobileNumber } = req.body;

    // Validate input
    if (!email || !password || !mobileNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!validateMobileNumber(mobileNumber)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Mobile number already registered'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      mobileNumber
    });

    await user.save();

    res.status(201).json({ 
      success: true,
      message: 'User created successfully' 
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login' });
  }
}; 