const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const friendRequestSchema = new Schema({
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
    }
},
    { timestamps: true }
);

// --------------- //
// #region Methods //
// --------------- //

friendRequestSchema.methods.toJSON = function () {
    const request = this;
    const requestObject = request.toObject();

    delete requestObject.__v;

    return requestObject;
};

// --------------- //
// #endregion      //
// --------------- //

// --------------- //
// #region Statics //
// --------------- //

// --------------- //
// #endregion      //
// --------------- //

// ----------- //
// #region Pre //
// ----------- //

friendRequestSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const request = this;

    await mongoose.model('User').updateMnay(
        {
            $or: [
                { _id: request.sender },
                { _id: request.receiver },
            ]
        },
        { $pull: { friendRequests: invite._id } }
    );

    next();
});

// ----------- //
// #endregion  //
// ----------- //

// ------------ //
// #region Post //
// ------------ //

friendRequestSchema.post('create', { document: true, query: false }, async function (next) {
    const request = this;

    await mongoose.model('User').updateMany(
        {
            $or: [
                { _id: request.sender },
                { _id: request.receiver },
            ]
        },
        { $push: { friendRequests: request._id } }
    );

    // do i need to await invite.save() here ?

    next();
});

// ------------ //
// #endregion   //
// ------------ //

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;