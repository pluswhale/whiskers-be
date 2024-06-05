const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  unclaimedWhisks: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

const User = mongoose.model('Player', userSchema);

module.exports = User;