const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema({
    snapShotId: {
        type: Number,
        default: 1,
    },
    airdropCell: {
        type: Number,
        default: 0
    },
    campaignNumber: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Snapshot = mongoose.model('Snapshot', snapshotSchema);

module.exports = Snapshot;