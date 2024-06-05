const User = require('../mongo/spin-and-earn/User');

const TWO_MINUTES = 2 * 60 * 1000; // for testing purposes
const FIVE_HOURS = 5 * 60 * 60 * 1000;

const addFreeSpinIfNeeded = async (req, res, next) => {
  const userId = req.params.userId;
  
  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const twoMinutesAgo = new Date(Date.now() - FIVE_HOURS);
    const lastSpinTime = user?.lastSpinTime?.length ? new Date(user.lastSpinTime[user.lastSpinTime.length - 1]) : null;

    if (!lastSpinTime || lastSpinTime < twoMinutesAgo) {
      if (user.spinsAvailable < 2) {
        user.spinsAvailable += 1;
      }

      if (user.lastSpinTime.length >= 2) {
        user.lastSpinTime.shift(); // Remove the oldest time if length is >= 2
      }

      user.lastSpinTime.push(new Date());

      await User.updateOne(
        { _id: user._id, __v: user.__v },
        {
          $set: {
            spinsAvailable: user.spinsAvailable,
            lastSpinTime: user.lastSpinTime
          },
          $inc: { __v: 1 } 
        }
      );
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error adding free spin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = addFreeSpinIfNeeded;