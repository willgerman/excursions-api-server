import mongoose, { mongo } from "mongoose";

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
        required: true,
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

// --------------- //
// #endregion      //
// --------------- //

// ----------- //
// #region Pre //
// ----------- //

// NOTE: This will function logically, although the question becomes: Should conditional logic like this be kept in a router or performed using middleware hooks? I personally think keeping this type of logic in the router makes it simpler to read, simpler to debug, and allows the developer to constrain built in middleware hooks to things like cascading deletions or data hashing.

// excursionInviteSchema.pre('save', { document: true, query: false }, async function (next) {
//     const invite = this;

//     if (invite.isModified('isAccepted')) {
//         if (invite.isAccepted) {
//             await mongoose.model('User').updateOne(
//                 { _id: invite.receiver },
//                 { $push: { excursions: invite.excursion } }
//             );

//             await mongoose.model('Excursion').updateOne(
//                 { _id: invite.excursion },
//                 { $push: { participants: invite.receiver } }
//             );
//         }
//     }

//     next();
// });

excursionInviteSchema.pre('deleteOne',
    { document: true, query: false },
    async function (next) {
        const invite = this;

        await mongoose.model('Excursion').updateOne(
            { _id: invite._id },
            { $pull: { invitees: invite.receiver } }
        );

        await mongoose.model('User').updateMany(
            {
                _id: {
                    $in: [
                        invite.sender,
                        invite.receiver
                    ]
                }
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

    next();
});

// ------------ //
// #endregion   //
// ------------ //

export const ExcursionInvite = mongoose.model('ExcursionInvite', excursionInviteSchema);