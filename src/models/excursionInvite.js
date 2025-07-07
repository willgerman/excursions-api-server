const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const excursionInviteSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
},
    { timestamps: true }
);

// --------------- //
// #region Methods //
// --------------- //

excursionInviteSchema.methods.toJSON = function () {
    const invite = this;
    const inviteObject = invite.toObject();

    delete inviteObject.__v;

    return inviteObject;
};

// --------------- //
// #endregion      //
// --------------- //

// --------------- //
// #region Statics //
// --------------- //

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

// --------------- //
// #endregion      //
// --------------- //

// ----------- //
// #region Pre //
// ----------- //

// TODO: pre save add receiver to excursion's invitee list.

excursionInviteSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const invite = this;

    await mongoose.model('User').updateMany(
        {
            $or: [
                { _id: invite.sender },
                { _id: invite.receiver },
            ]
        },
        { $pull: { excursionInvites: invite._id } }
    );

    next();
});

// ----------- //
// #endregion  //
// ----------- //

// ------------ //
// #region Post //
// ------------ //

// ------------ //
// #endregion   //
// ------------ //

const ExcursionInvite = mongoose.model('ExcursionInvite', excursionInviteSchema);

module.exports = ExcursionInvite;