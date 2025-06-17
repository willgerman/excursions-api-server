const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const excursionInviteSchema = new Schema({
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
    },
    excursion: {
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        required: true,
    }
});

// Get all excursion invites for a given user
/**
 *  findByUser
 *  @param { User } user
 *  @returns excursionInvites {}
 */
excursionInviteSchema.statics.findByUser = async (user) => {
    const incomingInvites = await ExcursionInvite.find({ receiver: user._id }).exec();

    const outgoingInvites = await ExcursionInvite.find({ sender: user._id }).exec();

    const excursionInvites = {
        "incoming": incomingInvites,
        "outgoing": outgoingInvites
    };

    return excursionInvites;
};

const ExcursionInvite = mongoose.model('ExcursionInvite', excursionInviteSchema);

module.exports = ExcursionInvite;