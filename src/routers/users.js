const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// ----------------------- //
// #region User Management //
// ----------------------- //

/**
 *  Create User
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/create-user
 */
router.post('/user', async (req, res) => {
    try {
        const user = new User(req.body);

        await user.save();
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get User
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/get-user
 */
router.get("/user", auth, async (req, res) => {
    const user = req.user;
    res.status(200).send({ user });
});

/**
 *  Update User
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/update-user
 */
router.patch('/user', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: 'Missing updates' });
    }

    const props = Object.keys(mods);
    const modifiable = ['firstName', 'lastName', 'userName', 'password', 'email'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        return res.status(400).send({ error: 'Invalid updates.' });
    }

    try {
        const user = req.user;
        props.forEach((prop) => user[prop] = mods[prop]);
        await user.save();

        res.status(200).send({ user });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Delete User
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/delete-user
 */
router.delete('/user', auth, async (req, res) => {
    try {
        await User.deleteOne({ _id: req.user._id });

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Users
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/get-users
 */
router.get('/users', auth, async (req, res) => {
    let filter = {};

    if (req.query.q) {
        filter = {
            $or: [
                { userName: { $regex: req.query.q, $options: 'i' } },
                { firstName: { $regex: req.query.q, $options: 'i' } },
                { lastName: { $regex: req.query.q, $options: 'i' } }
            ]
        };
    }

    const users = await User.find(filter,
        { userName: 1, firstName: 1, lastName: 1, _id: 1 }
    )
        .skip(parseInt(req.query.start))
        .limit(parseInt(req.query.limit));

    res.status(200).send(users);
});

/**
 *  Get User By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/get-user-by-id
 */
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(
            { _id: req.params.userId },
            {
                _id: 1,
                userName: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        );

        if (!user) {
            res.status(400).send({ Error: 'Invalid user id' });
            return;
        }

        res.status(200).send({ user });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //

// --------------------------- //
// #region User Authentication //
// --------------------------- //

/**
 *  Sign In
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Authentication/operation/sign-user-in
 */
router.post('/user/sign-in', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.status(200).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Sign Out
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Authentication/operation/sign-user-out
 */
router.post("/user/sign-out", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send({ Error: 'Internal Server Error' });
    }
});

// --------------------------- //
// #endregion                  //
// --------------------------- //

// TODO: Implemenet avatars

// -------------------------- //
// #region User Customization //
// -------------------------- //

// Get Avatars
router.get('/user/avatars', auth, async (req, res) => {
    // get a complete list of avatars from the database
    // append each returned object to an array
    // return the array to the client
});

// -------------------------- //
// #endregion                 //
// -------------------------- //

module.exports = router;