require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appRoutes = require('./routes/appRoutes');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const PORT = process.env.PORT || 3000;
const User = require('./mongo/spin-and-earn/User');
const Snapshot = require('./mongo/spin-and-earn/Snapshot');

app.use(express.json());
app.use(cors());

const token = process.env.TELEGRAM_BOT_TOKEN; // replace with your bot token
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

const uri = process.env.MONGODB_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //init snapshot
    const snapshot = await Snapshot.findOne({ snapShotId: 1 });

    if (!snapshot) {

      new Snapshot({
        airdropCell: 1,
        campaignNumber: 1
      }).save();

    }

    // init admin user
    const adminUserId = 1;

    let adminUser = await User.findOne({ userId: adminUserId });

    if (!adminUser) {
      // Create the admin user
      const userObject = new User({
        userId: adminUserId,
        points: 0,
        unClaimedWhisks: 0,
        userTonAddress: null,
        spinsAvailable: 2,
        countSpins: 0,
        bonusSpins: 0,
        referralCode: 'admin',
        referredBy: null,
        referredUsers: []
      });

      adminUser = await userObject.save();

    }

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.use([appRoutes]); // app routes here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
