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
  points: {
    type: Number,
    default: 0
  },
  unclaimedWhisks: {
    type: Number,
    default: 0
  },
  userTonAddress: {
    type: String,
    default: null
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

const User = mongoose.model('User', userSchema);

module.exports = User;