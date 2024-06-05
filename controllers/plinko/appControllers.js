const User = require('../../mongo/plinko/User');

async function loginUser(req, res) {
  const userId = req.params.userId;

  try {
    let user = await User.findOne({ userId });

    if (!user) {
      const userObject = new User({
        userId: userId,
        unclaimedWhisks: 1000,
        points: 0,
  
      });
      user = await userObject.save();
    }

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserById(req, res) {
  const userId = req.params.userId;

  try {

    const user = await User.findOne({ userId });

    if (!user) {
    
      return res.status(404).json({ error: 'User not found' });
    }
   
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function updateBalance(req, res) {
  const userId = req.params.userId;
  const winPoints = req.body.points;

  try {

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.unclaimedWhisks += winPoints;

    await user.save();

    res.status(200).json('succession update the points');

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  loginUser,
  getUserById,
  updateBalance
};