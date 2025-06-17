const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const friendRequestSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isAccepted: {
        type: Boolean,
        required: false,
        default: false,
    }
});

// Get all excursion invites for a given user
/**
 *  findByUser
 *  @param { User } user
 *  @returns excursionInvites {}
 */
friendRequestSchema.statics.findByUser = async (user) => {
    const incomingRequests = await FriendRequest.find({ receiver: user._id }).exec();

    const outgoingRequests = await FriendRequest.find({ sender: user._id }).exec();

    const friendRequests = {
        "incoming": incomingRequests,
        "outgoing": outgoingRequests,
    };

    return friendRequests;
};

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;