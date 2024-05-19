const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./mongo/User'); // Import the User model
const addFreeSpinIfNeeded = require('./middleware/addFreeSpinIfNeeded');
const checkSpinAvailability = require('./middleware/checkSpinAvailability');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://mongouser:5x7vraPGdDiGV8g3@cluster0.3yldtew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Create the first user
    const newUser = new User({
      userId: '1', // Replace with an actual user ID
      unclaimedTokens: 0,
      spinsAvailable: 2,
      bonusSpins: 0,
      referralCode: 'unique_referral_code', // Replace with a unique referral code
      referredBy: null, // If this is the first user, there is no referrer
      referredUsers: [] // No referred users for the first user
    });

    await newUser.save();
    console.log('First user created successfully!');
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login/:userId', async (req, res) => {
  const userId = req.params.userId; // Assuming userId is passed in the request body

  try {
    const user = await User.findOne({ userId });


    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Logic to authenticate the user

    // After successful authentication, proceed with the free spin check
    await addFreeSpinIfNeeded(req, res, async () => {
      // Login response logic here
      res.status(200).json({ message: 'Login successful', user });
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
    // Find the user by ID in the database
    const user = await User.findOne({ userId });

    if (!user) {
      // If user not found, return 404 Not Found status
      return res.status(404).json({ error: 'User not found' });
    }

    // If user found, return the user data
    res.json(user);
  } catch (error) {
    // If an error occurs, return 500 Internal Server Error status
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
