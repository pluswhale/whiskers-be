const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

// MongoDB Atlas connection URI
const MONGODB_URI = "mongodb+srv://mongouser:5x7vraPGdDiGV8g3@cluster0.3yldtew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB Atlas
async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(MONGODB_URI, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}
run().catch(console.dir);

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});