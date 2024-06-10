const express = require('express');
const router = express.Router();
const appControllers = require('../controllers/spin-and-earn/appControllers')
const plinkoControllers = require('../controllers/plinko/appControllers')
const giveBonusSpinForReferralFriends = require('../middleware/giveBonusSpinForReferralFriends');
const addFreeSpinIfNeeded = require('../middleware/addFreeSpinIfNeeded');
const checkSpinAvailability = require('../middleware/checkSpinAvailability');
const authenticateAdmin = require('../middleware/adminAuthenrticate');

//spin and earn
router.get('/spin-and-earn/user/:userId', appControllers.getUserById);
router.get('/spin-and-earn/snapshot', appControllers.getSnapshot);
router.post('/spin-and-earn/snapshot/update', authenticateAdmin, appControllers.updateSnapshot); // it's only for admin
router.get('/spin-and-earn/unclaimed-whisks/', appControllers.getUsersUnclaimedWhisks);
router.post('/spin-and-earn/claim-whisks/:userId', appControllers.claimUserWhisks);
router.post('/spin-and-earn/login/:userId', giveBonusSpinForReferralFriends, appControllers.loginUser);
router.post('/spin-and-earn/ton-address/:userId', appControllers.saveTonAddress); // save ton address
router.post('/spin-and-earn/spin/:userId', addFreeSpinIfNeeded, checkSpinAvailability, appControllers.getSpinByUser);
router.post('/spin-and-earn/buy/:userId', appControllers.getBonusSpinsByUser);
router.post('/spin-and-earn/referral/:referredUserId', appControllers.getReferredFriend);

//plinko
router.post('/plinko/login/:userId', plinkoControllers.loginUser);
router.get('/plinko/user/:userId', plinkoControllers.getUserById);
router.post('/plinko/points/:userId', plinkoControllers.updateBalance);
router.post('/plinko/balance/topup/:userId', plinkoControllers.topupBalance);
router.post('/plinko/balance/withdraw/:userId', plinkoControllers.withdrawBalance);

module.exports = router;
