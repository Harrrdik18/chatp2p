const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const { query = '' } = req.query;
    const currentUser = req.user;

    // Find all users except the current user
    const users = await User.find({
      _id: { $ne: currentUser._id }, // Exclude current user
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { mobileNumber: { $regex: query, $options: 'i' } }
      ]
    })
    .select('email mobileNumber isOnline')
    .lean(); // Convert to plain JavaScript objects

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.email.split('@')[0], // Use email username as display name
      lastMessage: '', // Will be populated when we implement message history
      time: '', // Will be populated when we implement message history
      isOnline: user.isOnline || false,
      email: user.email,
      mobileNumber: user.mobileNumber
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

exports.getPendingMessages = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('pendingMessages.from', 'email');
    
    const messages = user.pendingMessages;
    user.pendingMessages = [];
    await user.save();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving pending messages' });
  }
}; 