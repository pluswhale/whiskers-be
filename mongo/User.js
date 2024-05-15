const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  unclaimedTokens: {
    type: Number,
    default: 0
  },
  spinsAvailable: {
    type: Number,
    default: 2
  },
  bonusSpins: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Define a method to add bonus spins for a valid referral
userSchema.methods.addBonusSpinsForReferral = async function() {
  if (this.referredUsers.length >= 2) {
    this.bonusSpins += 3;
    await this.save();
  }
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;