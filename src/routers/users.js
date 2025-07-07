const mongoose = require('mongoose');
const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const utils = require('../utils'); // determine a better approach to util file(s) and importing them

const router = new express.Router();

// ----------------------- //
// #region User Management //
// ----------------------- //

/**
 *  Create User
 *  [docs link]
 */
router.post('/user', async (req, res) => {
    try {
        // TODO: Write a utility function to determine the similarity of two strings and return the percentage as a decimal value. If the similarity of the password and other strings (userName, firstName, lastName) is above 50% in any capacity, reject the request.

        const user = new User(req.body);
        await user.save();

        const token = await user.generateAuthToken();

        return res.status(201).send({ user, token });
    } catch (error) {
        console.log(error);
        return res.status(400).send("Unable to create a new user.");
    }
});

/**
 *  Get User
 *  [docs link]
 */
router.get("/user", auth, async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).send({ user });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Update User
 *  [docs link]
 */
router.patch('/user', auth, async (req, res) => {
    try {

        // TODO: Write a utility function to determine the similarity of two strings and return the percentage as a decimal value. If the similarity of the password and other strings (userName, firstName, lastName) is above 50% in any capacity, reject the request.

        const mods = req.body;

        if (mods.length === 0) {
            return res.status(400).send("Missing updates.");
        }

        const props = Object.keys(mods);
        const modifiable = [
            'userName',
            'firstName',
            'lastName',
            'email',
            'password'
        ];

        const isValid = props.every((prop) => modifiable.includes(prop));

        if (!isValid) {
            return res.status(400).send("Invalid updates.");
        }

        const user = req.user;
        props.forEach((prop) => user[prop] = mods[prop]);

        await user.save();

        return res.status(200).send({ user });
    } catch (error) {
        console.log(error);
        return res.status(400).send("Unable to update user.");
    }
});

/**
 *  Delete User
 *  [docs link]
 */
router.delete('/user', auth, async (req, res) => {
    try {
        await User.deleteOne(
            { _id: req.user._id }
        );

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get Users
 *  [docs link]
 *  TODO: Refactor
 */
router.get('/users', auth, async (req, res) => {
    try {
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

        return res.status(200).send({ users });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get User By Id
 *  [docs link]
 */
router.get('/user/:userId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.userId)) {
            return res.status(400).send("Invalid Id");
        }

        const user = await User.find(
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
            return res.status(404).send("Requested resource not found.");
        }

        return res.status(200).send({ user });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
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
 *  [docs link]
 */
router.post('/user/sign-in', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);

        const token = await user.generateAuthToken();

        return res.status(200).send({ user, token });
    } catch (error) {
        console.log(error);
        return res.status(400).send(error.message);
    }
});

/**
 *  Sign Out
 *  [docs link]
 */
router.post("/user/sign-out", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

// --------------------------- //
// #endregion                  //
// --------------------------- //

module.exports = router;