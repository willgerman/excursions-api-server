const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const tripSchema = new Schema({
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
    park: {
        type: String,
        unique: false,
        required: false,
        trim: true,
        validate(value) {
            if (!validator.isUUID(value, 4)) {
                throw new Error("park must be a valid UUIDv4");
            }
        }
    },
    campground: {
        type: String,
        unique: false,
        required: false,
        trim: true,
        validate(value) {
            if (!validator.isUUID(value, 4)) {
                throw new Error("campground must be a valid UUIDv4");
            }
        }
    },
    thingstodo: [{
        type: String,
        unique: false,
        required: false,
        trim: true,
        validate(value) {
            if (!validator.isUUID(value, 4)) {
                throw new Error("Id is not a valid UUID.");
            }
        }
    }],
    startDate: {
        type: Date,
        required: true,
        validate(value) {
            if (!validator.isISO8601(value.toISOString())) {
                throw new Error("startDate must be ISO8601 format.");
            }
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate(value) {
            if (!validator.isISO8601(value.toISOString())) {
                throw new Error("endDate must be ISO8601 format.");
            }
        }
    },
},
    { timestamps: true }
);

// --------------- //
// #region Methods //
// --------------- //

tripSchema.methods.toJSON = function () {
    const trip = this;
    const tripObject = trip.toObject();

    delete tripObject.__v;

    return tripObject;
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

tripSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const trip = this;

    await mongoose.model('Excursion').updateMany(
        { trips: trip._id },
        { $pull: trip._id }
    );

    await mongoose.model('User').updateOne(
        { _id: trip.host },
        { $pull: { trips: trip._id } }
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

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;