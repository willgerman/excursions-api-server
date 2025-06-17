const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const excursionSchema = new Schema({
    name: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 64,
        // TODO: isEmpty validator
    },
    description: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 255,
        // TODO: isEmpty validator
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        // validate bson
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        // validate bson
    }],
    trips: [{
        type: Schema.Types.ObjectId,
        ref: 'Trip',
        required: false,
        // validate bson
    }],
    isComplete: {
        type: Boolean,
        required: false,
        default: false,
    },
},
    { timestamps: true });

const Excursion = mongoose.model('Excursion', excursionSchema);

module.exports = Excursion;