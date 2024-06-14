const User = require('../../mongo/spin-and-earn/User');
const { v4: uuidv4 } = require('uuid');
const addFreeSpinIfNeeded = require('../../middleware/addFreeSpinIfNeeded'); 
const Snapshot = require('../../mongo/spin-and-earn/Snapshot');

async function loginUser(req, res) {
  const userId = req.params.userId;
  const referal = uuidv4();

  try {
    let user = await User.findOne({ userId });

    if (!user) {
      const userObject = new User({
        userId: userId, 
        points: 0,
        unClaimedWhisks: 0,
        userTonAddress: null,
        spinsAvailable: 2,
        countSpins: 0,
        bonusSpins: 0,
        referralCode: referal,
        referredBy: null, 
        referredUsers: []
      });
      user = await userObject.save();
    }
    // After successful authentication, proceed with the free spin check
    await addFreeSpinIfNeeded(req, res, async () => {
      res.status(200).json({ message: 'Login successful', user });
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveTonAddress(req, res) {
  const userId = req.params.userId;
  const { userTonAddress } = req.body;

  try {
    let user = await User.findOne({ userId });

    if (!user.userTonAddress) {
      user.userTonAddress = userTonAddress;
      user = await user.save();
      return res.status(200).json({ message: 'User ton address got saved.' });
    }

    res.status(400).json({ message: 'User ton address already exists' });

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

async function getUsersUnclaimedWhisks(req, res) {
  try {
     const users = await User.find({}, 'userTonAddress unclaimedWhisks');

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Users not found' });
    }
   
    const usersWithSelectedFields = users.map(user => ({
      userId: user.userId,
      userTonAddress: user.userTonAddress,
      unclaimedWhisks: user.unclaimedWhisks,
      points: user.points
    }));

    res.json(usersWithSelectedFields);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' + error});
  }
}

async function claimUserWhisks(req, res) {
  const userId = req.params.userId;
  try {

    const user = await User.findOne({userId});

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.unclaimedWhisks) {
      user.unclaimedWhisks = 0;
      user.points = 0;
      await user.save();
      return res.status(200).json({message: 'successfully claimed whisks'});
    }

    res.status(400).json({ message: 'not enough unclaimed whisks' });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getSpinByUser(req, res) {
  try {

    const userId = req.params.userId;
    const { winScore, isFreeSpin } = req.body;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.bonusSpins <= 0 && user.spinsAvailable <= 0) {
      return res.status(400).json({ error: 'No spins available' });
    }

    user.countSpins += 1;

    user.points += winScore;
    user.unclaimedWhisks += winScore;

    if (isFreeSpin) {
      user.spinsAvailable -= 1;
      user.lastSpinTime.push(new Date());
    } else {
      user.bonusSpins -= 1;
    }

    if (user.lastSpinTime.length > 2) {
      user.lastSpinTime.shift();
    }

    await user.save();

    res.status(200).json({ message: 'Spin successful' });

  } catch (error) {
    console.error('Error spinning wheel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getBonusSpinsByUser(req, res) {
  try {

    const userId = req.params.userId;
    const { countSpins } = req.body;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (countSpins) {
      user.bonusSpins += countSpins;
    }

    await user.save();

    res.status(200).json({ message: 'Spins bought' });

  } catch (error) {
    console.error('Error spinning wheel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getReferredFriend(req, res) {
  try {
    const referredUserId = req.params.referredUserId;
    const { referredById } = req.body;

    if (referredUserId === referredById) {
      return res.status(400).json({ error: 'Cannot refer yourself!' });
    }

    const referredUser = await User.findOne({ userId: referredUserId });
    const referredByUser = await User.findOne({ userId: referredById });

    if (!referredUser) {
      return res.status(404).json({ error: 'Referred user not found' });
    }

    if (!referredByUser) {
      return res.status(404).json({ error: 'Referring user not found' });
    }

    const isAlreadyReferred = referredByUser?.referredUsers?.some((currentReferredUser) => currentReferredUser?.id?.equals(referredUser._id));

    if (!isAlreadyReferred) {
      referredByUser?.referredUsers?.push({ isAccrued: false, id: referredUser?._id });
      referredUser.referredBy = referredByUser?._id;

      await referredUser.save();
      await referredByUser.save();

      res.status(200).json({ message: 'Successfully referred by user' });
    } else {
      res.status(400).json({ message: 'Such a user already was referred' });
    }

  } catch (error) {
    console.error('Error in referral process:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSnapshot(req, res) {
  try {

    const snapshots = await Snapshot.find({}, "airdropCell campaignNumber");

    if (!snapshots) {
    
      return res.status(404).json({ error: 'snapshots not found' });
    }
   
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function updateSnapshot(req, res) {
  const { airdropCell, campaignNumber } = req.body;
  try {

    const snapshot = await Snapshot.findOne({snapShotId: 1});

    if (!snapshot) {

      return res.status(404).json({ error: 'snapshot not found' });
    }

    if (airdropCell) {
      snapshot.airdropCell = airdropCell;
    }

    if (campaignNumber) {
      snapshot.campaignNumber = campaignNumber;
    }

    snapshot.save();
   
    res.status(200).json('snapshot changed successfully');
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
    loginUser,
    getUserById,
    getSpinByUser,
    getBonusSpinsByUser,
    getReferredFriend,
    saveTonAddress,
    getUsersUnclaimedWhisks,
    claimUserWhisks,
    getSnapshot,
    updateSnapshot
};