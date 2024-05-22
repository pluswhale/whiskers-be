const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./mongo/User'); // Import the User model
const addFreeSpinIfNeeded = require('./middleware/addFreeSpinIfNeeded');
const checkSpinAvailability = require('./middleware/checkSpinAvailability');
const giveBonusSpinForReferralFriends = require('./middleware/giveBonusSpinForReferralFriends');
const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const token = '6790130833:AAFm1XC61QQ2nbnMNAGUgknZ1J0YDQS385E'; // replace with your bot token
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Play the Game',
            web_app: { url: 'https://pluswhale.github.io/whiskers' } // replace with your web app URL
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, 'Click the button below to play the game:', options);
});

const uri = "mongodb+srv://mongouser:5x7vraPGdDiGV8g3@cluster0.3yldtew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login/:userId', giveBonusSpinForReferralFriends, async (req, res) => {
  const userId = req.params.userId;
  const referal = uuidv4();

  try {
    const user = await User.findOne({ userId });

    let newUser;

    if (!user) {
      const userObject = new User({
        userId: userId, 
        unclaimedTokens: 0,
        spinsAvailable: 2,
        countSpins: 0,
        bonusSpins: 0,
        referralCode: referal,
        referredBy: null, 
        referredUsers: []
      });
      newUser =  await userObject.save();
    }

    // After successful authentication, proceed with the free spin check
    await addFreeSpinIfNeeded(req, res, async () => {
      res.status(200).json({ message: 'Login successful', user: user || newUser });
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a route to get a user by ID
app.get('/user/:userId', async (req, res) => {
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
});

app.post('/spin/:userId', addFreeSpinIfNeeded, checkSpinAvailability, async (req, res) => {
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

    user.unclaimedTokens += winScore;

    if (isFreeSpin) {
      user.spinsAvailable -= 1;
    } else {
      user.bonusSpins -= 1;
    }

    await user.save();

    res.status(200).json({ message: 'Spin successful' });

  } catch (error) {
    console.error('Error spinning wheel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/buy/:userId', async (req, res) => {
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
});

app.post('/referral/:referredUserId', async (req, res) => {
  try {
    const referredUserId = req.params.referredUserId;
    const { referredById } = req.body;

    const referredUser = await User.findOne({ userId: referredUserId });
    const referredByUser = await User.findOne({ userId: referredById });

    if (!referredUser) {
      return res.status(404).json({ error: 'Referred user not found' });
    }

    if (!referredByUser) {
      return res.status(404).json({ error: 'Referring user not found' });
    }

    const isAlreadyReferred = referredByUser?.referredUsers?.some((currentReferredUser) => currentReferredUser.id.equals(referredUser._id));

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
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
