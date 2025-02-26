const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUser = req.user;

    const users = await User.find({
      $and: [
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { mobileNumber: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: currentUser._id } }
      ]
    }).select('email mobileNumber isOnline');

    res.json(users);
  } catch (error) {
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