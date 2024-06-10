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

    res.status(200).json(user);

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' + error });
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

async function incrementBalance(req, res) {
  const userId = req.params.userId;
  const winPoints = req.body.points;

  try {

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.unclaimedWhisks += winPoints;
    user.points += winPoints;

    await user.save();

    res.status(200).json('succession update the points');

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function decrementBalance(req, res) {
  const userId = req.params.userId;
  const winPoints = req.body.points;

  try {

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.unclaimedWhisks -= winPoints;
    user.points -= winPoints;

    await user.save();

    res.status(200).json('succession update the points');

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function topupBalance(req, res) {
  const userId = req.params.userId;
  const {amount} = req.body;

  try {

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.unclaimedWhisks += amount;
    user.points += amount;

    await user.save();

    res.status(200).json('succession update the points');

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function withdrawBalance(req, res) {
  const userId = req.params.userId;
  const {amount} = req.body;

  try {

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.unclaimedWhisks -= amount;
    user.points -= amount;

    await user.save();

    res.status(200).json('succession update the points');

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  loginUser,
  getUserById,
  incrementBalance,
  decrementBalance,
  topupBalance,
  withdrawBalance,
};