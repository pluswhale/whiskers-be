const User = require('../mongo/User');

const addFreeSpinIfNeeded = async (req, res, next) => {
  const userId = req.params.userId; // Assuming userId is passed in the request parameters
  try {
      const user = await User.findOne({ userId });
      
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    if (user.lastSpinTime < fiveHoursAgo) {
      user.addFreeSpin();
      await user.save();
    }

    next();
  } catch (error) {
    console.error('Error adding free spin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = addFreeSpinIfNeeded;