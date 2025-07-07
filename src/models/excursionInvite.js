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

excursionInviteSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const invite = this;

    await mongoose.model('Excursion').updateOne(
        { _id: invite._id },
        { $pull: { invitees: invite.receiver } }
    );

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

excursionInviteSchema.post('create', { document: true, query: false }, async function (next) {
    const invite = this;

    await mongoose.model('User').updateMany(
        {
            $or: [
                { _id: invite.sender },
                { _id: invite.receiver },
            ]
        },
        { $push: { excursionInvites: invite._id } }
    );

    await mongoose.model('Excursion').updateOne(
        { _id: invite.excursion },
        { $push: { invitees: invite.receiver } }
    );

    // do i need to await invite.save() here ?

    next();
});

// ------------ //
// #endregion   //
// ------------ //

const ExcursionInvite = mongoose.model('ExcursionInvite', excursionInviteSchema);

module.exports = ExcursionInvite;