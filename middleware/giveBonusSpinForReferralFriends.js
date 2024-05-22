const User = require('../mongo/User');

const giveBonusSpinForReferralFriends = async (req, res, next) => {
    const userId = req.params.userId;


  try {
    const user = await User.findOne({ userId });

    if (!user) {
        return next();
    }
      
    console.log(user);
      
    const referredUsers = user?.referredUsers;

    
    if (referredUsers) {
      for (let i = 0; i < referredUsers.length; i++) {
        const referredUser = referredUsers[i];
        if (!referredUser.isAccrued) { 
            const referredUserObject = await User.findOne({ _id: referredUser.id });
            

          if (referredUserObject && referredUserObject.countSpins >= 2) {
            user.bonusSpins += 3;
            referredUsers[i].isAccrued = true;  // Mark as accrued
          }
        }
      }

      user.referredUsers = referredUsers;
      await user.save();
    }
    
    next();
  } catch (error) {
    console.error('Error adding free spin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = giveBonusSpinForReferralFriends;