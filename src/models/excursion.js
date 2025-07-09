import mongoose from "mongoose";
import validator from "validator";

const Schema = mongoose.Schema;

const excursionSchema = new Schema({
    name: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 64,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error("name must not be empty.");
            }
        }
    },
    description: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 255,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error("description must not be empty.");
            }
        }
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: false,
    }],
    invitees: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: false,
    }],
    trips: [{
        type: Schema.Types.ObjectId,
        ref: 'Trip',
        unique: true,
        required: false,
    }],
    isPublic: {
        type: Boolean,
        required: false,
        default: false,
    },
    isComplete: {
        type: Boolean,
        required: false,
        default: false,
    },
},
    { timestamps: true }
);

// --------------- //
// #region Methods //
// --------------- //

excursionSchema.methods.toJSON = function () {
    const excursion = this;
    const excursionObject = excursion.toObject();

    delete excursionObject.__v;

    return excursionObject;
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

// pre save to order trips and potentially set start/end dates

excursionSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const excursion = this;

    await mongoose.model('User').updateMany(
        {
            $or: [
                { _id: excursion.host },
                { _id: { $in: [...excursion.participants] } },
            ]
        },
        { $pull: { excursions: excursion._id } }
    );

    // await mongoose.model('User').updateOne(
    //     { _id: excursion.host },
    //     { $pull: { excursions: excursion._id } }
    // );

    // await mongoose.model('User').updateMany(
    //     { _id: { $in: [...excursion.participants] } },
    //     { $pull: { excursions: excursion._id } }
    // );

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

export const Excursion = mongoose.model('Excursion', excursionSchema);