// old routes
// app.post('/login/:userId', giveBonusSpinForReferralFriends, async (req, res) => {
//   const userId = req.params.userId;
//   const referal = uuidv4();

//   try {
//     let user = await User.findOne({ userId });

//     if (!user) {
//       const userObject = new User({
//         userId: userId, 
//         unclaimedTokens: 0,
//         spinsAvailable: 2,
//         countSpins: 0,
//         bonusSpins: 0,
//         referralCode: referal,
//         referredBy: null, 
//         referredUsers: []
//       });
//       user = await userObject.save();
//     }
//     // After successful authentication, proceed with the free spin check
//     await addFreeSpinIfNeeded(req, res, async () => {
//       res.status(200).json({ message: 'Login successful', user });
//     });

//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Define a route to get a user by ID
// app.get('/user/:userId', async (req, res) => {
//   const userId = req.params.userId;

//   try {

//     const user = await User.findOne({ userId });

//     if (!user) {
    
//       return res.status(404).json({ error: 'User not found' });
//     }
   
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.post('/spin/:userId', addFreeSpinIfNeeded, checkSpinAvailability, async (req, res) => {
//   try {

//     const userId = req.params.userId;
//     const { winScore, isFreeSpin } = req.body;
//     const user = await User.findOne({ userId });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     if (user.bonusSpins <= 0 && user.spinsAvailable <= 0) {
//       return res.status(400).json({ error: 'No spins available' });
//     }

//     user.countSpins += 1;

//     user.unclaimedTokens += winScore;

//     if (isFreeSpin) {
//       user.spinsAvailable -= 1;
//     } else {
//       user.bonusSpins -= 1;
//     }

//     await user.save();

//     res.status(200).json({ message: 'Spin successful' });

//   } catch (error) {
//     console.error('Error spinning wheel:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.post('/buy/:userId', async (req, res) => {
//   try {

//     const userId = req.params.userId;
//     const { countSpins } = req.body;
//     const user = await User.findOne({ userId });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     if (countSpins) {
//       user.bonusSpins += countSpins;
//     }

//     await user.save();

//     res.status(200).json({ message: 'Spins bought' });

//   } catch (error) {
//     console.error('Error spinning wheel:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.post('/referral/:referredUserId', async (req, res) => {
//   try {
//     const referredUserId = req.params.referredUserId;
//     const { referredById } = req.body;

//     if (referredUserId === referredById) {
//       return res.status(400).json({ error: 'Cannot refer yourself!' });
//     }

//     const referredUser = await User.findOne({ userId: referredUserId });
//     const referredByUser = await User.findOne({ userId: referredById });

//     if (!referredUser) {
//       return res.status(404).json({ error: 'Referred user not found' });
//     }

//     if (!referredByUser) {
//       return res.status(404).json({ error: 'Referring user not found' });
//     }

//     const isAlreadyReferred = referredByUser?.referredUsers?.some((currentReferredUser) => currentReferredUser?.id?.equals(referredUser._id));

//     if (!isAlreadyReferred) {
//       referredByUser?.referredUsers?.push({ isAccrued: false, id: referredUser?._id });
//       referredUser.referredBy = referredByUser?._id;

//       await referredUser.save();
//       await referredByUser.save();

//       res.status(200).json({ message: 'Successfully referred by user' });
//     } else {
//       res.status(400).json({ message: 'Such a user already was referred' });
//     }

//   } catch (error) {
//     console.error('Error in referral process:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });