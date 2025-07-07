const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('userName must not be empty.');
            }
        }
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('firstName must not be empty.');
            }
        }
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('lastName must not be empty.');
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        validate(value) {
            const regex = new RegExp("[A-Za-z0-9]");

            if (!regex.test(value)) {
                throw new Error("password must contain at least one uppercase letter, lowercase letter, and number.");
            }
        }
    },
    trips: [{
        type: Schema.Types.ObjectId,
        ref: 'Trip',
        required: false,
    }],
    excursions: [{
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        required: false,
    }],
    excursionInvites: [{
        type: Schema.Types.ObjectId,
        ref: 'ExcursionInvite',
        required: false,
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    }],
    friendRequests: [{
        type: Schema.Types.ObjectId,
        ref: 'FriendRequest',
        required: false,
    }],
    tokens: [{
        token: {
            type: String,
            required: false
        }
    }],
},
    { timestamps: true }
);

// --------------- //
// #region Methods //
// --------------- //

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;

    return userObject;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

// --------------- //
// #endregion      //
// --------------- //

// --------------- //
// #region Statics //
// --------------- //

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email });

    if (!user) {
        throw new Error("Email or password is incorrect.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Email or password is incorrect.");
    }

    return user;
};

// --------------- //
// #endregion      //
// --------------- //

// ----------- //
// #region Pre //
// ----------- //

userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});


userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const user = this;

    // TODO: Delete all documents related to this user from the database.

    // await mongoose.model('Task').deleteMany({ owner: user._id });
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

const User = mongoose.model('User', userSchema);

module.exports = User;