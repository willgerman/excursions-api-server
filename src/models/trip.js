const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const tripSchema = new Schema({
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 64,
    },
    description: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 255,
    },
    park: {
        type: String,
        unique: false,
        required: false,
        trim: true,
        validate(value) {
            if (!validator.isUUID(value, 4)) {
                throw new Error("Id is not a valid UUID.");
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
                throw new Error("Id is not a valid UUID.");
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
                throw new Error("Date is not in ISO8601 format.");
            }
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate(value) {
            if (!validator.isISO8601(value.toISOString())) {
                throw new Error("Date is not in ISO8601 format.");
            }
        }
    },
},
    { timestamps: true });

// Get all trips for a given user
/**
 *  findByUser
 *  @param { User } user
 *  @returns [{ trip }]
 */
tripSchema.statics.findByUser = async (user) => {
    const trips = await Trip.find({ host: user._id }).exec();

    return trips;
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;