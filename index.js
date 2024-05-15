const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./mongo/User'); // Import the User model

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
      bonusSpins: 100,
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
