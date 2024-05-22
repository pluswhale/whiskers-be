const express = require('express');
const router = express.Router();
const appControllers = require('../controllers/appControllers')
const giveBonusSpinForReferralFriends = require('../middleware/giveBonusSpinForReferralFriends');
const addFreeSpinIfNeeded = require('../middleware/addFreeSpinIfNeeded');
const checkSpinAvailability = require('../middleware/checkSpinAvailability');

router.post('/login/:userId', giveBonusSpinForReferralFriends, appControllers.loginUser);
router.get('/user/:userId', appControllers.getUserById);
router.post('/spin/:userId', addFreeSpinIfNeeded, checkSpinAvailability, appControllers.getSpinByUser);
router.post('/buy/:userId', appControllers.getBonusSpinsByUser);
router.post('/referral/:referredUserId', appControllers.getReferredFriend);

module.exports = router;
