const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReferredUserSchema = new Schema({
  isAccrued: {
    type: Boolean,
    default: false
  },
  id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

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
  countSpins: {
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
  referredUsers: [ReferredUserSchema],
  lastSpinTime: [{
    type: Date,
    default: Date.now
  }]
}, { timestamps: true });

userSchema.methods.addBonusSpinsForReferral = async function() {
  if (this.referredUsers.length >= 2) {
    this.bonusSpins += 3;
    await this.save();
  }
};

userSchema.methods.addFreeSpin = function() {
  if (this.spinsAvailable < 2) {
    this.spinsAvailable += 1;
  }
  if (this.lastSpinTime.length >= 2) {
    this.lastSpinTime.shift(); // Remove the oldest time if length is >= 2
  }
  this.lastSpinTime.push(Date.now());
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;