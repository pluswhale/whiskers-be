const User = require('../mongo/User');

const addFreeSpinIfNeeded = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const lastSpinTime = user.lastSpinTime.length ? new Date(user.lastSpinTime[user.lastSpinTime.length - 1]) : null;

    if (!lastSpinTime || lastSpinTime < fiveHoursAgo) {
      if (user.spinsAvailable < 2) {
        user.addFreeSpin();
      }
      // Ensure lastSpinTime is updated for new users
      if (!lastSpinTime) {
        user.lastSpinTime.push(Date.now());
      }
      await user.save();
    }

    req.user = user; // Pass the user object to the next middleware
    next();
  } catch (error) {
    console.error('Error adding free spin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = addFreeSpinIfNeeded;