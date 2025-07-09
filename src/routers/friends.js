import mongoose from "mongoose";
import express from "express";
import { FriendRequest } from "../models/friendRequest";
import { User } from "../models/user";
import { auth } from "../middleware/auth";

export const router = new express.Router();

// ----------------------- //
// #region Friend Requests //
// ----------------------- //

/**
 *  Create Friend Request
 *  [docs link]
 */
router.post('/friends/:userId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.userId)) {
            return res.status(400).send("Invalid Id");
        }

        const friend = await User.findById(req.body.userId);

        if (!friend) {
            return res.status(404).send("Requested resource not found.");
        }

        const isExisting = await FriendRequest.find(
            {
                $and: [
                    { sender: req.user._id },
                    { receiver: friend._id },
                ]
            },
        );

        if (isExisting) {
            return res.status(400).send("Bad Request");
        }

        let friendRequest = new FriendRequest({
            "sender": req.user._id,
            "receiver": friend._id
        });
        await friendRequest.save();

        const filter = { _id: friendRequest._id };

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
            }
        ]);

        friendRequest = await pipeline.exec();

        return res.status(201).send({ friendRequest });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get Friend Requests By User
 *  [docs link]
 */
router.get('/friends', auth, async (req, res) => {
    try {
        const filter = { _id: { $in: [...req.user.friendRequests] } };

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

        if (!friendRequests) {
            return res.status(404).send("Requested resource not found.");
        }

        return res.status(200).send({ friendRequests });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Handle Friend Request
 *  [docs link]
 */
router.patch('/friends/requests/:requestId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.requestId)) {
            return res.status(400).send("Invalid Id");
        }

        const friendRequest = await FriendRequest.findById({ _id: req.params.requestId });

        if (!friendRequest) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!friendRequest.receiver.equals(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        const mods = req.body;

        if (mods.length === 0) {
            return res.status(400).send("Missing updates.");
        }

        const props = Object.keys(mods);
        const modifiable = [
            'isAccepted'
        ];

        const isValid = props.every((prop) => modifiable.includes(prop));

        if (!isValid) {
            return res.status(400).send("Invalid updates.");
        }

        props.forEach((prop) => friendRequest[prop] = mods[prop]);
        await friendRequest.save();

        if (req.body.isAccepted) {
            await User.updateMany(
                {
                    $or: [
                        { _id: friendRequest.sender },
                        { _id: friendRequest.receiver },
                    ]
                },
                { $push: { friends: friendRequest.sender } }
            );
        }

        await FriendRequest.deleteOne({ _id: friendRequest._id });

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Delete Friend Request
 *  [docs link]
 */
router.delete('/friends/requests/:requestId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.requestId)) {
            return res.status(400).send("Invalid Id");
        }

        const friendRequest = await FriendRequest.findById({ _id: req.params.requestId });

        if (!friendRequest) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!friendRequest.sender.equals(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        await FriendRequest.deleteOne({ _id: req.params.requestId });

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
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
 *  [docs link]
 */
router.get('/friends', auth, async (req, res) => {
    try {
        const friends = await User.find(
            { _id: { $in: [...req.user.friends] } },
            {
                _id: 1,
                userName: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        );

        if (!friends) {
            return res.status(404).send("Requested resource not found.");
        }

        return res.status(200).send({ friends });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Delete Friend
 *  [docs link]
 */
router.delete('/friends/:userId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.userId)) {
            return res.status(400).send("Invalid Id");
        }

        if (!req.user.friends.includes(req.params.userId)) {
            return res.status(400).send("Bad Request");
        }

        await User.updateOne(
            { _id: req.user._id },
            { $pull: { friends: req.params.userId } }
        );

        await User.updateOne(
            { _id: req.params.userId },
            { $pull: { friends: req.user._id } }
        );

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

// ------------------------- //
// #endregion                //
// ------------------------- //