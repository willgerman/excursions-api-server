const express = require('express');
const FriendRequest = require('../models/friendRequest');
const User = require('../models/user');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = new express.Router();

// ----------------------- //
// #region Friend Requests //
// ----------------------- //

/**
 *  Create Friend Request
 *  https://will-german.github.io/excursions-api-docs/#tag/Friend-Requests/operation/create-friend-request
 */
router.post('/friends/requests', auth, async (req, res) => {
    try {
        const friend = await User.findById(req.body.friendId);

        if (!friend) {
            res.status(400).send({ Error: 'Bad Request' });
            return;
        }

        const data = {
            "sender": req.user._id,
            "receiver": req.body.friendId
        };

        const friendRequest = new FriendRequest(data);
        await friendRequest.save();

        await User.updateOne(
            { _id: friendRequest.sender },
            { $push: { outgoingFriendRequests: friendRequest._id } }
        );

        await User.updateOne(
            { _id: friendRequest.receiver },
            { $push: { incomingFriendRequests: friendRequest._id } }
        );

        const sender = await User.findPublicUser(friendRequest.sender
        );

        const receiver = await User.findPublicUser(friendRequest.receiver);

        if (sender) {
            friendRequest.sender = sender;
        }

        if (receiver) {
            friendRequest.receiver = receiver;
        }

        res.status(201).send({ friendRequest });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Friend Requests By User
 *  https://will-german.github.io/excursions-api-docs/#tag/Friend-Requests/operation/get-friend-requests
 */
router.get('/friends/requests', auth, async (req, res) => {
    try {
        const filter = {
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        };

        const pipeline = FriendRequest.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "sender",
                    as: "sender"
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "receiver",
                    as: "receiver"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "isAccepted": 1,

                    "sender._id": 1,
                    "sender.userName": 1,
                    "sender.firstName": 1,
                    "sender.lastName": 1,
                    "sender.email": 1,

                    "receiver._id": 1,
                    "receiver.userName": 1,
                    "receiver.firstName": 1,
                    "receiver.lastName": 1,
                    "receiver.email": 1,
                }
            },
        ]);

        const friendRequests = await pipeline.exec();

        res.status(200).send({ friendRequests });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Handle Friend Request
 *  https://will-german.github.io/excursions-api-docs/#tag/Friend-Requests/operation/handle-friend-request
 */
router.patch('/friends/requests/:requestId', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: "Missing updates" });
        return;
    }

    const props = Object.keys(mods);
    const modifiable = ['isAccepted'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: 'Invalid updates' });
        return;
    }

    try {
        const friendRequest = await FriendRequest.findById({ _id: req.params.requestId });

        if (!friendRequest) {
            res.status(400).send({ Error: 'Invalid friendRequest id' });
            return;
        }

        // if (friendRequest.receiver !== req.user._id) {
        //     res.status(403).send({ Error: "Forbidden" });
        //     return;
        // }

        props.forEach((prop) => friendRequest[prop] = mods[prop]);
        await friendRequest.save();

        if (req.body.isAccepted) {
            await User.updateOne(
                { _id: friendRequest.sender },
                { $push: { friends: friendRequest.receiver } }
            );

            await User.updateOne(
                { _id: friendRequest.receiver },
                { $push: { friends: friendRequest.sender } }
            );
        }

        await User.updateOne(
            { _id: friendRequest.sender },
            { $pull: { outgoingFriendRequests: friendRequest._id } }
        );

        await User.updateOne(
            { _id: friendRequest.receiver },
            { $pull: { incomingFriendRequests: friendRequest._id } }
        );

        await FriendRequest.deleteOne({ _id: friendRequest._id });

        const sender = await User.findPublicUser(friendRequest.sender
        );

        const receiver = await User.findPublicUser(friendRequest.receiver);

        if (sender) {
            friendRequest.sender = sender;
        }

        if (receiver) {
            friendRequest.receiver = receiver;
        }

        res.status(200).send({ friendRequest });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Delete Friend Request
 *  https://will-german.github.io/excursions-api-docs/#tag/Friend-Requests/operation/delete-friend-request
 */
router.delete('/friends/requests/:requestId', auth, async (req, res) => {
    try {
        const friendRequest = await FriendRequest.findById(req.params.requestId);

        if (!friendRequest) {
            res.status(400).send({ Error: 'Bad Request' });
            return;
        }

        // if (friendRequest.sender !== req.user._id) {
        //     res.status(403).send({ Error: 'Forbidden' });
        //     return;
        // }

        await User.updateOne(
            { _id: req.user._id },
            { $pull: { outgoingFriendRequests: req.params.requestId } }
        );

        await User.updateOne(
            { _id: friendRequest.receiver },
            { $pull: { incomingFriendRequests: req.params.requestId } }
        );

        await FriendRequest.deleteOne({ _id: req.params.requestId });

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //

// ------------------------- //
// #region Friend Management //
// ------------------------- //

/**
 *  Get Friends By User
 *  https://will-german.github.io/excursions-api-docs/#tag/Friends/operation/get-friends
 */
router.get('/friends', auth, async (req, res) => {
    try {
        const friends = await User.find(
            { friends: { $all: [req.user._id] } },
            {
                _id: 1,
                userName: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        );

        res.status(200).send({ friends });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Delete Friend
 *  https://will-german.github.io/excursions-api-docs/#tag/Friends/operation/remove-friend
 */
router.delete('/friends/:friendId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.friendId)) {
            res.status(400).send({ Error: "Invalid friend id" });
            return;
        }

        if (!req.user.friends.includes(req.params.friendId)) {
            res.status(400).send({ Error: "friendId missing from user's friends list." });
            return;
        }

        await User.updateOne(
            { _id: req.user._id },
            { $pull: { friends: req.params.friendId } }
        );

        await User.updateOne(
            { _id: req.params.friendId },
            { $pull: { friends: req.params.friendId } }
        );

        const friend = await User.getPublicProfile(req.params.friendId);

        if (friend) {
            res.status(200).send({ friend });
        }

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ------------------------- //
// #endregion                //
// ------------------------- //

module.exports = router;