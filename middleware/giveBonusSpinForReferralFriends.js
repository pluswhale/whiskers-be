const User = require('../mongo/User');

const giveBonusSpinForReferralFriends = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ userId });

    if (!user) {
        next();
    }
      
    const referredUsers = user?.referredUsers;
      
    if (referredUsers) {
      const changedReferredUsers =  referredUsers.map((referredUser) => {
        if (!referredUser.isAccrued) { 
            const referredUserObject = User.findOne({ _id: referredUser?.id });

            if (referredUserObject) {
                if (referredUserObject.countSpins >= 2) {
                    user.bonusSpins += 3;
                    return { ...referredUser, isAccrued: true };
                } 
            }
        } else {
            return referredUser;
        }
      });
        user.referredUsers = changedReferredUsers;

        await user.save();

    }
      
    next();
      
  } catch (error) {
    console.error('Error adding free spin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = giveBonusSpinForReferralFriends;