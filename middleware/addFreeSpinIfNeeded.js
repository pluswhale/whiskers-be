const User = require('../mongo/spin-and-earn/User');

const TWO_MINUTES = 2 * 60 * 1000; // for testing purposes
const FIVE_HOURS = 6 * 60 * 60 * 1000;

const addFreeSpinIfNeeded = async (req, res, next) => {
  const userId = req.params.userId;
  
  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const twoMinutesAgo = new Date(Date.now() - FIVE_HOURS); // 2 minutes ago
    const lastSpinTimes = user.lastSpinTime || [];

    // Calculate how many spins should be recharged
    let spinsToRecharge = 0;
    lastSpinTimes.forEach((spinTime, index) => {
      if (new Date(spinTime) < twoMinutesAgo) {
        spinsToRecharge++;
        lastSpinTimes[index] = null; // Mark for removal
      }
    });

    // Remove nulls (old spin times)
    user.lastSpinTime = lastSpinTimes.filter(Boolean);

    if (spinsToRecharge > 0) {
      user.spinsAvailable = Math.min(user.spinsAvailable + spinsToRecharge, 2);
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